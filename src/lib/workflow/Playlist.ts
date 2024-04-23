import type SpotifyWebApi from "spotify-web-api-node";
import { Logger } from "../log";
import { Base } from "./Base";

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
    log.debug("GetRecommendedTracks Sources:", sources);

    const MAX_SEEDS = 5;
    const MAX_LIMIT = 100;

    if (params.seed_tracks && params.seed_tracks.length > MAX_SEEDS) {
      params.seed_tracks = params.seed_tracks.slice(0, MAX_SEEDS);
    }

    if (params.limit && params.limit > MAX_LIMIT) {
      throw new Error(`Limit cannot be greater than ${MAX_LIMIT}`);
    }

    const tracks = Playlist.getTracks(sources);

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

  static async albumTracks(
    spClient: SpotifyWebApi,
    _sources: any[],
    params: {
      albumId: string;
    },
  ): Promise<SpotifyApi.TrackObjectFull[]> {
    const tracks: SpotifyApi.TrackObjectFull[] = [];
    const tracksResponse = await spClient.getAlbumTracks(params.albumId);
    const trackIds = tracksResponse.body.items.map((track) => track.id);
    const trackObjects = await spClient.getTracks(trackIds);
    tracks.push(...trackObjects.body.tracks);
    return tracks;
  }
}
