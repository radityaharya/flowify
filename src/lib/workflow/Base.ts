import SpotifyWebApi from "spotify-web-api-node";
import { env } from "~/env";
import { Logger } from "../log";
import _ from "lodash";

export interface AccessToken {
  slug: string;
  access_token: string;
}

const log = new Logger("Base");

export class Base {
  public spClient: SpotifyWebApi;
  public operationValues: Map<string, any> = new Map();

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

      log.debug("Adding tracks to playlist", trackChunks);

      for (const trackChunk of trackChunks) {
        while (true) {
          try {
            log.debug(`Adding tracks to playlist ${playlistId}`);
            await new Promise((resolve) =>
              setTimeout(resolve, retryAfter * 1000),
            );
            const snapshot = await spClient.addTracksToPlaylist(playlistId, trackChunk);
            log.info("Add Track Snapshot", snapshot.body.snapshot_id);
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
            const snapshot = await spClient.removeTracksFromPlaylist(
              playlistId,
              trackObjects,
            );
            log.info("Remove Track Snapshot", snapshot.body.snapshot_id);
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
      await Base.removeTracksBatch(spClient, id, trackUris);
      await Base.addTracksBatch(spClient, id, trackUris);
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

    _.forEach(sources, (source) => {
      let trackSource;

      if (_.has(source, "tracks")) {
        trackSource = _.get(source, "tracks");
      } else if (_.has(source, "items")) {
        trackSource = _.get(source, "items");
      } else if (
        _.has(source, "track") &&
        !_.isObject(_.get(source, "track"))
      ) {
        trackSource = _.get(source, "track") ? [_.get(source, "track")] : [];
      } else if (_.isArray(source)) {
        trackSource = source;
      }

      if (!trackSource) return;

      if (_.has(trackSource, "tracks")) {
        _.forEach(trackSource, (track) => {
          if (_.get(track, "track.type") === "track") {
            tracks.push(_.get(track, "track") as SpotifyApi.TrackObjectFull);
          }
        });
      } else if (
        _.isArray(trackSource) &&
        _.isObject(_.get(trackSource, [0]))
      ) {
        _.forEach(trackSource, (track) => {
          if (_.get(track, "track.type") === "track") {
            tracks.push(_.get(track, "track") as SpotifyApi.TrackObjectFull);
          } else if (_.get(track, "type") === "track") {
            tracks.push(track as SpotifyApi.TrackObjectFull);
          } else {
            tracks.push(track as SpotifyApi.TrackObjectFull);
          }
        });
      } else {
        log.error("ERROR2", trackSource);
        throw new Error("Invalid source type");
      }
    });

    return tracks;
  }
}
