import { db } from "@/server/db";
import Redis from "ioredis";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { Logger } from "~/lib/log";

const log = new Logger("/api/");

export async function GET(request: NextRequest) {
  let redis: Redis | null = null;
  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  } catch (error) {
    log.error("Failed to connect to Redis", error);
  }

  let cachedData;
  if (redis) {
    cachedData = await redis.get("api:workers");
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), {
        headers: {
          "X-Cache": "HIT",
        },
      });
    }
  }

  const workers = await db.query.workerPool.findMany({});
  const systemStatus = await db.query.systemStatus.findFirst({
    orderBy: (systemStatus, { desc }) => [desc(systemStatus.createdAt)],
  });

  const workersWithoutDeviceHash = workers.map(
    ({ deviceHash, ...worker }) => worker,
  );

  const systemInfo = {
    workers: workersWithoutDeviceHash,
    systemStatus: systemStatus || "No data available",
  };

  if (redis) {
    await redis.set("api:workers", JSON.stringify(systemInfo), "EX", 30);
  }

  return NextResponse.json(systemInfo, {
    headers: {
      "X-Cache": "MISS",
    },
  });
}
