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


  static isPlaylistTrackObject(
    obj: any,
  ): obj is SpotifyApi.PlaylistTrackObject {
    return obj?.hasOwnProperty("track");
  }

  static isPlaylistTrackObjectArray(
    obj: any,
  ): obj is SpotifyApi.PlaylistTrackObject[] {
    return (
      Array.isArray(obj) &&
      obj.every((item: any) => this.isPlaylistTrackObject(item))
    );
  }

  /**
   * The function sorts an array of objects based on a specified sort key and sort order.
   * @param {Operation[]} sources - An array of Operation objects.
   * @param params - The `params` parameter is an object that contains two properties:
   * @returns an array of sorted Operation objects.
   */
  static sort(
    sources: any[],
    params: { sortKey: string; sortOrder: string }
  ) {
    log.info("Sorting...");
    log.debug("Sort Sources:", sources, true);

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Order.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Order.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    if (Array.isArray(tracks)) {
      log.info("Sorting by", [params.sortKey, params.sortOrder]);
      const sortKey = params.sortKey || "track.popularity";
      const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

      return tracks.sort((a, b) => {
        const keyA = sortKey.split(".").reduce((o, i) => o[i], a);
        const keyB = sortKey.split(".").reduce((o, i) => o[i], b);
        if (keyA < keyB) return sortOrder === "asc" ? -1 : 1;
        if (keyA > keyB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return [];
  }
  static shuffle(sources: any[], params: {}) {
    log.info("Shuffling...");
    log.debug("Shuffle Sources:", sources, true);

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Order.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Order.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    if (Array.isArray(tracks)) {
      return tracks.sort(() => Math.random() - 0.5);
    }
    return [];
  }
}
