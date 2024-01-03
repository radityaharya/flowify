/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import type { Operation } from "./types";
import * as _ from "radash";
import type { AccessToken } from './Base'
import {Logger} from '../log'

const log = new Logger("Filter");
export default class Filter extends Base {
  constructor(accessToken: AccessToken){
    super(accessToken);
  }
  static isPlaylistTrackObject(
    obj: any
  ): obj is SpotifyApi.PlaylistTrackObject {
    return obj?.hasOwnProperty("track");
  }

  static isPlaylistTrackObjectArray(
    obj: any
  ): obj is SpotifyApi.PlaylistTrackObject[] {
    return Array.isArray(obj) && obj.every((item: any) => this.isPlaylistTrackObject(item));
  }

  static filter(
    sources: any[],
    params: { filterKey: string; filterValue: string }
  ) {
    log.info("Filtering...");
    log.debug("Filter Sources:", sources, true);

    let tracks = [] as any;

    if (Array.isArray(sources) && Array.isArray(sources[0]) && Filter.isPlaylistTrackObjectArray(sources[0])) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty('tracks')) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Filter.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${sources[0]} located in sources: ${JSON.stringify(sources)}`
      );
    }

    if (Array.isArray(tracks)) {
      const res = tracks.filter((track: any) => {
        if (params.filterKey && params.filterValue) {
          const [operator, value] = params.filterValue.split(" ") as [
            string,
            string
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
                const trackDateValue = new Date((trackValue as number | string | Date));
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
                `Unsupported filterValue type: ${typeof filterValue}`
              );
          }
        }
        const endTime = new Date().getTime();
        //log.log("Filter time:", endTime - startTime);
        return true;
      });
      return res;
    } else {
      throw new Error(`Invalid source type: ${typeof tracks}`);
    }
  }

  static dedupeTracks(sources: Operation[], params: {}) {
    log.info("Deduping tracks...");
    log.debug("DedupeTracks Sources:", sources, true);
    const source = sources[0];
    if (Array.isArray(source)) {
      return [
        ...new Map(source.map((item) => [item.id, item])).values(),
      ] as SpotifyApi.PlaylistTrackObject[];
    }
    return [];
  }

  static dedupeArtists(sources: Operation[], params: {}) {
    log.info("Deduping artists...");
    log.debug("DedupeArtists Sources:", sources, true);
    const startTime = new Date().getTime();
    const source = sources[0];
    if (_.isArray(source)) {
      return _.unique(source, (track): string | number | symbol =>
        _.get(track, "track.artists[0].id")
      ) as SpotifyApi.PlaylistTrackObject[];
    }
    const endTime = new Date().getTime();
    //log.log("DedupeArtists time:", endTime - startTime);
    return [];
  }

  static match(
    sources: Operation[],
    params: { matchKey: string; matchValue: string }
  ) {
    log.info("Matching...");
    log.debug("Match Sources:", sources, true);
    const source = sources[0];
    if (Array.isArray(source)) {
      return source.filter((track) => {
        if (params.matchKey && params.matchValue) {
          // const regex = new RegExp(params.matchValue, "i");
          const matchKeyPath = params.matchKey.split(".");
          log.debug("Match Key Path:", matchKeyPath);
          let matchKeyValue: any = track;
          for (const pathSegment of matchKeyPath) {
            log.debug("Path Segment:", pathSegment);
            const arrayMatch = pathSegment.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch) {
              const key = arrayMatch[1];
              const index = parseInt(arrayMatch[2]!);
              if (!matchKeyValue.hasOwnProperty(key)) {
                throw new Error(`Key "${key}" not found in track`);
              }
              matchKeyValue = matchKeyValue[key!][index];
            } else {
              if (!matchKeyValue.hasOwnProperty(pathSegment)) {
                throw new Error(`Key "${pathSegment}" not found in track`);
              }
              matchKeyValue = matchKeyValue[pathSegment];
              log.debug("Match Key Value:", matchKeyValue);
            }
          }
          return matchKeyValue;
        }
        return true;
      });
    } else {
      throw new Error(
        `Invalid source type: ${typeof source}`
      );
    }
  }

  static limit(sources: any[], params: { limit?: number }) {
    log.info("Limiting...");
    log.debug("Limit Sources:", sources, true);
    // const startTime = new Date().getTime();
    const source = sources[0];
    if (Array.isArray(source)) {
      return source.slice(0, params.limit);
    }
    // const endTime = new Date().getTime();
    //log.log("Limit time:", endTime - startTime);
    return [];
  }
}