/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Base } from "./Base";
import * as _ from "radash";
import type { AccessToken } from "./Base";
import { Logger } from "../log";
import type SpotifyWebApi from "spotify-web-api-node";

const log = new Logger("Utility");
export default class Utility extends Base {
  static removeKeys(
    spClient: SpotifyWebApi,
    sources: any[],
    params: { keys: string[] },
  ) {
    log.debug("RemoveKeys Sources:", sources);
    log.info("Removing keys...");

    const tracks = this.getTracks(sources);

    const result = tracks.map((track: any) => _.omit(track, params.keys || []));
    return result;
  }

  static includeOnlyKeys(
    spClient: SpotifyWebApi,
    sources: any[],
    params: { keys: string[] },
  ) {
    log.debug("IncludeOnlyKeys Sources:", sources);
    log.info("Including only keys...");

    const tracks = this.getTracks(sources);

    const result = tracks.map((track: any) => _.pick(track, params.keys || []));
    return result;
  }
}
