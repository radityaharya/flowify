/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import type { Operation } from "./types";
import _ from "radash";
import type { AccessToken } from './Base'

export default class Combiner extends Base {
  constructor(accessToken: AccessToken){
    super(accessToken);
  }

  static push(sources: any[], params: {}) {
    const startTime = new Date().getTime();
    console.debug("Push Sources:", sources, true);
    console.info("Pushing...");
    const result = [] as SpotifyApi.PlaylistTrackObject[];
    sources.forEach((source) => {
      if (source.tracks) {
        result.push(...source.tracks);
      } else if (Array.isArray(source)) {
        result.push(...source);
      } else {
        console.error("Invalid source type:", typeof source);
      }
    });
    // //console.log("Result:", result);
    const endTime = new Date().getTime();
    //console.log("Push time:", endTime - startTime);
    return result;
  }

  static isPlaylistTrackObject(
    obj: any
  ): obj is SpotifyApi.PlaylistTrackObject {
    return obj?.hasOwnProperty("track");
  }

  static alternate(sources: any[], params: {}) {
    const startTime = new Date().getTime();
    console.debug("Alternate Sources:", sources, true);
    console.info("Alternating...");
    const result = [] as SpotifyApi.PlaylistTrackObject[];
    let longestSourceLength = 0;

    // Convert sources to an array of arrays of PlaylistTrackObject

    const sourcesTracks = sources.map((source) => {
      let tracks: SpotifyApi.PlaylistTrackObject[];
      if (
        Array.isArray(source) &&
        source.every((item) => Combiner.isPlaylistTrackObject(item))
      ) {
        tracks = source;
      } else if (source.tracks && Array.isArray(source.tracks)) {
        tracks = source.tracks;
      } else {
        throw new Error("Invalid source type");
      }
      if (tracks.length > longestSourceLength) {
        longestSourceLength = tracks.length;
      }
      return tracks;
    });

    // interleave the tracks from each source
    for (let i = 0; i < longestSourceLength; i++) {
      sourcesTracks.forEach((source) => {
        if (source[i]) {
          result.push(source[i]!);
        }
      });
    }

    const endTime = new Date().getTime();
    //console.log("Alternate time:", endTime - startTime);
    return result;
  }
}