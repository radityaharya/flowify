/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import _ from "radash";
import type { AccessToken } from "./Base";
import { Logger } from "../log";
import type SpotifyWebApi from "spotify-web-api-node";

const log = new Logger("Order");
export default class Library extends Base {
  constructor(accessToken: AccessToken, spClient?: SpotifyWebApi) {
    super(accessToken, spClient);
  }

  static async likedTracks(
    spClient: SpotifyWebApi,
    { limit = 50, offset = 0 }: { limit?: number; offset?: number },
  ) {
    const tracks: SpotifyApi.PlaylistTrackObject[] = [];
    let result;
    let retryAfter = 0;

    while (true) {
      try {
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        result = await spClient.getMySavedTracks({
          limit: Math.min(limit - tracks.length, limit),
          offset: offset + tracks.length,
        });
        tracks.push(...result.body.items);
        if (tracks.length >= limit || result.body.items.length < limit) {
          break;
        }
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

    return tracks;
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
      obj.every((item: any) => this.isPlaylistTrackObject(item))
    );
  }

  static async _getPlaylistWithTracks(spClient: SpotifyWebApi, id: string) {
    let tracks: SpotifyApi.PlaylistTrackObject[] = [];
    let offset = 0;
    let result;
    let retryAfter = 0;

    while (true) {
      try {
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        log.debug("Getting playlist tracks...", { id, offset });
        result = await spClient.getPlaylistTracks(id, {
          limit: 20,
          offset,
        });
        tracks = [...tracks, ...result.body.items];
        offset += 20;
        retryAfter = 0;
      } catch (error: any) {
        if (error.statusCode === 429) {
          retryAfter = error.headers["retry-after"];
          log.error(`Rate limited. Retrying after ${retryAfter} seconds.`);
          continue;
        } else {
          log.error("Error getting playlist tracks", error);
          throw new Error(
            "Error getting playlist tracks " + (error as Error).message,
          );
        }
      }

      if (!result.body.next) {
        break;
      }
    }
    return {
      id,
      tracks,
    };
  }

  /**
   * The `saveAsAppend` saves a list of tracks to a Spotify playlist by
   * appending them to the existing tracks in the playlist.
   * @param {SpotifyWebApi} spClient - The `spClient` parameter is an instance of the SpotifyWebApi
   * class, which is used to make API requests to the Spotify API.
   * @param {any[]} sources - The `sources` parameter is an array that contains the sources of tracks
   * to be added to the playlist. It can have different formats:
   * @param params - { id: string }
   * @returns the playlist with the added tracks.
   */
  static async saveAsAppend(
    spClient: SpotifyWebApi,
    sources: any[],
    params: { id: string },
  ) {
    log.info("Saving as append playlist...");
    log.debug("SaveAsAppend Sources:", sources);

    const id = params.id;

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Library.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Library.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    const trackUris = tracks.map((track: any) => track.track.uri) as string[];

    await Library.addTracksBatch(spClient, id, trackUris);

    return Library._getPlaylistWithTracks(spClient, id);
  }

  static async saveAsNew(
    spClient: SpotifyWebApi,
    sources: any[],
    params: {
      name: string;
      isPublic?: boolean;
      collaborative?: boolean;
      description?: string;
    },
  ) {
    log.info("Saving as new playlist...");
    log.debug("SaveAsNew Sources:", sources);

    const playlistName = params.name;

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Library.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Library.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    const trackUris = tracks.map((track: any) => track.track.uri) as string[];

    const response = await spClient.createPlaylist(playlistName, {
      public: params.isPublic ?? false,
      collaborative: params.collaborative ?? false,
      description: params.description ?? "",
    });

    await Library.addTracksBatch(spClient, response.body.id, trackUris);

    return Library._getPlaylistWithTracks(spClient, response.body.id);
  }

  /**
   * The function `saveAsReplace` takes in a Spotify client, an array of sources, and a playlist ID,
   * and replaces the tracks in the playlist with the tracks from the sources.
   * @param {SpotifyWebApi} spClient - The `spClient` parameter is an instance of the `SpotifyWebApi`
   * class, which is used to make API requests to the Spotify Web API.
   * @param {any[]} sources - The `sources` parameter is an array that contains the sources of tracks
   * to be saved. It can have different formats:
   * @param params - { id: string }
   * @returns the result of calling the `_getPlaylistWithTracks` method with the `spClient` and
   * `id` as arguments.
   */
  static async saveAsReplace(
    spClient: SpotifyWebApi,
    sources: any[],
    params: { id: string },
  ) {
    log.info("Saving as replace playlist...");
    log.debug("SaveAsReplace Sources:", sources);

    const id = params.id;

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Library.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Library.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    const trackUris = tracks.map((track: any) => track.track.uri) as string[];

    // await spClient.replaceTracksInPlaylist(id, trackUris);
    await Library.replaceTracksBatch(spClient, id, trackUris);

    return Library._getPlaylistWithTracks(spClient, id);
  }
}
