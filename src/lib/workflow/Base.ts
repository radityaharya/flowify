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
    spClient?: SpotifyWebApi,
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
              continue;
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
              continue;
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
}
