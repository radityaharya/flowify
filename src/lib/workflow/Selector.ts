import { type SpotifyApi } from "@spotify/web-api-ts-sdk";

import { Logger } from "../log";
import { Base } from "./Base";

const log = new Logger("Workflow");

export default class Selector extends Base {
  /**
   * Returns the first `count` tracks from the given sources.
   *
   * @param spClient - The SpotifyWebApi client.
   * @param sources - An array of sources.
   * @param params - An object containing the `count` parameter.
   * @returns An array of tracks.
   * @throws Error if the source type is invalid.
   */
  static first(
    _spClient: SpotifyApi,
    sources: any[],
    params: { count: number },
  ) {
    log.info("First Selection...");
    log.debug("First Sources:", sources);

    const tracks = Selector.getTracks(sources);

    if (Array.isArray(tracks)) {
      return tracks.slice(0, params.count || 1);
    } else {
      throw new Error(`Invalid source type: ${typeof tracks}`);
    }
  }

  /**
   * Returns the last `count` number of tracks from the given sources.
   *
   * @param spClient - The SpotifyWebApi client.
   * @param sources - An array of sources.
   * @param params - An object containing the `count` parameter.
   * @returns An array of tracks.
   * @throws Error if the source type is invalid.
   */
  static last(
    _spClient: SpotifyApi,
    sources: any[],
    params: { count: number },
  ) {
    log.info("Last Selection...");
    log.debug("Last Sources:", sources);

    const tracks = Selector.getTracks(sources);

    if (Array.isArray(tracks)) {
      return tracks.slice(tracks.length - params.count || 1);
    } else {
      throw new Error(`Invalid source type: ${typeof tracks}`);
    }
  }

  /**
   * Returns all elements from the given sources array except the first element.
   * Throws an error if the source type is invalid.
   *
   * @param spClient - The SpotifyWebApi client.
   * @param sources - An array of sources.
   * @param params - The parameters object containing the count property.
   * @returns An array of tracks excluding the first track.
   * @throws Error if the source type is invalid.
   */
  static allButFirst(
    _spClient: SpotifyApi,
    sources: any[],
    _params: NonNullable<unknown>,
  ) {
    log.info("All But First Selection...");
    log.debug("All But First Sources:", sources);

    const tracks = Selector.getTracks(sources);

    if (Array.isArray(tracks)) {
      return tracks.slice(1);
    } else {
      throw new Error(`Invalid source type: ${typeof tracks}`);
    }
  }

  /**
   * Returns all but the last element from the given sources array.
   *
   * @param spClient - The SpotifyWebApi client.
   * @param sources - An array of sources.
   * @param params - Additional parameters.
   * @param params.count - The number of elements to retrieve.
   * @returns An array containing all but the last element from the sources array.
   * @throws An error if the source type is invalid.
   */
  static allButLast(
    _spClient: SpotifyApi,
    sources: any[],
    _params: NonNullable<unknown>,
  ) {
    log.info("All But Last Selection...");
    log.debug("All But Last Sources:", sources);

    const tracks = Selector.getTracks(sources);

    if (Array.isArray(tracks)) {
      return tracks.slice(0, tracks.length - 1);
    } else {
      throw new Error(`Invalid source type: ${typeof tracks}`);
    }
  }

  /**
   * Selects a random number of items from sources.
   *
   * @param sources - The array of elements to select from.
   * @param params - The parameters for the selection.
   * @param params.count - The number of elements to select.
   */
  static random(
    _spClient: SpotifyApi,
    sources: any[],
    params: { count: number },
  ) {
    log.info("Random Selection...");
    log.debug("Random Sources:", sources);

    const tracks = Selector.getTracks(sources);

    if (Array.isArray(tracks)) {
      const res = new Set();
      while (res.size < params.count) {
        const randomIndex = Math.floor(Math.random() * tracks.length);
        if (tracks[randomIndex]) {
          const track = tracks[randomIndex];
          if (track) {
            res.add(track);
          }
        }
      }
      return Array.from(res);
    } else {
      throw new Error(`Invalid source type: ${typeof tracks}`);
    }
  }

  /**
   * Uses Spotify's recommendation API to recommend items based on the sources.
   * Seeds can be: tracks, artists pulled randomly from the sources.
   *
   *
   * @param sources - An array of sources to select items from.
   * @param params - The parameters for the recommendation.
   * @param params.count - The number of items to recommend.
   */
  static async recommend(
    spClient: SpotifyApi,
    sources: any[],
    params: { count: number; seedType?: "tracks" | "artists" } = {
      count: 20,
      seedType: "tracks",
    },
  ) {
    log.info("Recommendation...");
    const tracks = Selector.getTracks(sources);

    const seedTracks = new Array<SpotifyApi.TrackObjectFull>();
    let maxRetry = 20;

    if (Array.isArray(tracks)) {
      let res = new Set<SpotifyApi.TrackObjectFull>();
      if (tracks.length <= 5) {
        res = new Set(tracks);
      } else {
        while (res.size < 5) {
          if (maxRetry === 0) {
            throw new Error("Failed to get seed tracks");
          }
          // 5 is the max number of seed shared between tracks, artists, and genres
          const randomIndex = Math.floor(Math.random() * tracks.length);
          const track = tracks[randomIndex];
          if (track) {
            res.add(track);
          }
          maxRetry--;
        }
      }
      seedTracks.push(...Array.from(res));
    } else {
      throw new Error(`Invalid source type: ${typeof tracks}`);
    }

    const seedTrackIds = Array.from(seedTracks).map((track) => track.id);
    const seedArtists = Array.from(seedTracks).map(
      (track) => track.artists[0]!.id,
    );

    // Validate seed IDs
    if (seedTrackIds.length === 0 && seedArtists.length === 0) {
      throw new Error("No valid seed tracks or artists found");
    }

    // Validate params.seedType
    if (params.seedType === undefined) {
      params.seedType = "tracks";
    }

    try {
      const request = {
        limit: params.count,
        seed_tracks: params.seedType === "tracks" ? seedTrackIds : undefined,
        seed_artists: params.seedType === "artists" ? seedArtists : undefined,
      };

      log.info("Recommendation Request:", request);
      const rec = await spClient.recommendations.get(request);
      return rec;
    } catch (error) {
      log.error("Error fetching recommendations:", error);
      throw error;
    }
  }
}
