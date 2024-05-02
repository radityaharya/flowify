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
    if (this.logLevel > LogLevel.DEBUG) return;
    try {
      parsed = this.getTracks(data);
      data = parsed;
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

  getTracks(sources) {
    const tracks = [] as SpotifyApi.TrackObjectFull[];

    sources.forEach((source) => {
      let trackSource;

      if (source.hasOwnProperty("tracks")) {
        trackSource = source.tracks;
      } else if (source.hasOwnProperty("items")) {
        trackSource = source.items;
      } else if (
        source.hasOwnProperty("track") &&
        typeof source.track !== "object"
      ) {
        trackSource = source.track ? [source.track] : [];
      } else if (Array.isArray(source)) {
        trackSource = source;
      }

      if (!trackSource) return;

      if (trackSource.hasOwnProperty("tracks")) {
        trackSource.forEach((track) => {
          if (track.track && track.track.type === "track") {
            tracks.push(track.track);
          }
        });
      } else if (
        Array.isArray(trackSource) &&
        typeof trackSource[0] === "object"
      ) {
        trackSource.forEach((track) => {
          if (track.track && track.track.type === "track") {
            tracks.push(track.track);
          } else if (track.type === "track") {
            tracks.push(track);
          } else {
            tracks.push(track);
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

  deepUnset = (obj, prop) => {
    if (typeof obj === "object" && obj !== null) {
      delete obj[prop];
      Object.values(obj).forEach((value) => {
        this.deepUnset(value, prop);
      });
    }
  };
}

export { Logger, LogLevel };
