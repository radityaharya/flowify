import SpotifyWebApi from "spotify-web-api-node";
import { env } from '~/env';

export interface AccessToken {
  slug: string;
  access_token: string;
}

export class Base {
  public spClient: SpotifyWebApi;

  constructor(public accessToken: AccessToken) {
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
  
    // playlists
  
    async getPlaylistTracks(playlistId: string) {
      try{
      const data = await this.spClient.getPlaylistTracks(playlistId);
      return data.body.items;
    } catch (err) {
      console.error("Error getting playlist tracks", err);
      throw new Error("Error getting playlist tracks " + (err as Error).message);
    }
    return [];
    }
    async addTracksBatch(playlistId: string, trackUris: string[]) {
      // A maximum of 100 items can be added in one request.
      // handle this by chunking the array into batches of 100
      try {
        const chunkSize = 100;
  
        function chunk<T>(array: T[], size: number): T[][] {
          const result = [] as T[][];
          for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
          }
          return result;
        }
  
        const trackChunks = chunk(trackUris, chunkSize);
  
        for (const chunk of trackChunks) {
          await this.spClient.addTracksToPlaylist(playlistId, chunk);
        }
      } catch (err) {
        console.error("Error adding tracks to playlist", err);
        throw new Error("Error adding tracks to playlist " + (err as Error).message);
      }
    }
}