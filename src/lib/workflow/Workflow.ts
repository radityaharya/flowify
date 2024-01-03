/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Base } from "./Base";
import type { AccessToken } from "./Base";
import Filter from "./Filter";
import Combiner from "./Combiner";
// import Utility from "./Utility";
// import Order from "./Order";
// import Playlist from "./Playlist";
// import SpotifyGeneric from "./SpotifyGeneric";

import type {
  Source,
  Operation,
  Workflow,
} from "./types";

import * as _ from "radash";
interface Operations {
  Filter: typeof Filter;
  Combiner: typeof Combiner;
  // Utility: typeof Utility;
  // Order: typeof Order;
  // Playlist: typeof Playlist;
  [key: string]: any;
}
export class Runner extends Base {
  constructor(accessToken: AccessToken) {
    super(accessToken);
  }

  operations: Operations = {
    Filter,
    Combiner,
    // Utility,
    // Order,
    // Playlist,
  };

  async fetchSourceValues(workflow: Workflow, skipCache = false) {
    const sourceValues = new Map();
    const promises = workflow.sources.map((source, index) =>
      new Promise<void>((resolve) => 
        setTimeout(() => 
          this.spClient.getPlaylistTracks((source.params.playlistId as string)).then((res) => {
            const tracks = res.body.items;
            // console.log(tracks)
            console.info(`Loaded ${tracks.length} tracks.`);
            source.tracks = tracks;
            sourceValues.set(source.id, source);
            sourceValues.set(`${source.id}.tracks`, tracks);
            resolve();
          }), index * 1000) // delay of 1 second between each request
      )
    );
  
    await Promise.all(promises);
    return sourceValues;
  };
  
  async fetchSources(
    operation: Operation,
    sourceValues: Map<string, any>,
    workflow: Workflow
  ) {
    const sources = [] as SpotifyApi.PlaylistTrackObject[];
    for (const source of operation.sources) {
      if (sourceValues.has(source)) {
        sources.push(sourceValues.get(source) as SpotifyApi.PlaylistTrackObject);
      } else if (sourceValues.has(`${source}.tracks`)) {
        sources.push(sourceValues.get(`${source}.tracks`) as SpotifyApi.PlaylistTrackObject);
      } else {
        const sourceOperation = workflow.operations.find(
          (op) => op.id === source
        );
        if (sourceOperation) {
          const result = await this.runOperation(source, sourceValues, workflow);
          sources.push(result as SpotifyApi.PlaylistTrackObject);
        } else {
          console.error(
            `Source ${source} not found in sourceValues or operations.`
          );
        }
      }
    }
    return sources;
  };
  
  async runOperation(
    operationId: string,
    sourceValues: Map<string, any>,
    workflow: Workflow
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
      keyof Operations[keyof Operations]
    ];
  
    // Get the class from the operations object
    const operationClass = this.operations[className];
  
    // Call the method on the class
    const result = await operationClass[methodName](sources, operation.params);
  
    sourceValues.set(operationId, result);
    return result;
  };
  
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
              workflow.sources.find((src) => src.id === source)
          )
        ) {
          sortedOperations.push(operation);
          operations.splice(i, 1);
          break;
        }
      }
    }
  
    return sortedOperations;
  };
  
  operationParamsTypesMap = {
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
    "Playlist.saveAsNew": {
      name: { type: "string", required: true },
      isPublic: { type: "boolean" },
      collaborative: { type: "boolean" },
      description: { type: "string" },
    },
    "Playlist.saveAsAppend": {
      playlistId: { type: "string", required: true },
    },
    "Playlist.saveAsReplace": {
      playlistId: { type: "string", required: true },
    },
  } as Record<string, Record<string, { type: string; required?: boolean }>>;
  
  validateWorkflow(workflow: Workflow, operations: Operations) {
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
            operation
          )}`
        );
      }
  
      if (typeof operation.type !== "string") {
        errors.push(
          `Invalid operation type: ${
            operation.type
          } in operation: ${JSON.stringify(operation)}`
        );
      }
  
      if (operationIds.has(operation.id)) {
        errors.push(
          `Duplicate operation id: ${operation.id} in operation: ${JSON.stringify(
            operation
          )}`
        );
      }
      operationIds.add(operation.id);
  
      // Validate operation type
      const [className, methodName] = operation.type.split(".") as [
        keyof Operations,
        keyof Operations[keyof Operations]
      ];
      const operationClass = operations[className];
      if (!operationClass || typeof operationClass[methodName] !== "function") {
        errors.push(
          `Invalid operation type: ${
            operation.type
          } in operation: ${JSON.stringify(operation)}`
        );
      }
  
      const operationParams = this.operationParamsTypesMap[operation.type] as Record<
        string,
        { type: string; required?: boolean }
      >;
      if (operationParams) {
        const paramsCopy = { ...operation.params };
        for (const [param, paramType] of Object.entries(operationParams)) {
          if (paramType.required && !operation.params[param]) {
            errors.push(
              `Missing required param: ${param} in operation: ${JSON.stringify(
                operation
              )}`
            );
          }
          if (paramType.type === "string[]") {
            if (
              !Array.isArray(operation.params[param]) ||
              !operation.params[param].every(
                (item: any) => typeof item === "string"
              )
            ) {
              throw new Error(
                `Invalid param type: ${param} in operation: ${JSON.stringify(
                  operation
                )} expected string[] but got ${typeof operation.params[param]}`
              );
            }
          } else if (paramType.type === "number[]") {
            if (
              !Array.isArray(operation.params[param]) ||
              !operation.params[param].every(
                (item: any) => typeof item === "number"
              )
            ) {
              throw new Error(
                `Invalid param type: ${param} in operation: ${JSON.stringify(
                  operation
                )} expected number[] but got ${typeof operation.params[param]}`
              );
            }
          } else if (typeof operation.params[param] !== paramType.type) {
            throw new Error(
              `Invalid param type: ${param} in operation: ${JSON.stringify(
                operation
              )} expected ${paramType.type} but got ${typeof operation.params[
                param
              ]}`
            );
          }
          delete paramsCopy[param];
        }
        if (Object.keys(paramsCopy).length > 0) {
          throw new Error(
            `Extra params: ${Object.keys(paramsCopy).join(
              ", "
            )} in operation: ${JSON.stringify(operation)}`
          );
        }
      }
  
      // Validate operation sources
      if (operation.sources) {
        for (const source of operation.sources) {
          if (!sourceIds.has(source) && !operationIds.has(source)) {
            errors.push(
              `Invalid source: ${source} in operation: ${JSON.stringify(
                operation
              )}`
            );
          }
        }
      } else {
        errors.push(`Missing sources in operation: ${JSON.stringify(operation)}`);
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
            operation
          )} missing ${missing.join(", ")}`
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
  
    return [true, null]
  }

  async runWorkflow(workflow: Workflow) {
    const [valid, errors] = this.validateWorkflow(workflow, this.operations) as [boolean, string[] | null];
  
    if (!valid && errors) {
      throw new Error(`Invalid workflow: ${errors.join("\n")}`);
    }
  
    const sourceValues = await this.fetchSourceValues(workflow) as Map<string, any>;
    const sortedOperations = this.sortOperations(workflow);
  
    let result: any;
    for (const operation of sortedOperations) {
      result = await this.runOperation(operation.id, sourceValues, workflow);
    }
  
    return result;
  };
}
