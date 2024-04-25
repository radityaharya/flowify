import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { Logger } from "~/lib/log";
import { env } from "~/env";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";


const log = new Logger("/api/");

export async function GET(request: NextRequest) {
  const session = await getServerSession({ req: request, ...authOptions });
  if (!session) {
    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      { status: 401 },
    );
  }
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
  const workersWithoutDeviceHash = workers.map(
    ({ deviceHash, ...worker }) => worker,
  );

  if (redis) {
    await redis.set(
      "api:workers",
      JSON.stringify(workersWithoutDeviceHash),
      "EX",
      30,
    );
  }

  return NextResponse.json(workersWithoutDeviceHash);
}
