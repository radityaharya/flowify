import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import _ from "lodash";
import { env } from "~/env";
import { Logger } from "../log";

export interface UserCredential {
  slug: string;
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
  };
}

const log = new Logger("Base");

export class Base {
  public spClient: SpotifyApi;
  public operationValues: Map<string, any> = new Map();

  constructor(
    public userCredential: UserCredential,
    _spClient?: SpotifyApi,
  ) {
    this.spClient = SpotifyApi.withAccessToken(
      env.SPOTIFY_CLIENT_ID,
      userCredential.token,
    );
  }

  authedSpotifyApi() {
    return this.spClient;
  }

  static async addTracksBatch(
    spClient: SpotifyApi,
    playlistId: string,
    trackUris: string[],
  ) {
    try {
      const chunkSize = 50;
      let retryAfter = 0;

      const chunk = <T>(array: T[], size: number): T[][] => {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      };

      const trackChunks = chunk(trackUris, chunkSize);

      log.debug("Adding tracks to playlist", trackChunks);

      for (const trackChunk of trackChunks) {
        while (true) {
          try {
            log.debug(`Adding tracks to playlist ${playlistId}`);
            await new Promise((resolve) =>
              setTimeout(resolve, retryAfter * 1000),
            );
            await spClient.playlists.addItemsToPlaylist(playlistId, trackChunk);
            break;
          } catch (error: any) {
            if (error.statusCode === 429) {
              retryAfter = error.headers["retry-after"];
              log.warn(`Rate limited. Retrying after ${retryAfter} seconds.`);
            } else {
              throw error;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error adding tracks to playlist", err);
      throw new Error(
        "Error adding tracks to playlist " + (err as Error).message,
      );
    }
  }

  static async removeTracksBatch(
    spClient: SpotifyApi,
    playlistId: string,
    trackUris: string[],
  ) {
    try {
      const chunkSize = 50;
      let retryAfter = 0;

      const chunk = <T>(array: T[], size: number): T[][] => {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      };

      const trackChunks = chunk(trackUris, chunkSize);

      log.debug("Removing tracks from playlist", trackChunks);

      for (const trackChunk of trackChunks) {
        while (true) {
          try {
            log.debug(`Removing tracks from playlist ${playlistId}`);
            await new Promise((resolve) =>
              setTimeout(resolve, retryAfter * 1000),
            );
            const trackObjects = trackChunk.map((uri) => ({ uri }));
            log.info("Removing tracks", trackObjects);
            await spClient.playlists.removeItemsFromPlaylist(playlistId, {
              tracks: trackObjects,
            });
            break;
          } catch (error: any) {
            if (error.statusCode === 429) {
              retryAfter = error.headers["retry-after"];
              log.warn(`Rate limited. Retrying after ${retryAfter} seconds.`);
            } else {
              throw error;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error removing tracks from playlist", err);
      throw new Error(
        "Error removing tracks from playlist " + (err as Error).message,
      );
    }
  }

  static async replaceTracksBatch(
    spClient: SpotifyApi,
    id: string,
    newTrackUris: string[],
  ) {
    try {
      let offset = 0;
      const limit = 50;
      let existingTrackUris: string[] = [];

      // Fetch all existing tracks with pagination
      while (true) {
        const existingTracks = await spClient.playlists.getPlaylistItems(
          id,
          undefined,
          undefined,
          limit,
          offset,
        );
        const trackUris = existingTracks.items.map((track) => track.track.uri);
        existingTrackUris = existingTrackUris.concat(trackUris);

        if (existingTracks.items.length < limit) {
          break; // No more items to fetch
        }

        offset += limit;
      }

      // Remove all existing tracks
      await Base.removeTracksBatch(spClient, id, existingTrackUris);

      await Base.addTracksBatch(spClient, id, newTrackUris);
    } catch (err) {
      console.error("Error replacing tracks in playlist", err);
      throw new Error(
        "Error replacing tracks in playlist " + (err as Error).message,
      );
    }
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
      obj.every((item: any) => Base.isPlaylistTrackObject(item))
    );
  }

  /**
   * Retrieves the tracks from the given sources.
   *
   * @param sources - An array of sources from which to retrieve the tracks.
   * @returns An array of tracks.
   * @throws {Error} If the source type is invalid.
   */
  static getTracks(sources: any[]) {
    const tracks: SpotifyApi.TrackObjectFull[] = [];

    for (const source of sources) {
      let trackSource;

      if (source.tracks) {
        trackSource = source.tracks;
      } else if (source.items) {
        trackSource = source.items;
      } else if (source.track && !_.isObject(source.track)) {
        trackSource = source.track ? [source.track] : [];
      } else if (Array.isArray(source)) {
        trackSource = source;
      }

      if (!trackSource) continue;

      if (trackSource.tracks) {
        for (const track of trackSource) {
          if (track.track?.type === "track") {
            tracks.push(track.track as SpotifyApi.TrackObjectFull);
          }
        }
      } else if (Array.isArray(trackSource) && _.isObject(trackSource[0])) {
        for (const track of trackSource) {
          if (track.track?.type === "track") {
            tracks.push(track.track as SpotifyApi.TrackObjectFull);
          } else if (track.type === "track") {
            tracks.push(track as SpotifyApi.TrackObjectFull);
          } else {
            tracks.push(track as SpotifyApi.TrackObjectFull);
          }
        }
      } else {
        log.error("ERROR2", trackSource);
        throw new Error("Invalid source type");
      }
    }

    return tracks;
  }
}
