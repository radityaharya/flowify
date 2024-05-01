import type SpotifyWebApi from "spotify-web-api-node";
import { Logger } from "../log";
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import _ from "lodash";

const log = new Logger("Order");
export default class Order extends Base {
  /**
   * The function sorts an array of objects based on a specified sort key and sort order.
   * @param {Operation[]} sources - An array of Operation objects.
   * @param params - The `params` parameter is an object that contains two properties:
   * @returns an array of sorted Operation objects.
   */
  static sort(
    _spClient: SpotifyWebApi,
    sources: any[],
    params: { sortKey: string; sortOrder: string },
  ) {
    log.info("Sorting...");
    log.debug("Sort Sources:", sources);

    const tracks = Order.getTracks(sources);

    if (_.isArray(tracks)) {
      log.info("Sorting by", [params.sortKey, params.sortOrder]);
      const sortKey = params.sortKey || "popularity";
      const sortOrder = params.sortOrder === "asc" ? "asc" : "desc";

      const sortedTracks = _.orderBy(
        tracks,
        [(track) => _.get(track, sortKey)],
        [sortOrder],
      );

      return sortedTracks;
    }
    return [];
  }

  static shuffle(
    _spClient: SpotifyWebApi,
    sources: any[],
    params: { weight: number },
  ) {
    log.info("Shuffling...");
    log.debug("Shuffle Sources:", sources);

    const tracks = Order.getTracks(sources);

    if (_.isArray(tracks)) {
      const weight = params.weight || 0.5; // Default weight is 0.5 if not provided
      return _.orderBy(tracks, () => Math.pow(Math.random(), weight));
    }
    return [];
  }

  static reverse(_spClient: SpotifyWebApi, sources: any[], _params: {}) {
    log.info("Reversing...");
    log.debug("Reverse Sources:", sources);

    const tracks = Order.getTracks(sources);

    if (_.isArray(tracks)) {
      return tracks.reverse();
    }
    return [];
  }

  static separateArtists(
    _spClient: SpotifyWebApi,
    sources: any[],
    _params: {},
  ) {
    log.info("Separating Artists...");
    log.debug("Separate Artists Sources:", sources);

    const tracks = Order.getTracks(sources);

    const groupedTracks = _.groupBy(tracks, (track) => track.artists[0]!.id);

    const sortedGroups = _.orderBy(_.values(groupedTracks), "length", "desc");

    const interleavedTracks: (SpotifyApi.TrackObjectFull | undefined)[] = [];
    while (
      _.some(
        sortedGroups,
        (group: SpotifyApi.TrackObjectFull[]) => group.length > 0,
      )
    ) {
      _.forEach(sortedGroups, (group: SpotifyApi.TrackObjectFull[]) => {
        if (group.length > 0) {
          interleavedTracks.push(group.shift());
        }
      });
    }
    return interleavedTracks;
  }
}
