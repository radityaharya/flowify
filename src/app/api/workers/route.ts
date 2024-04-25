import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { Logger } from "~/lib/log";
import { env } from "~/env";

const log = new Logger("/api/user/[uid]/playlists");

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export async function GET(request: NextRequest) {
  log.info("Getting all workers");

  const cachedData = await redis.get("api:workers");
  if (cachedData) {
    return NextResponse.json(JSON.parse(cachedData), {
      headers: {
        "X-Cache": "HIT",
      },
    });
  }

  const workers = await db.query.workerPool.findMany({});
  const workersWithoutDeviceHash = workers.map(
    ({ deviceHash, ...worker }) => worker,
  );

  await redis.set(
    "api:workers",
    JSON.stringify(workersWithoutDeviceHash),
    "EX",
    30,
  );

  return NextResponse.json(workersWithoutDeviceHash);
}
