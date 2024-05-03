import { Logger } from "@/lib/log";
import { authOptions } from "@/server/auth";
import { db } from "@/server/db";
import Redis from "ioredis";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

const log = new Logger("/api/workflow/[id]");

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { uid: string };
  },
) {
  const session = (await getServerSession({ req: request, ...authOptions }))!;

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
    cachedData = await redis.get(`api:workflows:${session.user.id}`);
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData), {
        headers: {
          "X-Cache": "HIT",
        },
      });
    }
  }

  const workflows = await db.query.workflowJobs.findMany({
    where: (workflowJobs, { eq, or, isNull }) =>
      eq(workflowJobs.userId, session.user.id) &&
      or(isNull(workflowJobs.deleted), eq(workflowJobs.deleted, false)),
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
      runs: workflowRuns
    })),
  );

  if (redis) {
    await redis.set(
      `api:workflows:${session.user.id}`,
      JSON.stringify(res),
      "EX",
      5,
    );
  }

  log.info(`Returning workflows for user ${session.user.id}`);
  return NextResponse.json(res, {
    headers: {
      "X-Cache": "MISS",
    },
  });
}
