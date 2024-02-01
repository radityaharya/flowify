// import fs from "fs";
// import path from "path";
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
    private logLevel: LogLevel = LogLevel.INFO,
  ) {}

  private log(level: LogLevel, message: string, data?: any): void {
    if (this.logLevel <= level) {
      const currentTimestamp = Date.now();
      const timestamp = new Date(currentTimestamp).toISOString().slice(11, -1);
      console.log(
        `[${LogLevel[level].slice(0, 3)}] ${timestamp} ${
          this.name
        }: ${message}`,
      );
      this.lastLogTimestamp = currentTimestamp;
      if (data) {
        console.log(data instanceof Object ? JSON.stringify(data) : data);
      }
    }
  }

  debug(message: string, data?: any, saveToFile?: boolean): void {
    this.log(LogLevel.DEBUG, message, data);
    // if (false) {
    //   const filePath = path.join(__dirname, "debug.json");
    //   const logEntry = { message, data, timestamp: new Date().toISOString() };

    //   let json: { message: string; data: any; timestamp: string }[] = [];

    //   try {
    //     const fileData = fs.readFileSync(filePath, "utf8");
    //     if (fileData.trim() !== "") {
    //       json = JSON.parse(fileData);
    //     }
    //   } catch (e) {
    //     console.error("Error reading or parsing file", e);
    //   }

    //   json.push(logEntry);

    //   json.sort(
    //     (
    //       a: { timestamp: string | number | Date },
    //       b: { timestamp: string | number | Date }
    //     ) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    //   );

    //   try {
    //     fs.writeFileSync(filePath, JSON.stringify(json, null, 2), "utf8");
    //   } catch (e) {
    //     console.error("Error writing file", e);
    //   }
    // }
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
    tracks.forEach((track) => {
      this.info(`Track: ${track.name}`);
    });
  }
}

export { Logger, LogLevel };
