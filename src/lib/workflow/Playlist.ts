import { Base } from "./Base";
import type { AccessToken } from "./Base";
import type SpotifyWebApi from "spotify-web-api-node";
import { Logger } from "../log";

const log = new Logger("Playlist");
type getTracksRecomendationParams = {
  seed_tracks?: string[];
  seed_artists?: string[];
  seed_genres?: string[];
  market?: string;
  limit?: number;
  target_acousticness?: number;
  target_danceability?: number;
  target_energy?: number;
  target_instrumentalness?: number;
  target_liveness?: number;
  target_loudness?: number;
  target_speechiness?: number;
  target_tempo?: number;
  target_valence?: number;
  min_acousticness?: number;
  min_danceability?: number;
  min_energy?: number;
  min_instrumentalness?: number;
  min_liveness?: number;
  min_loudness?: number;
  min_speechiness?: number;
  min_tempo?: number;
  min_valence?: number;
  max_acousticness?: number;
  max_danceability?: number;
  max_energy?: number;
  max_instrumentalness?: number;
  max_liveness?: number;
  max_loudness?: number;
  max_speechiness?: number;
  max_tempo?: number;
  max_valence?: number;
};

export default class Playlist extends Base {
  constructor(accessToken: AccessToken, spClient?: SpotifyWebApi) {
    super(accessToken, spClient);
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

  static async _getPlaylistWithTracks(
    spClient: SpotifyWebApi,
    playlistId: string,
  ) {
    return spClient
      .getPlaylist(playlistId)
      .then((response) => ({
        playlistId: response.body.id,
        tracks: response.body.tracks.items,
      }))
      .catch((error) => {
        log.error("Error getting playlist tracks", error);
        throw new Error(
          "Error getting playlist tracks " + (error as Error).message,
        );
      });
  }

  /**
   * The `saveAsAppend` saves a list of tracks to a Spotify playlist by
   * appending them to the existing tracks in the playlist.
   * @param {SpotifyWebApi} spClient - The `spClient` parameter is an instance of the SpotifyWebApi
   * class, which is used to make API requests to the Spotify API.
   * @param {any[]} sources - The `sources` parameter is an array that contains the sources of tracks
   * to be added to the playlist. It can have different formats:
   * @param params - { playlistId: string }
   * @returns the playlist with the added tracks.
   */
  static async saveAsAppend(
    spClient: SpotifyWebApi,
    sources: any[],
    params: { playlistId: string },
  ) {
    log.info("Saving as append playlist...");
    log.debug("SaveAsAppend Sources:", sources, true);

    const playlistId = params.playlistId;

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Playlist.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Playlist.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    const trackUris = tracks.map((track: any) => track.track.uri) as string[];

    await Playlist.addTracksBatch(spClient, playlistId, trackUris);

    return Playlist._getPlaylistWithTracks(spClient, playlistId);
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
    log.debug("SaveAsNew Sources:", sources, true);

    const playlistName = params.name;

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Playlist.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Playlist.isPlaylistTrackObjectArray(sources)) {
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

    await Playlist.addTracksBatch(spClient, response.body.id, trackUris);

    return Playlist._getPlaylistWithTracks(spClient, response.body.id);
  }

  /**
   * The function `saveAsReplace` takes in a Spotify client, an array of sources, and a playlist ID,
   * and replaces the tracks in the playlist with the tracks from the sources.
   * @param {SpotifyWebApi} spClient - The `spClient` parameter is an instance of the `SpotifyWebApi`
   * class, which is used to make API requests to the Spotify Web API.
   * @param {any[]} sources - The `sources` parameter is an array that contains the sources of tracks
   * to be saved. It can have different formats:
   * @param params - { playlistId: string }
   * @returns the result of calling the `_getPlaylistWithTracks` method with the `spClient` and
   * `playlistId` as arguments.
   */
  static async saveAsReplace(
    spClient: SpotifyWebApi,
    sources: any[],
    params: { playlistId: string },
  ) {
    log.info("Saving as replace playlist...");
    log.debug("SaveAsReplace Sources:", sources, true);

    const playlistId = params.playlistId;

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Playlist.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Playlist.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    const trackUris = tracks.map((track: any) => track.track.uri) as string[];

    // await spClient.replaceTracksInPlaylist(playlistId, trackUris);
    await Playlist.replaceTracksBatch(spClient, playlistId, trackUris);

    return Playlist._getPlaylistWithTracks(spClient, playlistId);
  }

  /**
   * The function `getPlaylistTracks` retrieves the tracks of a playlist using the Spotify Web API.
   * @param {SpotifyWebApi} spClient - The `spClient` parameter is an instance of the `SpotifyWebApi`
   * class, which is used to make requests to the Spotify Web API.
   * @param {any[]} sources - The `sources` parameter is an array that contains the sources from which
   * the playlist tracks will be retrieved. It can be any type of source that is supported by the
   * SpotifyWebApi client.
   * @param params - The `params` parameter is an object that contains the following property:
   * @returns the result of calling the `_getPlaylistWithTracks` method of the `Playlist` class with
   * the `spClient` and `playlistId` parameters.
   */
  static async getPlaylistTracks(
    spClient: SpotifyWebApi,
    sources: any[],
    params: { playlistId: string },
  ) {
    log.info("Getting playlist tracks...");
    log.debug("GetPlaylistTracks Sources:", sources, true);

    const playlistId = params.playlistId;

    return Playlist._getPlaylistWithTracks(spClient, playlistId);
  }

  /**
   * The function `getRecommendedTracks` retrieves recommended tracks from Spotify based on given
   * sources and parameters.
   * @param {SpotifyWebApi} spClient - The `spClient` parameter is an instance of the SpotifyWebApi
   * class, which is used to make API requests to the Spotify Web API.
   * @param {any[]} sources - The `sources` parameter is an array that contains the sources from which
   * the recommended tracks will be generated. The sources can be in different formats:
   * @param {getTracksRecomendationParams} params - The `params` parameter is an object that contains
   * the following properties:
   * @returns the recommended tracks as an array.
   */
  static async getRecommendedTracks(
    spClient: SpotifyWebApi,
    sources: any[],
    params: getTracksRecomendationParams,
  ) {
    log.info("Getting recommended tracks...");
    log.debug("GetRecommendedTracks Sources:", sources, true);

    const MAX_SEEDS = 5;
    const MAX_LIMIT = 100;

    if (params.seed_tracks && params.seed_tracks.length > MAX_SEEDS) {
      params.seed_tracks = params.seed_tracks.slice(0, MAX_SEEDS);
    }

    if (params.limit && params.limit > MAX_LIMIT) {
      throw new Error(`Limit cannot be greater than ${MAX_LIMIT}`);
    }

    let tracks = [] as any;

    if (
      Array.isArray(sources) &&
      Array.isArray(sources[0]) &&
      Playlist.isPlaylistTrackObjectArray(sources[0])
    ) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty("tracks")) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Playlist.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${
          sources[0]
        } located in sources: ${JSON.stringify(sources)}`,
      );
    }

    const options = { ...params } as getTracksRecomendationParams;

    if (tracks.length > 0) {
      const seed_tracks = tracks.map(
        (track: any) => track.track.id,
      ) as string[];
      const sample: string[] = [];
      const seeds = tracks.length < 5 ? tracks.length : MAX_SEEDS;
      for (let i = 0; i < seeds; i++) {
        const random = Math.floor(Math.random() * seed_tracks.length);
        sample.push(seed_tracks[random]!);
      }
      options.seed_tracks = sample;
    }

    const response = await spClient.getRecommendations(options);

    return response.body.tracks;
  }
}
