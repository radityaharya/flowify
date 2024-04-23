import * as _ from "radash";
import type SpotifyWebApi from "spotify-web-api-node";
import { Logger } from "../log";
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";

const log = new Logger("Workflow");
export default class Filter extends Base {
  static filter(
    _spClient: SpotifyWebApi,
    sources: any[],
    params: { filterKey: string; filterValue: string },
  ) {
    log.info("Filtering...");
    log.debug("Filter Sources:", sources);

    const tracks = Filter.getTracks(sources);

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

          if (!Number.isNaN(Number(value))) {
            filterValue = Number(value);
            type = "number";
          } else if (!Number.isNaN(Date.parse(value))) {
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
                  return trackValue === filterValue;
                default:
                  throw new Error(`Invalid operator: ${operator}`);
              }
            case "string":
              return trackValue.includes(filterValue);
            case "boolean":
              return trackValue === Boolean(filterValue);
            // biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
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
                    return trackDateValue.getTime() === filterValue.getTime();
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

  static dedupeTracks(_spClient: SpotifyWebApi, sources: any[], _params: {}) {
    log.info("Deduping tracks...");
    log.debug("DedupeTracks Sources:", sources);

    const tracks = Filter.getTracks(sources);

    if (Array.isArray(tracks)) {
      return [...new Map(tracks.map((item) => [item.id, item])).values()];
    }
    return [];
  }

  static dedupeArtists(_spClient: SpotifyWebApi, sources: any[], _params: {}) {
    log.info("Deduping artists...");
    log.debug("DedupeArtists Sources:", sources);
    const tracks = Filter.getTracks(sources);

    if (_.isArray(tracks)) {
      return _.unique(tracks, (track): string | number | symbol =>
        _.get(track, "track.artists[0].id"),
      );
    }
    return [];
  }

  static match(
    _spClient: SpotifyWebApi,
    sources: any[],
    params: { matchKey: string; matchValue: string },
  ) {
    log.info("Matching...");
    log.debug("Match Sources:", sources);

    const tracks = Filter.getTracks(sources);

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

          if (!Number.isNaN(Number(value))) {
            matchValue = Number(value);
            type = "number";
          } else if (!Number.isNaN(Date.parse(value))) {
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
                  return trackValue === matchValue;
                default:
                  throw new Error(`Invalid operator: ${operator}`);
              }
            case "string":
              return trackValue.includes(matchValue);
            case "boolean":
              return trackValue === Boolean(matchValue);
            // biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
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
                    return trackDateValue.getTime() === matchValue.getTime();
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

  static limit(
    _spClient: SpotifyWebApi,
    sources: any[],
    params: { limit?: number },
  ) {
    log.info("Limiting...");
    log.debug("Limit Sources:", sources);

    const tracks = Filter.getTracks(sources);

    if (Array.isArray(tracks)) {
      return tracks.slice(0, params.limit);
    }
    return [];
  }
}
