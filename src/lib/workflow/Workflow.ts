import { WorkflowObjectSchema } from "@schema";
import { type SpotifyApi } from "@spotify/web-api-ts-sdk";

import { Logger } from "../log";
import { Base, type UserCredential } from "./Base";
import Combiner from "./Combiner";
import Filter from "./Filter";
import Library from "./Library";
import Order from "./Order";
import Playlist from "./Playlist";
import Selector from "./Selector";
import Utility from "./Utility";

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
  private sourceValues: Map<string, WeakRef<any>>;
  private operationResults: WeakMap<object, any>;

  constructor(userCredential: UserCredential, spClient?: SpotifyApi) {
    super(userCredential, spClient);
    this.sourceValues = new Map();
    this.operationResults = new WeakMap();
  }

  private disposeOperationResult(result: any) {
    if (result && typeof result === "object") {
      Object.keys(result).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          result[key] = null;
        }
      });
    }
  }

  private cleanup() {
    for (const [, value] of this.sourceValues) {
      this.disposeOperationResult(value);
    }
    for (const [, value] of this.operationValues) {
      this.disposeOperationResult(value);
    }
    this.sourceValues.clear();
    this.operationValues.clear();
  }

  async fetchSources(
    operation: Workflow.Operation,
    workflow: Workflow.WorkflowObject,
    controller: AbortController,
    operationCallback?: (operationId: string, data: any) => Promise<string>,
  ) {
    const sources = [] as SpotifyApi.PlaylistTrackObject[];
    for (const source of operation.sources) {
      const weakRef =
        this.sourceValues.get(source) ||
        this.sourceValues.get(`${source}.tracks`);
      if (weakRef) {
        const cachedSource = weakRef.deref();
        if (cachedSource) {
          log.debug(`FOUND CACHED SOURCE`);
          sources.push(cachedSource as SpotifyApi.PlaylistTrackObject);
          continue;
        }
      }

      log.debug(`RUNNING SOURCE ${source}`);
      const sourceOperation = workflow.operations.find(
        (op) => op.id === source,
      );
      if (sourceOperation) {
        const result = await this.runOperation(
          source,
          workflow,
          controller,
          operationCallback,
        );
        sources.push(result as SpotifyApi.PlaylistTrackObject);
      } else {
        log.error(`Source ${source} not found in sourceValues or operations.`);
      }
    }
    return sources;
  }

  async runOperation(
    operationId: string,
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
      workflow,
      controller,
      operationCallback,
    );

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

    this.sourceValues.set(operationId, new WeakRef(result));
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
    this.operationResults.set(operation, result);

    // Clear sources array to help with garbage collection
    sources.length = 0;

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
    } finally {
      this.cleanup();
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

    const runOperations = new Set();
    const final: any[] = [];

    for (const operation of sortedOperations) {
      if (controller.signal.aborted) {
        throw new Error(`Workflow timed out`);
      }

      if (!runOperations.has(operation.id)) {
        const res = await this.runOperation(
          operation.id,
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
