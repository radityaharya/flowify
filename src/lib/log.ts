import _ from "lodash";

enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  NONE,
}

class Logger {
  private lastLogTimestamp: number | null = null;

  constructor(
    private readonly name: string,
    private logLevel: LogLevel = process.env.DEBUG
      ? LogLevel.DEBUG
      : process.env.LOG_LEVEL
        ? LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel]
        : LogLevel.INFO,
  ) {}

  private getColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "\x1b[36m"; // Cyan
      case LogLevel.INFO:
        return "\x1b[32m"; // Green
      case LogLevel.WARN:
        return "\x1b[33m"; // Yellow
      case LogLevel.ERROR:
        return "\x1b[31m"; // Red
      default:
        return "\x1b[0m"; // No color
    }
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (this.logLevel > level) return;

    const currentTimestamp = Date.now();
    const timestamp = new Date(currentTimestamp).toISOString().slice(11, -5);
    const logLevelName = LogLevel[level].slice(0, 3);
    const color = this.getColor(level);

    const logMessage = `${color}[${logLevelName}] ${timestamp} ${this.name}: ${message}\x1b[0m`;

    console.info(logMessage);
    if (data) {
      try {
        if (data instanceof Error) {
          data = { message: data.message, stack: data.stack };
        }
        console.info(JSON.stringify(data, null, 2));
      } catch (_error) {
        console.info(data);
      }
    }
    this.lastLogTimestamp = currentTimestamp;
  }

  debug(message: string, data?: any): void {
    let parsed;
    try {
      parsed = this.getTracks(data);
      data = parsed
    } catch (error) {
      this.error("Failed to parse data", error);
    }

    data = this.deepUnset(data, "audio_features");
    data = this.deepUnset(data, "available_markets");
    data = this.deepUnset(data, "preview_url");
    data = this.deepUnset(data, "external_ids");
    data = this.deepUnset(data, "external_urls");
    data = this.deepUnset(data, "release_date_precision");
    data = this.deepUnset(data, "artists");
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  logTrackTitles(tracks: SpotifyApi.TrackObjectFull[]): void {
    tracks.forEach((track) => this.info(`Track: ${track.name}`));
  }

  getTracks(sources: any[]) {
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
        throw new Error("Invalid source type");
      }
    });

    return tracks;
  }

  compressReturnValues(returnValues: any[]) {
    const compressedValues: any[] = [];

    returnValues.forEach((playlist: any) => {
      const compressedPlaylist: any = {
        ...playlist,
        tracks: {
          items: playlist.tracks.map((item: any) => {
            const compressedItem: any = {
              ...item,
              track: {
                ...item.track,
                audio_features: undefined,
                available_markets: undefined,
                preview_url: undefined,
                external_ids: undefined,
                external_urls: undefined,
              },
            };

            if (compressedItem.track?.album) {
              compressedItem.track.album.release_date_precision = undefined;
              compressedItem.track.album.artists =
                compressedItem.track.album.artists.map(
                  (artist: SpotifyApi.ArtistObjectSimplified) => ({
                    ...artist,
                    external_urls: undefined,
                    href: undefined,
                    uri: undefined,
                  }),
                );
            }

            if (compressedItem.track?.artists) {
              compressedItem.track.artists = compressedItem.track.artists.map(
                (artist: SpotifyApi.ArtistObjectSimplified) => ({
                  ...artist,
                  external_urls: undefined,
                  href: undefined,
                  uri: undefined,
                }),
              );
            }

            return compressedItem;
          }),
        },
      };

      compressedValues.push(compressedPlaylist);
    });

    return compressedValues;
  }

  deepUnset = (obj: any, prop: string) => {
    if (_.isObject(obj)) {
      _.unset(obj, prop);
      _.forEach(obj, (value) => {
        this.deepUnset(value, prop);
      });
    }
  };
}

export { Logger, LogLevel };
