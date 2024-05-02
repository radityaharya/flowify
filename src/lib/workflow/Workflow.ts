/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */

import { Base } from "./Base";
import Combiner from "./Combiner";
import Filter from "./Filter";
import Library from "./Library";
import Order from "./Order";
import Playlist from "./Playlist";
import Selector from "./Selector";
import Utility from "./Utility";

import { Logger } from "../log";

import { WorkflowObjectSchema } from "~/schemas";

const log = new Logger("workflow");

import type { Workflow as WorkflowType } from "./types/base";

export const operations: WorkflowType.Operations = {
  Filter,
  Combiner,
  Utility,
  Order,
  Playlist,
  Library,
  Selector,
};
export class Runner extends Base {
  async fetchSources(
    operation: Workflow.Operation,
    sourceValues: Map<string, any>,
    workflow: Workflow.WorkflowObject,
    controller: AbortController,
    operationCallback?: (operationId: string, data: any) => Promise<string>,
  ) {
    const sources = [] as SpotifyApi.PlaylistTrackObject[];
    for (const source of operation.sources) {
      if (sourceValues.has(source)) {
        log.debug(`FOUND CACHED SOURCE`);
        sources.push(
          sourceValues.get(source) as SpotifyApi.PlaylistTrackObject,
        );
      } else if (sourceValues.has(`${source}.tracks`)) {
        log.debug(`FOUND CACHED SOURCE`);
        sources.push(
          sourceValues.get(
            `${source}.tracks`,
          ) as SpotifyApi.PlaylistTrackObject,
        );
      } else {
        log.debug(`RUNNING SOURCE ${source}`);
        const sourceOperation = workflow.operations.find(
          (op) => op.id === source,
        );
        if (sourceOperation) {
          const result = await this.runOperation(
            source,
            sourceValues,
            workflow,
            controller,
            operationCallback,
          );
          sources.push(result as SpotifyApi.PlaylistTrackObject);
        } else {
          log.error(
            `Source ${source} not found in sourceValues or operations.`,
          );
        }
      }
    }
    return sources;
  }

  /**
   * Runs the specified operation in the workflow.
   * @param operationId - The ID of the operation to run.
   * @param sourceValues - A map of source values.
   * @param workflow - The workflow object.
   * @returns A Promise that resolves to the result of the operation.
   */
  async runOperation(
    operationId: string,
    sourceValues: Map<string, any>,
    workflow: Workflow.WorkflowObject,
    controller: AbortController,
    operationCallback?: (operationId: string, data: any) => Promise<string>,
  ) {
    const operation = workflow.operations.find((op) => op.id === operationId);
    if (!operation) {
      log.error(`Operation ${operationId} not found.`);
      return;
    }

    if (controller.signal.aborted) {
      throw new Error(`Operation timed out`);
    }

    const sources = await this.fetchSources(
      operation,
      sourceValues,
      workflow,
      controller,
      operationCallback,
    );

    // Split the operation type into class name and method name
    const [className, methodName] = operation.type.split(".") as [
      keyof WorkflowType.Operations,
      keyof WorkflowType.Operations[keyof WorkflowType.Operations],
    ];

    const operationClass = operations[className];

    if (workflow.dryrun) {
      log.info("DRYRUN!");
      operation.params.dryrun = true;
    }

    const startTime = new Date();
    const result = await operationClass[methodName](
      this.spClient,
      sources,
      operation.params,
    );

    sourceValues.set(operationId, result);
    const finishTime = new Date();
    if (operationCallback) {
      const res = await operationCallback(operationId, {
        startedAt: startTime,
        completedAt: finishTime,
        executionTime: finishTime.getTime() - startTime.getTime(),
        operation,
      });
      if (res !== "ok") {
        log.error(`Operation callback failed for operation ${operationId}`);
      }
      log.info(`${operation.type} completed`);
    }
    this.operationValues.set(operation.id, result);
    return result;
  }

  /**
   * Sorts the operations in the workflow based on their dependencies.
   *
   * @param workflow - The workflow to sort the operations for.
   * @returns An array of sorted operations.
   */
  sortOperations(workflow: Workflow.WorkflowObject) {
    log.info("Sorting operations...");
    const sortedOperations = [] as Workflow.Operation[];
    const operations = [...workflow.operations] as Workflow.Operation[];

    let hasLoop = false;
    const visited = new Set();
    const recStack = new Set();

    function detectLoop(operationId: string, operationsMap: Map<string, any>) {
      visited.add(operationId);
      recStack.add(operationId);

      const operation = operationsMap.get(operationId) as Workflow.Operation;
      if (operation?.sources) {
        for (const source of operation.sources) {
          if (!visited.has(source) && detectLoop(source, operationsMap)) {
            return true;
          } else if (recStack.has(source)) {
            return true;
          }
        }
      }

      recStack.delete(operationId);
      return false;
    }

    // Create a map for quick lookup
    const operationsMap = new Map() as Map<string, Workflow.Operation>;
    for (const operation of operations) {
      operationsMap.set(operation.id, operation);
    }

    // Check each operation for loops
    for (const operation of operations) {
      if (detectLoop(operation.id, operationsMap)) {
        hasLoop = true;
        break;
      }
    }

    if (hasLoop) {
      throw new Error(
        "Loop detected in workflow at operation: " +
          JSON.stringify(operationsMap.get(Array.from(recStack)[0] as string)),
      );
    }

    let iterationCount = 0;
    const maxIterations = operations.length * 2;

    while (operations.length > 0) {
      if (iterationCount++ > maxIterations) {
        throw new Error(
          "Exceeded maximum iterations. There might be a circular dependency in the operations.",
        );
      }
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i]!;
        if (
          operation.sources.every((source) =>
            sortedOperations.find((op) => op.id === source),
          )
        ) {
          sortedOperations.push(operation);
          operations.splice(i, 1);
          break;
        }
      }
    }

    return sortedOperations;
  }

  /**
   * Runs the given workflow.
   *
   * @param workflow - The workflow to be executed.
   * @returns The result of the workflow execution.
   * @throws Error if the workflow is invalid.
   */
  async runWorkflow(
    workflow: Workflow.WorkflowObject,
    timeoutAfter = 20000,
    operationCallback?: (operationId: string, data: any) => Promise<string>,
  ) {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort(
        new Error(`Operation timed out after ${timeoutAfter / 1000} seconds`),
      );
    }, timeoutAfter);

    try {
      const workflowResult = await this.runWorkflowInternal(
        workflow,
        controller,
        operationCallback,
      );
      clearTimeout(timeout);
      return workflowResult;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error(`Workflow timed out`);
      }
      throw error;
    }
  }

  async runWorkflowInternal(
    workflow: Workflow.WorkflowObject,
    controller: AbortController,
    operationCallback?: (operationId: string, data: any) => Promise<string>,
  ) {
    const sortedOperations = this.sortOperations(workflow);
    log.info(
      "sortedOperations",
      sortedOperations.map((op) => op.id),
    );

    workflow.operations = sortedOperations;

    workflow = WorkflowObjectSchema.parse(workflow);

    const sourceValues = new Map();
    const runOperations = new Set();
    const final: any[] = [];

    for (const operation of sortedOperations) {
      if (controller.signal.aborted) {
        throw new Error(`Workflow timed out`);
      }

      if (!runOperations.has(operation.id)) {
        const res = await this.runOperation(
          operation.id,
          sourceValues,
          workflow,
          controller,
          operationCallback,
        );
        final.push(res);
        runOperations.add(operation.id);
      }
    }

    return final.filter((f) => f.id);
  }
}
