import { type SpotifyApi } from "@spotify/web-api-ts-sdk";
import _ from "lodash";

import { Logger } from "../log";
import { Base } from "./Base";

const log = new Logger("Workflow");

export default class Filter extends Base {
  static filter(
    _spClient: SpotifyApi,
    sources: any[],
    params: { filterKey: string; filterValue: string },
  ) {
    log.info("Filtering...");
    log.debug("Filter Sources:", sources);

    const tracks = Filter.getTracks(sources);

    if (Array.isArray(tracks)) {
      const res = tracks.filter((track: any) => {
        if (params.filterKey && params.filterValue) {
          const [operator, value] = params.filterValue.split(" ");
          const trackValue = _.get(track, params.filterKey);

          let filterValue: string | number | Date | boolean | object;

          if (!Number.isNaN(Number(value))) {
            filterValue = Number(value);
          } else if (!Number.isNaN(Date.parse(value ?? ""))) {
            filterValue = value ? new Date(value) : new Date();
          } else {
            filterValue = value ?? "";
          }

          if (typeof filterValue === "number") {
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
          } else if (typeof filterValue === "string") {
            return trackValue.includes(filterValue);
          } else if (typeof filterValue === "boolean") {
            return trackValue === filterValue;
          } else if (filterValue instanceof Date) {
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

  static dedupeTracks(
    _spClient: SpotifyApi,
    sources: any[],
    _params: NonNullable<unknown>,
  ) {
    log.info("Deduping tracks...");
    log.debug("DedupeTracks Sources:", sources);

    const tracks = Filter.getTracks(sources);

    if (Array.isArray(tracks)) {
      return [...new Map(tracks.map((item) => [item.id, item])).values()];
    }
    return [];
  }

  static dedupeArtists(
    _spClient: SpotifyApi,
    sources: any[],
    _params: NonNullable<unknown>,
  ) {
    log.info("Deduping artists...");
    log.debug("DedupeArtists Sources:", sources);
    const tracks = Filter.getTracks(sources);

    if (Array.isArray(tracks)) {
      const uniqueTracks = _.uniqBy(tracks, (track) =>
        _.get(track, "artists[0].id", ""),
      );
      return uniqueTracks;
    }
    return [];
  }

  static match(
    _spClient: SpotifyApi,
    sources: any[],
    params: { matchKey: string; matchValue: string },
  ) {
    log.info("Matching...");
    log.debug("Match Sources:", sources);

    const tracks = Filter.getTracks(sources);

    if (Array.isArray(tracks)) {
      const res = tracks.filter((track: any) => {
        if (params.matchKey && params.matchValue) {
          const [operator, value] = params.matchValue.split(" ");
          const trackValue = _.get(track, params.matchKey);

          let matchValue: string | number | Date | boolean | object = "";

          if (!Number.isNaN(Number(value))) {
            matchValue = Number(value);
          } else if (!Number.isNaN(Date.parse(value ?? ""))) {
            matchValue = value ? new Date(value) : new Date();
          } else {
            matchValue = value ?? "";
          }

          if (typeof matchValue === "number") {
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
          } else if (typeof matchValue === "string") {
            return trackValue.includes(matchValue);
          } else if (typeof matchValue === "boolean") {
            return trackValue === matchValue;
          } else if (matchValue instanceof Date) {
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
    _spClient: SpotifyApi,
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
