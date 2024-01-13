/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Base } from "./Base";
import type { AccessToken } from "./Base";
import Filter from "./Filter";
import Combiner from "./Combiner";
import Utility from "./Utility";
import Order from "./Order";
import Playlist from "./Playlist";
import Library from "./Library";
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
    playlistId: { type: "string", required: true },
  },
  "Library.saveAsReplace": {
    playlistId: { type: "string", required: true },
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

import type { Source, Operation, Workflow } from "./types";

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
  async fetchSourceValues(workflow: Workflow, skipCache = false) {
    const sourceValues = new Map();
    const promises = workflow.sources.map(
      (source, index) =>
        new Promise<void>(
          async (resolve) => {
            let tracks: SpotifyApi.PlaylistTrackObject[] = [];
            console.log(`Loading source ${source.id} of type ${source.type} with params ${JSON.stringify(source.params)}`);
            if (source.type === "Source.playlist"){
              console.log(`Loading playlist ${source.params.id}`);
              let result;
              let offset = 0;
              do {
                result = await new Promise((resolve) =>
                  setTimeout(
                    () =>
                      this.spClient
                        .getPlaylistTracks(source.params.id as string, { limit: 50, offset })
                        .then(resolve),
                    index * 1500,
                  ),
                );
  
                tracks = [...tracks, ...result.body.items];
                offset += 50;
              } while (result.body.next);
            } else if ( source.type === "Library.likedTracks") {
              const limit= source.params.limit ?? 50;
              tracks = await operations.Library.likedTracks(this.spClient, { limit, offset: 0 });
            } 

            console.info(`Loaded ${tracks.length} tracks.`);
            source.tracks = tracks;
            sourceValues.set(source.id, source);
            sourceValues.set(`${source.id}.tracks`, tracks);
            resolve();
          }
        ),
    );

    await Promise.all(promises);
    return sourceValues;
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
    workflow: Workflow,
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
          console.error(
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
    workflow: Workflow,
  ) {
    const operation = workflow.operations.find((op) => op.id === operationId);
    if (!operation) {
      console.error(`Operation ${operationId} not found.`);
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
      (className === "Playlist" || className === "Library")
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
  sortOperations(workflow: Workflow) {
    const sortedOperations = [] as Operation[];
    const operations = [...workflow.operations] as Operation[];

    while (operations.length > 0) {
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
  validateWorkflow(workflow: Workflow) {
    const sourceIds = new Set(workflow.sources.map((source) => source.id));
    const operationIds = new Set();
    const errors = [] as string[];

    if (!workflow.sources || !workflow.operations) {
      errors.push("Workflow must have 'sources' and 'operations' properties.");
    }

    // Validate operations
    for (const operation of workflow.operations) {
      if (typeof operation.id !== "string") {
        errors.push(
          `Invalid operation id: ${operation.id} in operation: ${JSON.stringify(
            operation,
          )}`,
        );
      }

      if (typeof operation.type !== "string") {
        errors.push(
          `Invalid operation type: ${
            operation.type
          } in operation: ${JSON.stringify(operation)} its type is ${typeof operation.type}`,
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
      if (!operationClass || typeof operationClass[methodName] !== "function") {
        errors.push(
          `Invalid operation type: ${
            operation.type
          } in operation: ${JSON.stringify(operation)}`,
        );
      }

      const operationParams = operationParamsTypesMap[operation.type] as Record<
        string,
        { type: string; required?: boolean }
      >;
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
                )} expected string[] but got ${typeof operation.params[param]}`,
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
                )} expected number[] but got ${typeof operation.params[param]}`,
              );
            }
          } else if (typeof operation.params[param] !== paramType.type) {
            throw new Error(
              `Invalid param type: ${param} in operation: ${JSON.stringify(
                operation,
              )} expected ${paramType.type} but got ${typeof operation.params[
                param
              ]}`,
            );
          }
          delete paramsCopy[param];
        }
        if (Object.keys(paramsCopy).length > 0) {
          throw new Error(
            `Extra params: ${Object.keys(paramsCopy).join(
              ", ",
            )} in operation: ${JSON.stringify(operation)}`,
          );
        }
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
      console.error(`Validation failed with ${errors.length} errors:`);
      for (const error of errors) {
        console.error(error);
      }
      return [false, errors];
    }

    return [true, null];
  }
  /**
   * Runs the given workflow.
   * 
   * @param workflow - The workflow to be executed.
   * @returns The result of the workflow execution.
   * @throws Error if the workflow is invalid.
   */
  async runWorkflow(workflow: Workflow) {
    const sortedOperations = this.sortOperations(workflow);

    workflow.operations = sortedOperations;
    const [valid, errors] = this.validateWorkflow(
      workflow,
    ) as [boolean, string[] | null];

    if (!valid && errors) {
      throw new Error(`Invalid workflow: ${errors.join("\n")}`);
    }

    const sourceValues = (await this.fetchSourceValues(workflow)) as Map<
      string,
      any
    >;

    let result: any;
    for (const operation of sortedOperations) {
      result = await this.runOperation(operation.id, sourceValues, workflow);
    }

    return result;
  }
}