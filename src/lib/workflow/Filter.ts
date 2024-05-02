import _ from "lodash";
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

    if (_.isArray(tracks)) {
      const res = _.filter(tracks, (track: any) => {
        if (params.filterKey && params.filterValue) {
          const [operator, value] = params.filterValue.split(" ") as [
            string,
            string,
          ];
          const trackValue = _.get(track, params.filterKey);

          let filterValue: string | number | Date | boolean | object;

          if (!_.isNaN(_.toNumber(value))) {
            filterValue = _.toNumber(value);
          } else if (!_.isNaN(Date.parse(value))) {
            filterValue = new Date(value);
          } else {
            filterValue = value;
          }

          if (_.isNumber(filterValue)) {
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
          } else if (_.isString(filterValue)) {
            return _.includes(trackValue, filterValue);
          } else if (_.isBoolean(filterValue)) {
            return trackValue === Boolean(filterValue);
          } else if (_.isObject(filterValue) && _.isDate(filterValue)) {
            const trackDateValue = new Date(trackValue);
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
          } else {
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
      const uniqueTracks = _.uniqBy(tracks, (track): string | number | symbol =>
        _.get(track, "artists[0].id", ""),
      );
      return uniqueTracks;
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

    if (_.isArray(tracks)) {
      const res = _.filter(tracks, (track: any) => {
        if (params.matchKey && params.matchValue) {
          const [operator, value] = params.matchValue.split(" ") as [
            string,
            string,
          ];
          const trackValue = _.get(track, params.matchKey);

          let matchValue: string | number | Date | boolean | object;

          if (!_.isNaN(_.toNumber(value))) {
            matchValue = _.toNumber(value);
          } else if (!_.isNaN(Date.parse(value))) {
            matchValue = new Date(value);
          } else {
            matchValue = value;
          }

          if (_.isNumber(matchValue)) {
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
          } else if (_.isString(matchValue)) {
            return _.includes(trackValue, matchValue);
          } else if (_.isBoolean(matchValue)) {
            return trackValue === Boolean(matchValue);
          } else if (_.isObject(matchValue) && _.isDate(matchValue)) {
            const trackDateValue = new Date(trackValue);
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
          } else {
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

  // static trackFilter(
  //   _spClient: SpotifyWebApi,
  //   sources: any[],
  //   params: { filterOperationId: string | undefined },
  // ) {
  //   log.info("Filtering tracks...");
  //   log.debug("Filter Sources:", sources);

  //   const tracks = Filter.getTracks(sources);
  //   if (!params.filterOperationId) {
  //     return tracks;
  //   }
  //   const filterTracks = Filter.getTracks(
  //     this.operationValues.get(params.filterOperationId),
  //   );

  //   if (_.isArray(tracks) && _.isArray(filterTracks)) {
  //     return _.differenceBy(tracks, filterTracks, "id");
  //   }

  //   return [];
  // }
}
