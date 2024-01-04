/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import _ from "radash";
import type { AccessToken } from './Base';
import { type Operation } from "./types";
import { Logger } from '../log'

const log = new Logger("Order");
export default class Order extends Base {
  constructor(accessToken: AccessToken){
    super(accessToken);
  }
  /**
   * The function sorts an array of objects based on a specified sort key and sort order.
   * @param {Operation[]} sources - An array of Operation objects.
   * @param params - The `params` parameter is an object that contains two properties:
   * @returns an array of sorted Operation objects.
   */
  static sort(
    sources: Operation[],
    params: { sortKey: string; sortOrder: string }
  ) {
    const startTime = new Date().getTime();
    log.info("Sorting...");
    log.debug("Sort Sources:", sources, true);
    if (Array.isArray(sources[0])) {
      log.info("Sorting by", [params.sortKey, params.sortOrder]);
      const sortKey = params.sortKey || "track.popularity";
      const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

      return sources[0].sort((a, b) => {
        const keyA = sortKey.split(".").reduce((o, i) => o[i], a);
        const keyB = sortKey.split(".").reduce((o, i) => o[i], b);
        if (keyA < keyB) return sortOrder === "asc" ? -1 : 1;
        if (keyA > keyB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    const endTime = new Date().getTime();
    return [];
  }
  static shuffle(sources: Operation[], params: {}) {
    const startTime = new Date().getTime();
    log.info("Shuffling...");
    log.debug("Shuffle Sources:", sources, true);
    if (Array.isArray(sources[0])) {
      return sources[0].sort(() => Math.random() - 0.5);
    }
    const endTime = new Date().getTime();
    return [];
  }
}
