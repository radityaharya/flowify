import SpotifyWebApi from "spotify-web-api-node";
import { env } from "~/env";
import { Logger } from "../log";
export interface AccessToken {
  slug: string;
  access_token: string;
}

const log = new Logger("Base");

export class Base {
  public spClient: SpotifyWebApi;

  constructor(
    public accessToken: AccessToken,
    _spClient?: SpotifyWebApi,
  ) {
    this.spClient = new SpotifyWebApi({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
    });
    this.spClient.setAccessToken(accessToken.access_token);
  }

  authedSpotifyApi() {
    return this.spClient;
  }

  // Users
  async getUsername() {
    const data = await this.spClient.getMe();
    return data.body.display_name;
  }

  async getUserPlaylists() {
    const data = await this.spClient.getUserPlaylists();
    return data.body;
  }

  static async addTracksBatch(
    spClient: SpotifyWebApi,
    playlistId: string,
    trackUris: string[],
  ) {
    try {
      const chunkSize = 50;
      let retryAfter = 0;

      function chunk<T>(array: T[], size: number): T[][] {
        const result = [] as T[][];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      }

      const trackChunks = chunk(trackUris, chunkSize);

      for (const trackChunk of trackChunks) {
        while (true) {
          try {
            log.debug(`Adding tracks to playlist ${playlistId}`);
            await new Promise((resolve) =>
              setTimeout(resolve, retryAfter * 1000),
            );
            await spClient.addTracksToPlaylist(playlistId, trackChunk);
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

  static async replaceTracksBatch(
    spClient: SpotifyWebApi,
    id: string,
    trackUris: string[],
  ) {
    try {
      const chunkSize = 50;
      let retryAfter = 0;

      function chunk<T>(array: T[], size: number): T[][] {
        const result = [] as T[][];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      }

      const trackChunks = chunk(trackUris, chunkSize);

      for (const trackChunk of trackChunks) {
        while (true) {
          try {
            log.debug(`Replacing tracks in playlist ${id}`);
            await new Promise((resolve) =>
              setTimeout(resolve, retryAfter * 1000),
            );
            await spClient.replaceTracksInPlaylist(id, trackChunk);
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
    const tracks = [] as SpotifyApi.TrackObjectFull[];

    for (const source of sources) {
      let trackSource;

      if (source.hasOwnProperty("tracks")) {
        trackSource = source.tracks;
      } else if (source.hasOwnProperty("items")) {
        trackSource = source.items;
      } else if (
        source.hasOwnProperty("track") &&
        typeof source.track !== "object"
      ) {
        trackSource = source.track ? [source.track] : [];
      } else if (Array.isArray(source)) {
        trackSource = source;
      }

      if (!trackSource) continue;

      if (trackSource.hasOwnProperty("tracks")) {
        for (const track of trackSource) {
          if (track.track && track.track.type === "track") {
            tracks.push(track.track as SpotifyApi.TrackObjectFull);
          } else if (track.track && track.type === "track") {
            tracks.push(track as SpotifyApi.TrackObjectFull);
          }
        }
      } else if (
        Array.isArray(trackSource) &&
        typeof trackSource[0] === "object"
      ) {
        for (const track of trackSource) {
          if (track.track && track.track.type === "track") {
            tracks.push(track.track as SpotifyApi.TrackObjectFull);
          } else if (track.track && track.type === "track") {
            tracks.push(track as SpotifyApi.TrackObjectFull);
          } else {
            // log.error("ERROR1", track);
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
