/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import * as _ from "radash";
import type { AccessToken } from "./Base";
import { Logger } from "../log";

const log = new Logger("Workflow");
export default class Filter extends Base {
  constructor(accessToken: AccessToken) {
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

  static filter(
    sources: any[],
    params: { filterKey: string; filterValue: string },
  ) {
    log.info("Filtering...");
    log.debug("Filter Sources:", sources, true);

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Filter.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Filter.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    if (Array.isArray(tracks)) {
      const res = tracks.filter((track: any) => {
        if (params.filterKey && params.filterValue) {
          const [operator, value] = params.filterValue.split(" ") as [
            string,
            string,
          ];
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const trackValue = _.get(track, params.filterKey) as any;

          let type = "string";
          let filterValue: string | number | Date | boolean | object;

          if (!isNaN(Number(value))) {
            filterValue = Number(value);
            type = "number";
          } else if (!isNaN(Date.parse(value))) {
            filterValue = new Date(value);
            type = "date";
          } else {
            filterValue = value;
          }

          switch (type) {
            case "number":
              switch (operator) {
                case ">":
                  return trackValue > filterValue;
                case "<":
                  return trackValue < filterValue;
                case ">=":
                  return trackValue >= filterValue;
                case "<=":
                  return trackValue <= filterValue;
                case "==":
                  return trackValue == filterValue;
                default:
                  throw new Error(`Invalid operator: ${operator}`);
              }
            case "string":
              return trackValue.includes(filterValue);
            case "boolean":
              return trackValue == Boolean(filterValue);
            case "object":
              if (filterValue instanceof Date) {
                const trackDateValue = new Date(
                  trackValue as number | string | Date,
                );
                switch (operator) {
                  case ">":
                    return trackDateValue > filterValue;
                  case "<":
                    return trackDateValue < filterValue;
                  case ">=":
                    return trackDateValue >= filterValue;
                  case "<=":
                    return trackDateValue <= filterValue;
                  case "==":
                    return trackDateValue.getTime() == filterValue.getTime();
                  default:
                    throw new Error(`Invalid operator: ${operator}`);
                }
              }
            default:
              throw new Error(
                `Unsupported filterValue type: ${typeof filterValue}`,
              );
          }
        }
        return true;
      });
      return res;
    } else {
      throw new Error(`Invalid source type: ${typeof tracks}`);
    }
  }

  static dedupeTracks(sources: any[], params: {}) {
    log.info("Deduping tracks...");
    log.debug("DedupeTracks Sources:", sources, true);

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Filter.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Filter.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    if (Array.isArray(tracks)) {
      return [
        ...new Map(tracks.map((item) => [item.id, item])).values(),
      ] as SpotifyApi.PlaylistTrackObject[];
    }
    return [];
  }

  static dedupeArtists(sources: any[], params: {}) {
    log.info("Deduping artists...");
    log.debug("DedupeArtists Sources:", sources, true);
    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Filter.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Filter.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    if (_.isArray(tracks)) {
      return _.unique(tracks, (track): string | number | symbol =>
        _.get(track, "track.artists[0].id"),
      ) as SpotifyApi.PlaylistTrackObject[];
    }
    return [];
  }

  static match(
    sources: any[],
    params: { matchKey: string; matchValue: string },
  ) {
    log.info("Matching...");
    log.debug("Match Sources:", sources, true);

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Filter.isPlaylistTrackObjectArray(sources[0])
    ) {
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Filter.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    if (Array.isArray(tracks)) {
      const res = tracks.filter((track: any) => {
        if (params.matchKey && params.matchValue) {
          const [operator, value] = params.matchValue.split(" ") as [
            string,
            string,
          ];
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const trackValue = _.get(track, params.matchKey) as any;

          let type = "string";
          let matchValue: string | number | Date | boolean | object;

          if (!isNaN(Number(value))) {
            matchValue = Number(value);
            type = "number";
          } else if (!isNaN(Date.parse(value))) {
            matchValue = new Date(value);
            type = "date";
          } else {
            matchValue = value;
          }

          switch (type) {
            case "number":
              switch (operator) {
                case ">":
                  return trackValue > matchValue;
                case "<":
                  return trackValue < matchValue;
                case ">=":
                  return trackValue >= matchValue;
                case "<=":
                  return trackValue <= matchValue;
                case "==":
                  return trackValue == matchValue;
                default:
                  throw new Error(`Invalid operator: ${operator}`);
              }
            case "string":
              return trackValue.includes(matchValue);
            case "boolean":
              return trackValue == Boolean(matchValue);
            case "object":
              if (matchValue instanceof Date) {
                const trackDateValue = new Date(
                  trackValue as number | string | Date,
                );
                switch (operator) {
                  case ">":
                    return trackDateValue > matchValue;
                  case "<":
                    return trackDateValue < matchValue;
                  case ">=":
                    return trackDateValue >= matchValue;
                  case "<=":
                    return trackDateValue <= matchValue;
                  case "==":
                    return trackDateValue.getTime() == matchValue.getTime();
                  default:
                    throw new Error(`Invalid operator: ${operator}`);
                }
              }
            default:
              throw new Error(
                `Unsupported matchValue type: ${typeof matchValue}`,
              );
          }
        }
        return false;
      });
      return res;
    } else {
      throw new Error(`Invalid source type: ${typeof tracks}`);
    }
  }

  static limit(sources: any[], params: { limit?: number }) {
    log.info("Limiting...");
    log.debug("Limit Sources:", sources, true);

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Filter.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Filter.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    if (Array.isArray(tracks)) {
      return tracks.slice(0, params.limit);
    }
    return [];
  }
}
