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

    console.log(logMessage);
    if (data) {
      try {
        if (data instanceof Error) {
          data = { message: data.message, stack: data.stack };
        }
        console.log(JSON.stringify(data, null, 2));
      } catch (error) {
        console.log(data);
      }
    }
    this.lastLogTimestamp = currentTimestamp;
  }

  debug(message: string, data?: any): void {
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
}

export { Logger, LogLevel };
