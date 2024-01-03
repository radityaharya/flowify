/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import { type SpotifyApi } from "@spotify/web-api-ts-sdk";
import type { Operation } from "./types";
import _ from "radash";
import type { AccessToken } from "./Base";
import { SpotifyApi as sp } from "@spotify/web-api-ts-sdk";

export default class SpotifyGeneric extends Base {
  constructor(spClient: sp, accessToken: AccessToken) {
    super(spClient, accessToken);
  }

  async getPlaylistTracks(
    playlistId: string,
    offset: number,
    limit: number,
    fields: string,
  ): Promise<SpotifyApi.PlaylistTrackResponse> {
    const startTime = new Date().getTime();
    console.info("Getting playlist tracks...");
    const result = await this.spClient.playlists.getPlaylistItems(playlistId);
    const endTime = new Date().getTime();
    console.info("Got playlist tracks");
    console.debug("Playlist tracks:", result, true);
    console.info("Get playlist tracks time:", endTime - startTime);
    return result;
  }
}
