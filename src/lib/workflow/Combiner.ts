import { type SpotifyApi } from "@spotify/web-api-ts-sdk";

import { Logger } from "../log";
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";

const log = new Logger("Combiner");

export default class Combiner extends Base {
  /**
   * Pushes the tracks from the given sources into a single array.
   *
   * @param _spClient - The SpotifyWebApi client.
   * @param sources - An array of sources containing tracks.
   * @param _params - Additional parameters (currently unused).
   * @returns An array of PlaylistTrackObject containing the combined tracks from all sources.
   */
  static push(_spClient: SpotifyApi, sources: any[], _params: {}) {
    log.debug("Push Sources:", sources);
    log.info("Pushing...");
    const result: SpotifyApi.PlaylistTrackObject[] = [];
    for (const source of sources) {
      if (source.tracks) {
        result.push(...source.tracks);
      } else if (Array.isArray(source)) {
        result.push(...source);
      } else {
        log.error("Invalid source type:", typeof source);
      }
    }
    return result;
  }

  static isPlaylistTrackObject = (
    obj: any,
  ): obj is SpotifyApi.PlaylistTrackObject => {
    return obj?.hasOwnProperty("track");
  };

  /**
   * Combines the tracks from multiple sources in an alternating manner.
   *
   * @param _spClient - The SpotifyWebApi instance.
   * @param sources - An array of sources containing tracks to be combined.
   * @param _params - Additional parameters (currently unused).
   * @returns An array of PlaylistTrackObject representing the combined tracks.
   * @throws Error if the source type is invalid.
   */
  static alternate(_spClient: SpotifyApi, sources: any[], _params: {}) {
    log.debug("Alternate Sources:", sources);
    log.info("Alternating...");
    const result: SpotifyApi.PlaylistTrackObject[] = [];
    let longestSourceLength = 0;

    const sourcesTracks = sources.map((source) => {
      let tracks: SpotifyApi.PlaylistTrackObject[];
      if (
        Array.isArray(source) &&
        source.every(Combiner.isPlaylistTrackObject)
      ) {
        tracks = source;
      } else if (source.tracks && Array.isArray(source.tracks)) {
        tracks = source.tracks;
      } else {
        log.error("Invalid source type:", typeof source);
        throw new Error("Invalid source type");
      }
      if (tracks.length > longestSourceLength) {
        longestSourceLength = tracks.length;
      }
      return tracks;
    });

    // Interleave the tracks from each source
    for (let i = 0; i < longestSourceLength; i++) {
      for (const source of sourcesTracks) {
        if (source[i] !== undefined) {
          result.push(source[i]!);
        }
      }
    }
    return result;
  }

  /**
   * Selects a random stream from the given sources.
   *
   * @param _spClient - The SpotifyWebApi client.
   * @param sources - An array of sources.
   * @param _params - Additional parameters.
   * @returns An array of SpotifyApi.PlaylistTrackObject representing the selected random stream.
   */
  static randomStream(_spClient: SpotifyApi, sources: any[], _params: {}) {
    log.debug("RandomStream Sources:", sources);
    log.info("Selecting a random stream...");

    const result: SpotifyApi.PlaylistTrackObject[] = [];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];

    if (randomSource.tracks) {
      result.push(...randomSource.tracks);
    } else if (Array.isArray(randomSource)) {
      result.push(...randomSource);
    } else {
      log.error("Invalid source type:", typeof randomSource);
    }

    return result;
  }
}
