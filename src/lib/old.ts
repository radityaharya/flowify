// /* eslint-disable @typescript-eslint/ban-ts-comment */
// // @ts-nocheck
// /* eslint-disable */

// // var SpotifyWebApi = require('spotify-web-api-node');

// // import SpotifyWebApi from "spotify-web-api-node";
// import fs from "fs";
// // import { cacheOperation } from "./utils";
// import { Logger } from "./logger";

// import { authenticateSpotifyApi } from "./authenticatedSpotifyClient";

// import * as _ from "radash";

// const spotifyApi = await authenticateSpotifyApi();

// const log = new Logger("spotify-playlist");
// import "reflect-metadata";

// const SamplePlaylist = {
//   bassin: "79Cvs4gKVUZC00EPtCNWSr",
//   mbrrr: "0baAUUjkqrvI2QYxrcy3KR",
//   "test-playlist-1": "4rgpmMVnicF0U90eoc5sUG",
//   "test-playlist-2": "1lRI38EWAozAe9ra141sPq",
//   dailyMix1: "37i9dQZF1E38JfycSEUkk2",
//   dailyMix2: "37i9dQZF1E39d6iNJejwI8",
//   dailyMix3: "37i9dQZF1E388DPmhFQWNJ",
//   dailyMix4: "37i9dQZF1E38xANxmMkAeQ",
//   dailyMix5: "37i9dQZF1E39lmXB0J28xB",
//   dailyMix6: "37i9dQZF1E35Jc3TZePxTU",
// };

// interface Source {
//   id: string;
//   type: string;
//   params: any;
//   tracks?: SpotifyApi.PlaylistTrackObject[];
// }

// interface Operation {
//   id: string;
//   type:
//     | "Filter.filter"
//     | "Filter.dedupeTracks"
//     | "Filter.dedupeArtists"
//     | "Filter.match"
//     | "Filter.limit"
//     | "Combiner.push"
//     | "Combiner.alternate"
//     | "Utility.save"
//     | "Utility.removeKeys"
//     | "Utility.includeOnlyKeys"
//     | "Utility.summary"
//     | "Order.sort"
//     | "Order.shuffle"
//     | "Playlist.saveAsNew"
//     | "Playlist.saveAsAppend"
//     | "Playlist.saveAsReplace";
//   params: Record<string, any>;
//   sources: string[];
//   tracks?: SpotifyApi.PlaylistTrackObject[];
// }
// interface Workflow {
//   name: string;
//   sources: Source[];
//   operations: Operation[];
// }

// const workflow: Workflow = {
//   name: "spotify-playlist",
//   sources: [
//     {
//       id: "playlist1",
//       type: "playlist",
//       params: {
//         playlistId: SamplePlaylist.dailyMix1,
//       },
//     },
//     {
//       id: "playlist2",
//       type: "playlist",
//       params: {
//         playlistId: SamplePlaylist.dailyMix2,
//       },
//     },
//     {
//       id: "playlist3",
//       type: "playlist",
//       params: {
//         playlistId: SamplePlaylist.dailyMix3,
//       },
//     },
//     {
//       id: "playlist4",
//       type: "playlist",
//       params: {
//         playlistId: SamplePlaylist.dailyMix4,
//       },
//     },
//     {
//       id: "playlist5",
//       type: "playlist",
//       params: {
//         playlistId: SamplePlaylist.dailyMix5,
//       },
//     },
//     {
//       id: "playlist6",
//       type: "playlist",
//       params: {
//         playlistId: SamplePlaylist.dailyMix6
//       },
//     },
//   ],
//   operations: [
//     {
//       id: "push",
//       type: "Combiner.alternate",
//       sources: ["playlist1", "playlist2", "playlist3", "playlist4", "playlist5", "playlist6"],
//       params: {},
//     },
//     {
//       id: "sort",
//       type: "Order.sort",
//       params: {
//         sortKey: "track.popularity",
//         sortOrder: "asc",
//       },
//       sources: ["push"],
//     },
//     {
//       id: "filter",
//       type: "Filter.filter",
//       params: {
//         filterKey: "track.popularity",
//         filterValue: "> 1",
//       },
//       sources: ["sort"],
//     },
//     {
//       id: "onlyKeys",
//       type: "Utility.includeOnlyKeys",
//       params: {
//         keys: ["track"],
//       },
//       sources: ["filter"],
//     },
//     {
//       id: "removeKeys",
//       type: "Utility.removeKeys",
//       params: {
//         keys: ["track.available_markets", "track.album.available_markets"],
//       },
//       sources: ["onlyKeys"],
//     },
//     // {
//     //   id: "save",
//     //   type: "Playlist.saveAsReplace",
//     //   sources: ["removeKeys"],
//     //   params: {
//     //     playlistId: "2DaJhLTS8AYKV30yOySuZ8",
//     //     // name: "Daily mix 1+2",
//     //     // public: false,
//     //     // collaborative: false,
//     //     // description: "New playlist description",
//     //   },
//     // },
//     {
//       id: "summary",
//       type: "Utility.summary",
//       sources: ["removeKeys"],
//       params: {},
//     },
//   ],
// };

// class Filter {
//   private static isPlaylistTrackObject(
//     obj: any
//   ): obj is SpotifyApi.PlaylistTrackObject {
//     return obj && obj.hasOwnProperty("track");
//   }

//   private static isPlaylistTrackObjectArray(
//     obj: any
//   ): obj is SpotifyApi.PlaylistTrackObject[] {
//     return obj && obj.every((item: any) => Filter.isPlaylistTrackObject(item));
//   }
//   static filter(
//     sources: Operation[] | SpotifyApi.PlaylistTrackObject[],
//     params: { filterKey: string; filterValue: string }
//   ) {
//     log.info("Filtering...");
//     log.debug("Filter Sources:", sources, true);
//     const startTime = new Date().getTime();

//     const source = sources[0];
//     let tracks = [] as SpotifyApi.PlaylistTrackObject[];
//     if (Filter.isPlaylistTrackObjectArray(source)) {
//       tracks = source;
//     } else if (Array.isArray(source)) {
//       tracks = source.flat();
//     } else {
//       throw new Error(
//         `Invalid source type: ${typeof source} in ${source} located in sources: ${sources}`
//       );
//     }

//     if (Array.isArray(tracks)) {
//       return tracks.filter((track: any) => {
//         if (params.filterKey && params.filterValue) {
//           const [operator, value] = params.filterValue.split(" ");
//           const trackValue = _.get(track, params.filterKey) as any;

//           let type = "string";
//           let filterValue;

//           if (!isNaN(Number(value))) {
//             filterValue = Number(value);
//             type = "number";
//           } else if (!isNaN(Date.parse(value))) {
//             filterValue = new Date(value);
//             type = "date";
//           } else {
//             filterValue = value;
//           }

//           switch (type) {
//             case "number":
//               switch (operator) {
//                 case ">":
//                   return trackValue > filterValue;
//                 case "<":
//                   return trackValue < filterValue;
//                 case ">=":
//                   return trackValue >= filterValue;
//                 case "<=":
//                   return trackValue <= filterValue;
//                 case "==":
//                   return trackValue == filterValue;
//                 default:
//                   throw new Error(`Invalid operator: ${operator}`);
//               }
//             case "string":
//               return trackValue.includes(filterValue);
//             case "boolean":
//               return trackValue == Boolean(filterValue);
//             case "object":
//               if (filterValue instanceof Date) {
//                 const trackDateValue = new Date(trackValue);
//                 switch (operator) {
//                   case ">":
//                     return trackDateValue > filterValue;
//                   case "<":
//                     return trackDateValue < filterValue;
//                   case ">=":
//                     return trackDateValue >= filterValue;
//                   case "<=":
//                     return trackDateValue <= filterValue;
//                   case "==":
//                     return trackDateValue.getTime() == filterValue.getTime();
//                   default:
//                     throw new Error(`Invalid operator: ${operator}`);
//                 }
//               }
//             default:
//               throw new Error(
//                 `Unsupported filterValue type: ${typeof filterValue}`
//               );
//           }
//         }
//         const endTime = new Date().getTime();
//         //console.log("Filter time:", endTime - startTime);
//         return true;
//       });
//     } else {
//       throw new Error(`Invalid source type: ${typeof source}`);
//     }
//   }

//   static dedupeTracks(sources: Operation[], params: {}) {
//     log.info("Deduping tracks...");
//     log.debug("DedupeTracks Sources:", sources, true);
//     const startTime = new Date().getTime();
//     const source = sources[0];
//     if (Array.isArray(source)) {
//       return [
//         ...new Map(source.map((item) => [item["id"], item])).values(),
//       ] as SpotifyApi.PlaylistTrackObject[];
//     }
//     const endTime = new Date().getTime();
//     //console.log("DedupeTracks time:", endTime - startTime);
//     return [];
//   }

//   static dedupeArtists(sources: Operation[], params: {}) {
//     log.info("Deduping artists...");
//     log.debug("DedupeArtists Sources:", sources, true);
//     const startTime = new Date().getTime();
//     const source = sources[0];
//     if (_.isArray(source)) {
//       return _.unique(source, (track): string | number | symbol =>
//         _.get(track, "track.artists[0].id")
//       ) as SpotifyApi.PlaylistTrackObject[];
//     }
//     const endTime = new Date().getTime();
//     //console.log("DedupeArtists time:", endTime - startTime);
//     return [];
//   }

//   static match(
//     sources: Operation[],
//     params: { matchKey: string; matchValue: string }
//   ) {
//     log.info("Matching...");
//     log.debug("Match Sources:", sources, true);
//     const source = sources[0];
//     if (Array.isArray(source)) {
//       return source.filter((track) => {
//         if (params.matchKey && params.matchValue) {
//           const regex = new RegExp(params.matchValue, "i");
//           const matchKeyPath = params.matchKey.split(".");
//           log.debug("Match Key Path:", matchKeyPath);
//           let matchKeyValue: any = track;
//           for (const pathSegment of matchKeyPath) {
//             log.debug("Path Segment:", pathSegment);
//             const arrayMatch = pathSegment.match(/(\w+)\[(\d+)\]/);
//             if (arrayMatch) {
//               const key = arrayMatch[1];
//               const index = parseInt(arrayMatch[2]);
//               if (!matchKeyValue.hasOwnProperty(key)) {
//                 throw new Error(`Key "${key}" not found in track`);
//               }
//               matchKeyValue = matchKeyValue[key][index];
//             } else {
//               if (!matchKeyValue.hasOwnProperty(pathSegment)) {
//                 throw new Error(`Key "${pathSegment}" not found in track`);
//               }
//               matchKeyValue = matchKeyValue[pathSegment];
//               log.debug("Match Key Value:", matchKeyValue);
//             }
//           }
//           return matchKeyValue;
//         }
//         return true;
//       });
//     } else {
//       throw new Error(
//         `Invalid source type: ${typeof source} in ${source} located in sources: ${sources}`
//       );
//     }
//     return [];
//   }

//   static limit(sources: any[], params: { limit?: number }) {
//     log.info("Limiting...");
//     log.debug("Limit Sources:", sources, true);
//     const startTime = new Date().getTime();
//     const source = sources[0];
//     if (Array.isArray(source)) {
//       return source.slice(0, params.limit);
//     }
//     const endTime = new Date().getTime();
//     //console.log("Limit time:", endTime - startTime);
//     return [];
//   }
// }

// class Combiner {
//   static push(sources: any[], params: {}) {
//     const startTime = new Date().getTime();
//     log.debug("Push Sources:", sources, true);
//     log.info("Pushing...");
//     const result = [] as SpotifyApi.PlaylistTrackObject[];
//     sources.forEach((source) => {
//       if (source.tracks) {
//         result.push(...source.tracks);
//       } else if (Array.isArray(source)) {
//         result.push(...source);
//       } else {
//         console.error("Invalid source type:", typeof source);
//       }
//     });
//     // //console.log("Result:", result);
//     const endTime = new Date().getTime();
//     //console.log("Push time:", endTime - startTime);
//     return result;
//   }

//   static isPlaylistTrackObject(
//     obj: any
//   ): obj is SpotifyApi.PlaylistTrackObject {
//     return obj && obj.hasOwnProperty("track");
//   }

//   static alternate(sources: any[], params: {}) {
//     const startTime = new Date().getTime();
//     log.debug("Alternate Sources:", sources, true);
//     log.info("Alternating...");
//     const result = [] as SpotifyApi.PlaylistTrackObject[];
//     let longestSourceLength = 0;

//     // Convert sources to an array of arrays of PlaylistTrackObject

//     const sourcesTracks = sources.map((source) => {
//       let tracks: SpotifyApi.PlaylistTrackObject[];
//       if (
//         Array.isArray(source) &&
//         source.every((item) => Combiner.isPlaylistTrackObject(item))
//       ) {
//         tracks = source;
//       } else if (source.tracks && Array.isArray(source.tracks)) {
//         tracks = source.tracks;
//       } else {
//         throw new Error("Invalid source type");
//       }
//       if (tracks.length > longestSourceLength) {
//         longestSourceLength = tracks.length;
//       }
//       return tracks;
//     });

//     // interleave the tracks from each source
//     for (let i = 0; i < longestSourceLength; i++) {
//       sourcesTracks.forEach((source) => {
//         if (source[i]) {
//           result.push(source[i]);
//         }
//       });
//     }

//     const endTime = new Date().getTime();
//     //console.log("Alternate time:", endTime - startTime);
//     return result;
//   }
// }

// class Order {
//   static sort(
//     sources: Operation[],
//     params: { sortKey: string; sortOrder: string }
//   ) {
//     const startTime = new Date().getTime();
//     log.info("Sorting...");
//     log.debug("Sort Sources:", sources, true);
//     if (Array.isArray(sources[0])) {
//       log.info("Sorting by", [params.sortKey, params.sortOrder]);
//       const sortKey = params.sortKey || "track.popularity";
//       const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

//       return sources[0].sort((a, b) => {
//         const keyA = sortKey.split(".").reduce((o, i) => o[i], a);
//         const keyB = sortKey.split(".").reduce((o, i) => o[i], b);
//         if (keyA < keyB) return sortOrder === "asc" ? -1 : 1;
//         if (keyA > keyB) return sortOrder === "asc" ? 1 : -1;
//         return 0;
//       });
//     }
//     const endTime = new Date().getTime();
//     //console.log("Sort time:", endTime - startTime);
//     return [];
//   }

//   static shuffle(sources: Operation[], params: {}) {
//     const startTime = new Date().getTime();
//     log.info("Shuffling...");
//     log.debug("Shuffle Sources:", sources, true);
//     if (Array.isArray(sources[0])) {
//       return sources[0].sort(() => Math.random() - 0.5);
//     }
//     const endTime = new Date().getTime();
//     //console.log("Shuffle time:", endTime - startTime);
//     return [];
//   }
// }

// class Playlist {
//   private static async _getPlaylistWithTracks(playlistId: string) {
//     return spotifyApi
//       .getPlaylist(playlistId)
//       .then((response) => ({
//         playlistId: response.body.id,
//         tracks: response.body.tracks.items,
//       }))
//       .catch((error) => {
//         console.error(error);
//       });
//   }

//   static async saveAsNew(
//     sources: any[],
//     params: {
//       name: string;
//       isPublic?: boolean;
//       collaborative?: boolean;
//       description?: string;
//     }
//   ) {
//     log.info("Saving as new playlist...");
//     log.debug("SaveAsNew Sources:", sources, true);

//     const options = {
//       public: params.isPublic,
//       collaborative: params.collaborative,
//       description: params.description,
//     };

//     const playlist = await spotifyApi.createPlaylist(params.name, options);

//     const trackUris = sources[0].map((track: any) => track.track.uri);

//     await SpotifyGeneric.addTracksBatch(playlist.body.id, trackUris);

//     return this._getPlaylistWithTracks(playlist.body.id);
//   }

//   static async saveAsAppend(sources: any[], params: { playlistId: string }) {
//     log.info("Saving as append playlist...");
//     log.debug("SaveAsAppend Sources:", sources, true);

//     const playlistId = params.playlistId;

//     const trackUris = sources[0].map((track: any) => track.track.uri);

//     await SpotifyGeneric.addTracksBatch(playlistId, trackUris);

//     return this._getPlaylistWithTracks(playlistId);
//   }

//   static async saveAsReplace(sources: any[], params: { playlistId: string }) {
//     log.info("Saving as replace playlist...");
//     log.debug("SaveAsReplace Sources:", sources, true);

//     const playlistId = params.playlistId;
//     const trackUris = sources[0].map((track: any) => track.track.uri);

//     await spotifyApi.replaceTracksInPlaylist(playlistId, trackUris);

//     return this._getPlaylistWithTracks(playlistId);
//   }
// }
// class Utility {
//   static save(sources: any[], params: {}) {
//     const startTime = new Date().getTime();
//     log.info("Saving output...");
//     log.debug("Save Sources:", sources, true);
//     fs.writeFileSync("output.json", JSON.stringify(sources[0], null, 2));
//     log.info("Saved output to output.json");
//     const endTime = new Date().getTime();
//     //console.log("Save time:", endTime - startTime);
//     return sources[0];
//   }

//   static removeKeys(sources: any[], params: { keys: string[] }) {
//     const startTime = new Date().getTime();
//     log.debug("RemoveKeys Sources:", sources, true);
//     log.info("Removing keys...");
//     const result = sources[0].map((track: any) =>
//       _.omit(track, params.keys || [])
//     );
//     const endTime = new Date().getTime();
//     //console.log("RemoveKeys time:", endTime - startTime);
//     return result;
//   }

//   static includeOnlyKeys(sources: any[], params: { keys: string[] }) {
//     const startTime = new Date().getTime();
//     log.debug("IncludeOnlyKeys Sources:", sources, true);
//     log.info("Including only keys...");
//     const result = sources[0].map((track: any) =>
//       _.pick(track, params.keys || [])
//     );
//     const endTime = new Date().getTime();
//     //console.log("IncludeOnlyKeys time:", endTime - startTime);
//     return result;
//   }

//   // static isPlaylistTrackObject(
//   //   obj: any
//   // ): obj is SpotifyApi.PlaylistTrackObject {
//   //   return obj && obj.hasOwnProperty("track");
//   // }

//   static summary(sources: any[], params: {}) {
//     const startTime = new Date().getTime();
//     log.debug("Summary Sources:", sources, true);
//     log.info("Calculating summary...");

//     let tracks = sources[0] as any;

//     // check if contains playlistID
//     const isPlaylistCreateResponse = tracks.hasOwnProperty("playlistId");

//     if (isPlaylistCreateResponse) {
//       tracks = tracks.tracks;
//     }

//     const totalSeconds =
//       tracks.reduce(
//         (acc: any, curr: { track: any }) => acc + curr.track!.duration_ms,
//         0
//       ) / 1000;
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = Math.floor(totalSeconds % 60);

//     const totalPopularity = tracks.reduce(
//       (acc: any, curr: { track: any }) => acc + curr.track!.popularity,
//       0
//     );
//     const averagePopularity = totalPopularity / tracks.length;

//     const totalDurationMs = tracks.reduce(
//       (acc: any, curr: { track: any }) => acc + curr.track!.duration_ms,
//       0
//     );
//     const averageDurationMs = totalDurationMs / tracks.length;

//     const titles = tracks.map((track: { track: any }) => track.track!.name);

//     const summary = {
//       total: tracks.length,
//       totalDuration: `${minutes}min ${seconds}sec`,
//       averageDuration: averageDurationMs,
//       totalPopularity: totalPopularity,
//       averagePopularity: averagePopularity,
//       // titles: titles,
//     };

//     console.log("Summary:", summary);
//     const endTime = new Date().getTime();
//     //console.log("Summary time:", endTime - startTime);
//     return summary;
//   }
// }

// class SpotifyGeneric {
//   // Users
//   static async getUsername() {
//     const data = await spotifyApi.getMe();
//     return data.body.display_name;
//   }

//   static async getUserPlaylists() {
//     const data = await spotifyApi.getUserPlaylists();
//     return data.body;
//   }

//   // playlists

//   static async getPlaylistTracks(playlistId: string) {
//     try{
//     const data = await spotifyApi.getPlaylistTracks(playlistId);
//     return data.body.items;
//   } catch (err) {
//     log.error("Error getting playlist tracks", err);
//     throw new Error("Error getting playlist tracks " + err);
//   }
//   return [];
//   }
//   static async addTracksBatch(playlistId: string, trackUris: string[]) {
//     // A maximum of 100 items can be added in one request.
//     // handle this by chunking the array into batches of 100
//     try {
//       const chunkSize = 100;

//       function chunk<T>(array: T[], size: number): T[][] {
//         let result = [];
//         for (let i = 0; i < array.length; i += size) {
//           result.push(array.slice(i, i + size));
//         }
//         return result;
//       }

//       const trackChunks = chunk(trackUris, chunkSize);

//       for (const chunk of trackChunks) {
//         await spotifyApi.addTracksToPlaylist(playlistId, chunk);
//       }
//     } catch (err) {
//       log.error("Error adding tracks to playlist", err);
//       throw new Error("Error adding tracks to playlist " + err);
//     }
//   }
// }

// interface Operations {
//   Filter: typeof Filter;
//   Combiner: typeof Combiner;
//   Utility: typeof Utility;
//   Order: typeof Order;
//   Playlist: typeof Playlist;
//   [key: string]: any;
// }

// const operations: Operations = {
//   Filter,
//   Combiner,
//   Utility,
//   Order,
//   Playlist,
// };

// const fetchSourceValues = async (workflow: Workflow, skipCache = false) => {
//   const sourceValues = new Map();
//   const promises = workflow.sources.map((source, index) =>
//     new Promise<void>((resolve) => 
//       setTimeout(() => 
//         SpotifyGeneric.getPlaylistTracks(source.params.playlistId).then((tracks) => {
//           log.info(`Loaded ${tracks.length} tracks.`);
//           source.tracks = tracks;
//           sourceValues.set(source.id, source);
//           sourceValues.set(`${source.id}.tracks`, tracks);
//           resolve();
//         }), index * 500) // delay of 1 second between each request
//     )
//   );

//   await Promise.all(promises);
//   return sourceValues;
// };

// const fetchSources = async (
//   operation: Operation,
//   sourceValues: Map<string, any>,
//   workflow: Workflow
// ) => {
//   const sources = [] as SpotifyApi.PlaylistTrackObject[];
//   for (let source of operation.sources) {
//     if (sourceValues.has(source)) {
//       sources.push(sourceValues.get(source));
//     } else if (sourceValues.has(`${source}.tracks`)) {
//       sources.push(sourceValues.get(`${source}.tracks`));
//     } else {
//       const sourceOperation = workflow.operations.find(
//         (op) => op.id === source
//       );
//       if (sourceOperation) {
//         const result = await runOperation(source, sourceValues, workflow);
//         sources.push(result);
//       } else {
//         console.error(
//           `Source ${source} not found in sourceValues or operations.`
//         );
//       }
//     }
//   }
//   return sources;
// };

// const runOperation = async (
//   operationId: string,
//   sourceValues: Map<string, any>,
//   workflow: Workflow
// ) => {
//   const operation = workflow.operations.find((op) => op.id === operationId);
//   if (!operation) {
//     console.error(`Operation ${operationId} not found.`);
//     return;
//   }

//   const sources = await fetchSources(operation, sourceValues, workflow);

//   // Split the operation type into class name and method name
//   const [className, methodName] = operation.type.split(".");

//   // Get the class from the operations object
//   const operationClass = operations[className];

//   // Call the method on the class
//   const result = await operationClass[methodName](sources, operation.params);

//   sourceValues.set(operationId, result);
//   return result;
// };

// const sortOperations = (workflow: Workflow) => {
//   let sortedOperations = [] as Operation[];
//   let operations = [...workflow.operations];

//   while (operations.length > 0) {
//     for (let i = 0; i < operations.length; i++) {
//       let operation = operations[i];
//       if (
//         operation.sources.every(
//           (source) =>
//             sortedOperations.find((op) => op.id === source) ||
//             workflow.sources.find((src) => src.id === source)
//         )
//       ) {
//         sortedOperations.push(operation);
//         operations.splice(i, 1);
//         break;
//       }
//     }
//   }

//   return sortedOperations;
// };

// const run = async (workflow: Workflow) => {
//   const sourceValues = await fetchSourceValues(workflow);
//   const sortedOperations = sortOperations(workflow);

//   for (let operation of sortedOperations) {
//     await runOperation(operation.id, sourceValues, workflow);
//   }
// };

// const operationParamsTypesMap = {
//   "Filter.filter": {
//     filterKey: { type: "string", required: true },
//     filterValue: { type: "string", required: true },
//   },
//   "Filter.dedupeTracks": {},
//   "Filter.dedupeArtists": {},
//   "Filter.match": {
//     matchKey: { type: "string", required: true },
//     matchValue: { type: "string", required: true },
//   },
//   "Filter.limit": {
//     limit: { type: "number", required: true },
//   },
//   "Combiner.push": {},
//   "Combiner.alternate": {},
//   "Utility.save": {},
//   "Utility.removeKeys": {
//     keys: { type: "string[]", required: true },
//   },
//   "Utility.includeOnlyKeys": {
//     keys: { type: "string[]", required: true },
//   },
//   "Utility.summary": {},
//   "Order.sort": {
//     sortKey: { type: "string", required: true },
//     sortOrder: { type: "string", required: true },
//   },
//   "Order.shuffle": {},
//   "Playlist.saveAsNew": {
//     name: { type: "string", required: true },
//     isPublic: { type: "boolean" },
//     collaborative: { type: "boolean" },
//     description: { type: "string" },
//   },
//   "Playlist.saveAsAppend": {
//     playlistId: { type: "string", required: true },
//   },
//   "Playlist.saveAsReplace": {
//     playlistId: { type: "string", required: true },
//   },
// } as Record<string, Record<string, { type: string; required?: boolean }>>;

// function validateWorkflow(workflow: Workflow, operations: Operations) {
//   const sourceIds = new Set(workflow.sources.map((source) => source.id));
//   const operationIds = new Set();
//   const errors = [] as string[];

//   if (!workflow.sources || !workflow.operations) {
//     errors.push("Workflow must have 'sources' and 'operations' properties.");
//   }

//   // Validate operations
//   for (let operation of workflow.operations) {
//     if (typeof operation.id !== "string") {
//       errors.push(
//         `Invalid operation id: ${operation.id} in operation: ${JSON.stringify(
//           operation
//         )}`
//       );
//     }

//     if (typeof operation.type !== "string") {
//       errors.push(
//         `Invalid operation type: ${
//           operation.type
//         } in operation: ${JSON.stringify(operation)}`
//       );
//     }

//     if (operationIds.has(operation.id)) {
//       errors.push(
//         `Duplicate operation id: ${operation.id} in operation: ${JSON.stringify(
//           operation
//         )}`
//       );
//     }
//     operationIds.add(operation.id);

//     // Validate operation type
//     const [className, methodName] = operation.type.split(".");
//     const operationClass = operations[className];
//     if (!operationClass || typeof operationClass[methodName] !== "function") {
//       errors.push(
//         `Invalid operation type: ${
//           operation.type
//         } in operation: ${JSON.stringify(operation)}`
//       );
//     }

//     const operationParams = operationParamsTypesMap[operation.type];
//     if (operationParams) {
//       let paramsCopy = { ...operation.params };
//       for (let [param, paramType] of Object.entries(operationParams)) {
//         if (paramType.required && !operation.params[param]) {
//           errors.push(
//             `Missing required param: ${param} in operation: ${JSON.stringify(
//               operation
//             )}`
//           );
//         }
//         if (paramType.type === "string[]") {
//           if (
//             !Array.isArray(operation.params[param]) ||
//             !operation.params[param].every(
//               (item: any) => typeof item === "string"
//             )
//           ) {
//             throw new Error(
//               `Invalid param type: ${param} in operation: ${JSON.stringify(
//                 operation
//               )} expected string[] but got ${typeof operation.params[param]}`
//             );
//           }
//         } else if (paramType.type === "number[]") {
//           if (
//             !Array.isArray(operation.params[param]) ||
//             !operation.params[param].every(
//               (item: any) => typeof item === "number"
//             )
//           ) {
//             throw new Error(
//               `Invalid param type: ${param} in operation: ${JSON.stringify(
//                 operation
//               )} expected number[] but got ${typeof operation.params[param]}`
//             );
//           }
//         } else if (typeof operation.params[param] !== paramType.type) {
//           throw new Error(
//             `Invalid param type: ${param} in operation: ${JSON.stringify(
//               operation
//             )} expected ${paramType.type} but got ${typeof operation.params[
//               param
//             ]}`
//           );
//         }
//         delete paramsCopy[param];
//       }
//       if (Object.keys(paramsCopy).length > 0) {
//         throw new Error(
//           `Extra params: ${Object.keys(paramsCopy).join(
//             ", "
//           )} in operation: ${JSON.stringify(operation)}`
//         );
//       }
//     }

//     // Validate operation sources
//     if (operation.sources) {
//       for (let source of operation.sources) {
//         if (!sourceIds.has(source) && !operationIds.has(source)) {
//           errors.push(
//             `Invalid source: ${source} in operation: ${JSON.stringify(
//               operation
//             )}`
//           );
//         }
//       }
//     } else {
//       errors.push(`Missing sources in operation: ${JSON.stringify(operation)}`);
//     }

//     if (
//       !operation.id ||
//       !operation.type ||
//       !operation.params ||
//       !operation.sources
//     ) {
//       const missing = [] as string[];
//       if (!operation.id) missing.push("id");
//       if (!operation.type) missing.push("type");
//       if (!operation.params) missing.push("params");
//       if (!operation.sources) missing.push("sources");
//       errors.push(
//         `Invalid operation structure: ${JSON.stringify(
//           operation
//         )} missing ${missing.join(", ")}`
//       );
//     }
//   }

//   // Validate sources
//   for (let source of workflow.sources) {
//     if (!source.id || !source.type || !source.params) {
//       errors.push(`Invalid source structure: ${JSON.stringify(source)}`);
//     }
//   }

//   if (errors.length > 0) {
//     console.error(`Validation failed with ${errors.length} errors:`);
//     for (let error of errors) {
//       console.error(error);
//     }
//     return false;
//   }

//   return true;
// }

// fs.writeFileSync("debug.json", "");

// if (validateWorkflow(workflow, operations)) {
//   run(workflow).then(() => log.info("Workflow completed."));
// } else {
//   console.error("Invalid workflow.");
// }