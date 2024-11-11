import Redis from "ioredis";
import { NextResponse } from "next/server";

import { Logger } from "@/lib/log";
import { db } from "@/server/db";
import { env } from "~/env";
import { auth } from "~/server/auth";

const log = new Logger("/api/workflow/[id]");

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

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
    cachedData = await redis.get(`api:workflows:${userId}`);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), {
        headers: {
          "X-Cache": "HIT",
        },
      });
    }
  }

  const workflows = await db.query.workflowJobs.findMany({
    where: (workflowJobs, { eq, and, or, isNull }) =>
      and(
        eq(workflowJobs.userId, userId),
        or(isNull(workflowJobs.deleted), eq(workflowJobs.deleted, false)),
      ),
    with: {
      workflowRuns: {
        columns: {
          id: true,
          status: true,
          startedAt: true,
          returnValues: false,
          completedAt: true,
          error: true,
        },
        orderBy: (workflowRuns, { desc }) => [desc(workflowRuns.startedAt)],
      },
    },
  });

  if (!workflows.length) {
    return NextResponse.json([], { status: 200 });
  }

  const res = await Promise.all(
    workflows.map(async ({ id, cron, workflow, createdAt, workflowRuns }) => ({
      id,
      cron,
      workflow: workflow && JSON.parse(workflow),
      createdAt: createdAt?.getTime(),
      lastRunAt: workflowRuns[0]?.startedAt?.getTime(),
      runs: workflowRuns,
    })),
  );

  if (redis) {
    await redis.set(`api:workflows:${userId}`, JSON.stringify(res), "EX", 5);
  }

  log.info(`Returning workflows for user ${userId}`);
  return NextResponse.json(res, {
    headers: {
      "X-Cache": "MISS",
    },
  });
}
