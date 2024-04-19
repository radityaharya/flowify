/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */

import { Base } from "./Base";
import type { AccessToken } from "./Base";
import Filter from "./Filter";
import Combiner from "./Combiner";
import Utility from "./Utility";
import Order from "./Order";
import Playlist from "./Playlist";
import Library from "./Library";

import { Logger } from "../log";

const log = new Logger("workflow");
export const operationParamsTypesMap = {
  "Filter.filter": {
    filterKey: { type: "string", required: true },
    filterValue: { type: "string", required: true },
  },
  "Filter.dedupeTracks": {},
  "Filter.dedupeArtists": {},
  "Filter.match": {
    matchKey: { type: "string", required: true },
    matchValue: { type: "string", required: true },
  },
  "Filter.limit": {
    limit: { type: "number", required: true },
  },
  "Combiner.push": {},
  "Combiner.alternate": {},
  "Utility.save": {},
  "Utility.removeKeys": {
    keys: { type: "string[]", required: true },
  },
  "Utility.includeOnlyKeys": {
    keys: { type: "string[]", required: true },
  },
  "Utility.summary": {},
  "Order.sort": {
    sortKey: { type: "string", required: true },
    sortOrder: { type: "string", required: true },
  },
  "Order.shuffle": {},
  "Library.saveAsNew": {
    name: { type: "string", required: true },
    isPublic: { type: "boolean" },
    collaborative: { type: "boolean" },
    description: { type: "string" },
  },
  "Library.saveAsAppend": {
    id: { type: "string", required: true },
  },
  "Library.saveAsReplace": {
    id: { type: "string", required: true },
  },
  "Playlist.getTracksRecomendation": {
    limit: { type: "number", required: true },
    market: { type: "string" },
    seedTracks: { type: "string[]" },
    seedArtists: { type: "string[]" },
    seedGenres: { type: "string[]" },
    minAcousticness: { type: "number" },
    maxAcousticness: { type: "number" },
    targetAcousticness: { type: "number" },
    minDanceability: { type: "number" },
    maxDanceability: { type: "number" },
    targetDanceability: { type: "number" },
  },
  "Library.likedTracks": {
    limit: { type: "number" },
    offset: { type: "number" },
  },
} as Record<string, Record<string, { type: string; required?: boolean }>>;

// import * as _ from "radash";
interface Operations {
  Filter: typeof Filter;
  Combiner: typeof Combiner;
  Utility: typeof Utility;
  Order: typeof Order;
  Playlist: typeof Playlist;
  Library: typeof Library;
  [key: string]: any;
}

export const operations: Operations = {
  Filter,
  Combiner,
  Utility,
  Order,
  Playlist,
  Library,
};
export class Runner extends Base {
  constructor(accessToken: AccessToken) {
    super(accessToken);
  }

  /**
   * Fetches the source values for a given workflow.
   *
   * @param workflow - The workflow object.
   * @param skipCache - Optional. Indicates whether to skip the cache. Default is false.
   * @returns A map of source values.
   */
  async fetchSourceValues(workflow: WorkflowObject) {
    const sourceValues = new Map();
    const promises = workflow.sources.map((source) =>
      this.fetchSourceTracks(source),
    );

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const { source, tracks } = result.value;
        sourceValues.set(source.id, source);
        sourceValues.set(`${source.id}.tracks`, tracks);
      } else {
        log.error(
          `Failed to fetch tracks for source at index ${index}: ${result.reason}`,
        );
        throw new Error(
          `Failed to fetch tracks for source at index ${index}: ${result.reason}`,
        );
      }
    });

    return sourceValues;
  }

  async fetchSourceTracks(source) {
    let tracks: SpotifyApi.PlaylistTrackObject[] = [];
    log.info(
      `Loading source ${source.id} of type ${
        source.type
      } with params ${JSON.stringify(source.params)}`,
    );

    if (source.type === "Source.playlist") {
      log.info(`Loading playlist ${source.params.playlistId}`);
      const limit = 25;
      let offset = 0;
      let result;
      let retryAfter = 0;

      while (true) {
        try {
          log.debug("Getting playlist tracks", {
            id: source.params.playlistId,
            limit,
            offset,
          });
          await new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000),
          );
          result = await this.spClient.getPlaylistTracks(
            source.params.playlistId as string,
            {
              limit,
              offset,
            },
          );
          tracks = [...tracks, ...result.body.items];
          offset += limit;
          retryAfter = 0;
        } catch (error: any) {
          if (error.statusCode === 429) {
            retryAfter = error.headers["retry-after"];
            log.warn(`Rate limited. Retrying after ${retryAfter} seconds.`);
            continue;
          } else {
            throw error;
          }
        }

        if (!result.body.next) {
          break;
        }
      }
    } else if (source.type === "Library.likedTracks") {
      const limit = source.params.limit ?? 50;
      tracks = await operations.Library.likedTracks(this.spClient, {
        limit,
        offset: 0,
      });
    }

    log.info(`Loaded ${tracks.length} tracks.`);
    source.tracks = tracks;
    return { source, tracks };
  }

  // TODO: rework source fetching to use the same method as operations
  /**
   * Fetches the sources for a given operation.
   *
   * @param operation - The operation for which to fetch the sources.
   * @param sourceValues - A map of source values.
   * @param workflow - The workflow containing the operations.
   * @returns An array of SpotifyApi.PlaylistTrackObject representing the sources.
   */
  async fetchSources(
    operation: Operation,
    sourceValues: Map<string, any>,
    workflow: WorkflowObject,
  ) {
    const sources = [] as SpotifyApi.PlaylistTrackObject[];
    for (const source of operation.sources) {
      if (sourceValues.has(source)) {
        sources.push(
          sourceValues.get(source) as SpotifyApi.PlaylistTrackObject,
        );
      } else if (sourceValues.has(`${source}.tracks`)) {
        sources.push(
          sourceValues.get(
            `${source}.tracks`,
          ) as SpotifyApi.PlaylistTrackObject,
        );
      } else {
        const sourceOperation = workflow.operations.find(
          (op) => op.id === source,
        );
        if (sourceOperation) {
          const result = await this.runOperation(
            source,
            sourceValues,
            workflow,
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
    workflow: WorkflowObject,
  ) {
    const operation = workflow.operations.find((op) => op.id === operationId);
    if (!operation) {
      log.error(`Operation ${operationId} not found.`);
      return;
    }

    const sources = await this.fetchSources(operation, sourceValues, workflow);

    // Split the operation type into class name and method name
    const [className, methodName] = operation.type.split(".") as [
      keyof Operations,
      keyof Operations[keyof Operations],
    ];

    // Get the class from the operations object
    const operationClass = operations[className];

    const result =
      className === "Playlist" || className === "Library"
        ? await operationClass[methodName](
            this.spClient,
            sources,
            operation.params,
          )
        : await operationClass[methodName](sources, operation.params);

    sourceValues.set(operationId, result);
    return result;
  }

  /**
   * Sorts the operations in the workflow based on their dependencies.
   *
   * @param workflow - The workflow to sort the operations for.
   * @returns An array of sorted operations.
   */
  sortOperations(workflow: WorkflowObject) {
    log.info("Sorting operations...");
    const sortedOperations = [] as Operation[];
    const operations = [...workflow.operations] as Operation[];

    let hasLoop = false;
    const visited = new Set();
    const recStack = new Set();

    function detectLoop(operationId: string, operationsMap: Map<string, any>) {
      visited.add(operationId);
      recStack.add(operationId);

      const operation = operationsMap.get(operationId) as Operation;
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
    const operationsMap = new Map() as Map<string, Operation>;
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
          operation.sources.every(
            (source) =>
              sortedOperations.find((op) => op.id === source) ??
              workflow.sources.find((src) => src.id === source),
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
   * Validates a workflow.
   *
   * @param workflow - The workflow to validate.
   * @returns A tuple containing a boolean indicating whether the validation passed or not, and an array of error messages if validation failed.
   */
  validateWorkflow(
    workflow: WorkflowObject,
  ): Promise<[boolean, string[] | null]> {
    log.info("Validating workflow...");

    // let timeoutOccurred = false;
    const timeout = new Promise<[boolean, string[]]>((resolve, reject) =>
      setTimeout(() => {
        // timeoutOccurred = true;
        reject(new Error(`Validation timed out after ${5000 / 1000} seconds`));
      }, 5000),
    );

    const validationPromise = new Promise<[boolean, string[] | null]>(
      (resolve) => {
        workflow.operations = this.sortOperations(workflow);
        const sourceIds = new Set(workflow.sources.map((source) => source.id));
        const operationIds = new Set();
        const errors = [] as string[];

        if (
          !workflow.sources ||
          !workflow.operations ||
          !Array.isArray(workflow.sources) ||
          !Array.isArray(workflow.operations)
        ) {
          errors.push(
            "Workflow must have 'sources' and 'operations' properties.",
          );
        }

        if (workflow.sources.length === 0) {
          errors.push("Workflow must have at least one source.");
        }

        // Validate operations
        if (workflow.operations.length === 0) {
          errors.push("Workflow must have at least one operation.");
        }

        for (const operation of workflow.operations) {
          if (typeof operation.id !== "string") {
            errors.push(
              `Invalid operation id: ${
                operation.id
              } in operation: ${JSON.stringify(operation)}`,
            );
          }

          if (typeof operation.type !== "string") {
            errors.push(
              `Invalid operation type: ${
                operation.type
              } in operation: ${JSON.stringify(
                operation,
              )} its type is ${typeof operation.type}`,
            );
          }

          if (operationIds.has(operation.id)) {
            errors.push(
              `Duplicate operation id: ${
                operation.id
              } in operation: ${JSON.stringify(operation)}`,
            );
          }
          operationIds.add(operation.id);

          // Validate operation type
          const [className, methodName] = operation.type.split(".") as [
            keyof Operations,
            keyof Operations[keyof Operations],
          ];
          const operationClass = operations[className];
          if (
            !operationClass ||
            typeof operationClass[methodName] !== "function"
          ) {
            errors.push(
              `Invalid operation type: ${
                operation.type
              } in operation: ${JSON.stringify(operation)}`,
            );
          }

          const operationParams = operationParamsTypesMap[
            operation.type
          ] as Record<string, { type: string; required?: boolean }>;
          if (operationParams) {
            const paramsCopy = { ...operation.params };
            for (const [param, paramType] of Object.entries(operationParams)) {
              if (paramType.required && !operation.params[param]) {
                errors.push(
                  `Missing required param: ${param} in operation: ${JSON.stringify(
                    operation,
                  )}`,
                );
              }
              if (paramType.type === "string[]") {
                if (
                  !Array.isArray(operation.params[param]) ||
                  !operation.params[param].every(
                    (item: any) => typeof item === "string",
                  )
                ) {
                  throw new Error(
                    `Invalid param type: ${param} in operation: ${JSON.stringify(
                      operation,
                    )} expected string[] but got ${typeof operation.params[
                      param
                    ]}`,
                  );
                }
              } else if (paramType.type === "number[]") {
                if (
                  !Array.isArray(operation.params[param]) ||
                  !operation.params[param].every(
                    (item: any) => typeof item === "number",
                  )
                ) {
                  throw new Error(
                    `Invalid param type: ${param} in operation: ${JSON.stringify(
                      operation,
                    )} expected number[] but got ${typeof operation.params[
                      param
                    ]}`,
                  );
                }
              } else if (typeof operation.params[param] !== paramType.type) {
                throw new Error(
                  `Invalid param type: ${param} in operation: ${JSON.stringify(
                    operation,
                  )} expected ${paramType.type} but got ${typeof operation
                    .params[param]}`,
                );
              }
              delete paramsCopy[param];
            }

            // TODO: Extra params validation
            // if (Object.keys(paramsCopy).length > 0) {
            //   throw new Error(
            //     `Extra params: ${Object.keys(paramsCopy).join(
            //       ", ",
            //     )} in operation: ${JSON.stringify(operation)}`,
            //   );
            // }
          }

          // Validate operation sources
          if (operation.sources) {
            for (const source of operation.sources) {
              if (!sourceIds.has(source) && !operationIds.has(source)) {
                errors.push(
                  `Invalid source: ${source} in operation: ${JSON.stringify(
                    operation,
                  )}`,
                );
              }
            }
          } else {
            errors.push(
              `Missing sources in operation: ${JSON.stringify(operation)}`,
            );
          }

          if (
            !operation.id ||
            !operation.type ||
            !operation.params ||
            !operation.sources
          ) {
            const missing = [] as string[];
            if (!operation.id) missing.push("id");
            if (!operation.type) missing.push("type");
            if (!operation.params) missing.push("params");
            if (!operation.sources) missing.push("sources");
            errors.push(
              `Invalid operation structure: ${JSON.stringify(
                operation,
              )} missing ${missing.join(", ")}`,
            );
          }
        }

        // Validate sources
        for (const source of workflow.sources) {
          if (!source.id || !source.type || !source.params) {
            errors.push(`Invalid source structure: ${JSON.stringify(source)}`);
          }
        }

        if (errors.length > 0) {
          log.error(`Validation failed with ${errors.length} errors:`);
          for (const error of errors) {
            log.error(error);
          }
          resolve([false, errors]);
        } else {
          resolve([true, []]);
        }
      },
    );

    return Promise.race([validationPromise, timeout]);
  }
  /**
   * Runs the given workflow.
   *
   * @param workflow - The workflow to be executed.
   * @returns The result of the workflow execution.
   * @throws Error if the workflow is invalid.
   */
  async runWorkflow(workflow: WorkflowObject, timeoutAfter = 20000) {
    let timeoutOccurred = false;

    const timeout = new Promise((_, reject) =>
      setTimeout(() => {
        timeoutOccurred = true;
        reject(
          Error(`Operation timed out after ${timeoutAfter / 1000} seconds`),
        );
      }, timeoutAfter),
    );

    const workflowPromise = new Promise(async (resolve, reject) => {
      try {
        const sortedOperations = this.sortOperations(workflow);

        workflow.operations = sortedOperations;
        const [valid, errors] = (await this.validateWorkflow(workflow));

        if (!valid && errors) {
          throw new Error(`Invalid workflow: ${errors.join("\n")}`);
        }

        const sourceValues = (await this.fetchSourceValues(workflow)) as Map<
          string,
          any
        >;

        let result: any;
        for (const operation of sortedOperations) {
          if (timeoutOccurred) {
            reject(new Error("Operation timed out after 10 seconds"));
          }
          result = await this.runOperation(
            operation.id,
            sourceValues,
            workflow,
          );
        }
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    return Promise.race([workflowPromise, timeout]);
  }
}
