import { type SpotifyApi } from "@spotify/web-api-ts-sdk";
import _ from "lodash";

import { Logger } from "../log";
import { Base } from "./Base";

const log = new Logger("Order");

export default class Order extends Base {
  /**
   * The function sorts an array of objects based on a specified sort key and sort order.
   * @param {Operation[]} sources - An array of Operation objects.
   * @param params - The `params` parameter is an object that contains two properties:
   * @returns an array of sorted Operation objects.
   */
  static sort(
    _spClient: SpotifyApi,
    sources: any[],
    params: { sortKey: string; sortOrder: string },
  ) {
    log.info("Sorting...");
    log.debug("Sort Sources:", sources);

    const tracks = Order.getTracks(sources);

    if (Array.isArray(tracks)) {
      log.info("Sorting by", [params.sortKey, params.sortOrder]);
      const sortKey = params.sortKey || "popularity";
      const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

      return _.orderBy(tracks, [(track) => _.get(track, sortKey)], [sortOrder]);
    }
    return [];
  }

  static shuffle(
    _spClient: SpotifyApi,
    sources: any[],
    params: { weight: number },
  ) {
    log.info("Shuffling...");
    log.debug("Shuffle Sources:", sources);

    const tracks = Order.getTracks(sources);

    if (Array.isArray(tracks)) {
      const weight = params.weight || 0.5; // Default weight is 0.5 if not provided
      return _.orderBy(tracks, () => Math.pow(Math.random(), weight));
    }
    return [];
  }

  static reverse(
    _spClient: SpotifyApi,
    sources: any[],
    _params: NonNullable<unknown>,
  ) {
    log.info("Reversing...");
    log.debug("Reverse Sources:", sources);

    const tracks = Order.getTracks(sources);

    if (Array.isArray(tracks)) {
      return tracks.reverse();
    }
    return [];
  }

  static separateArtists(
    _spClient: SpotifyApi,
    sources: any[],
    _params: NonNullable<unknown>,
  ) {
    log.info("Separating Artists...");
    log.debug("Separate Artists Sources:", sources);

    const tracks = Order.getTracks(sources);

    const groupedTracks = _.groupBy(tracks, (track) => track.artists[0]!.id);

    const sortedGroups = _.orderBy(
      Object.values(groupedTracks),
      "length",
      "desc",
    );

    const interleavedTracks: (SpotifyApi.TrackObjectFull | undefined)[] = [];
    while (sortedGroups.some((group) => group.length > 0)) {
      sortedGroups.forEach((group) => {
        if (group.length > 0) {
          interleavedTracks.push(group.shift());
        }
      });
    }
    return interleavedTracks;
  }
}
