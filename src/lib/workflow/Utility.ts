import { type SpotifyApi } from "@spotify/web-api-ts-sdk";
import * as _ from "radash";

import { Logger } from "../log";
import { Base } from "./Base";

const log = new Logger("Utility");
export default class Utility extends Base {
  static removeKeys(
    _spClient: SpotifyApi,
    sources: any[],
    params: { keys: string[] },
  ) {
    log.debug("RemoveKeys Sources:", sources);
    log.info("Removing keys...");

    const tracks = Utility.getTracks(sources);

    const result = tracks.map((track: any) => _.omit(track, params.keys || []));
    return result;
  }

  static includeOnlyKeys(
    _spClient: SpotifyApi,
    sources: any[],
    params: { keys: string[] },
  ) {
    log.debug("IncludeOnlyKeys Sources:", sources);
    log.info("Including only keys...");

    const tracks = Utility.getTracks(sources);

    const result = tracks.map((track: any) => _.pick(track, params.keys || []));
    return result;
  }
}
