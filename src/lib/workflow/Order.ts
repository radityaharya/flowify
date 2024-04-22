/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import _ from "radash";
import type { AccessToken } from "./Base";
import { Logger } from "../log";
import type SpotifyWebApi from "spotify-web-api-node";

const log = new Logger("Order");
export default class Order extends Base {
  /**
   * The function sorts an array of objects based on a specified sort key and sort order.
   * @param {Operation[]} sources - An array of Operation objects.
   * @param params - The `params` parameter is an object that contains two properties:
   * @returns an array of sorted Operation objects.
   */
  static sort(
    spClient: SpotifyWebApi,
    sources: any[],
    params: { sortKey: string; sortOrder: string },
  ) {
    log.info("Sorting...");
    log.debug("Sort Sources:", sources);

    const tracks = this.getTracks(sources);

    function getOrderKey(obj, path) {
      return path.split(".").reduce((o, i) => {
        let indexMatch;
        if ((indexMatch = i.match(/^(\w+)\[(\d+)\]$/))) {
          // Handle array access
          const propName = indexMatch[1];
          const index = parseInt(indexMatch[2], 10);
          if (
            o?.hasOwnProperty(propName) &&
            Array.isArray(o[propName]) &&
            o[propName].length > index
          ) {
            return o[propName][index];
          } else {
            log.error(`Failed to access property '${i}' on object:`, o);
            return undefined; // Or handle the error differently
          }
        } else {
          // Handle object property access
          if (!o?.hasOwnProperty(i)) {
            log.error(`Failed to access property '${i}' on object:`, o);
            return undefined; // Or handle the error differently
          }
          return o[i];
        }
      }, obj);
    }

    if (Array.isArray(tracks)) {
      log.info("Sorting by", [params.sortKey, params.sortOrder]);
      const sortKey = params.sortKey || "popularity";
      const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";
      const sortedTracks = tracks.sort((a, b) => {
        const keyA = getOrderKey(a, sortKey);
        const keyB = getOrderKey(b, sortKey);
        if (keyA < keyB) return sortOrder === "asc" ? -1 : 1;
        if (keyA > keyB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
      return sortedTracks;
    }
    return [];
  }

  static shuffle(spClient: SpotifyWebApi, sources: any[], params: {}) {
    log.info("Shuffling...");
    log.debug("Shuffle Sources:", sources);

    const tracks = this.getTracks(sources);

    if (Array.isArray(tracks)) {
      return tracks.sort(() => Math.random() - 0.5);
    }
    return [];
  }
}
