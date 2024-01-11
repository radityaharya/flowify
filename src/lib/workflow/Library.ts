/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import _ from "radash";
import type { AccessToken } from './Base';
import { type Operation } from "./types";
import { Logger } from '../log'
import type SpotifyWebApi from "spotify-web-api-node";

const log = new Logger("Order");
export default class Library extends Base {
  constructor(accessToken: AccessToken, spClient?: SpotifyWebApi) {
    super(accessToken, spClient);
  }

  static likedTracks(spClient: SpotifyWebApi, { limit = 50, offset = 0 }: { limit?: number, offset?: number }) {
    const getLikedTracks = async ({ limit, offset }: { limit: number, offset: number }) => {
      const tracks = Array<any>();
      while (tracks.length < limit) {
        const response = await spClient.getMySavedTracks({ limit: Math.min(limit - tracks.length, 50), offset: offset + tracks.length });
        tracks.push(...response.body.items);
        if (response.body.items.length < 50) break;
      }
      return tracks;
    };
    return getLikedTracks({ limit, offset });
  }

}
