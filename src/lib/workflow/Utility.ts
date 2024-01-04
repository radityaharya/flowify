/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import * as _ from "radash";
import type { AccessToken } from './Base'
import { Logger } from '../log'

const log = new Logger("Utility");
export default class Utility extends Base {
  constructor(accessToken: AccessToken){
    super(accessToken);
  }

  static isPlaylistTrackObject(
    obj: any
  ): obj is SpotifyApi.PlaylistTrackObject {
    return obj?.hasOwnProperty("track");
  }

  static isPlaylistTrackObjectArray(
    obj: any
  ): obj is SpotifyApi.PlaylistTrackObject[] {
    return Array.isArray(obj) && obj.every((item: any) => this.isPlaylistTrackObject(item));
  }
  static removeKeys(sources: any[], params: { keys: string[] }) {
    log.debug("RemoveKeys Sources:", sources, true);
    log.info("Removing keys...");

    let tracks = [] as any;

    if (Array.isArray(sources) && Array.isArray(sources[0]) && Utility.isPlaylistTrackObjectArray(sources[0])) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty('tracks')) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Utility.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${sources[0]} located in sources: ${JSON.stringify(sources)}`
      );
    }

    const result = tracks.map((track: any) =>
      _.omit(track, params.keys || [])
    );
    return result;
  }

  static includeOnlyKeys(sources: any[], params: { keys: string[] }) {
    log.debug("IncludeOnlyKeys Sources:", sources, true);
    log.info("Including only keys...");

    let tracks = [] as any;

    if (Array.isArray(sources) && Array.isArray(sources[0]) && Utility.isPlaylistTrackObjectArray(sources[0])) {
      // If the first source is an array of PlaylistTrackObjects, assume all sources are
      tracks = sources.flat();
    } else if (Array.isArray(sources) && sources[0]!.hasOwnProperty('tracks')) {
      // If the first source has a 'tracks' property that is an array, assume all sources do
      for (const source of sources) {
        tracks.push(...source.tracks);
      }
    } else if (Utility.isPlaylistTrackObjectArray(sources)) {
      tracks = sources;
    } else {
      throw new Error(
        `Invalid source type: ${typeof sources[0]} in ${sources[0]} located in sources: ${JSON.stringify(sources)}`
      );
    }

    const result = tracks.map((track: any) =>
      _.pick(track, params.keys || [])
    );
    return result;
  }
}