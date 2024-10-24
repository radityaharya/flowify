import { Logger } from "@/lib/log";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";
import { isUUID } from "validator";

const log = new Logger("/api/workflow/[id]");

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  },
) {
  try {
    const session = await auth();

    if (!(params.id && isUUID(params.id))) {
      log.error("No id provided");
      return NextResponse.json(
        {
          error: "No id provided",
        },
        { status: 400 },
      );
    }

    if (!session) {
      log.error("Not authenticated");
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        { status: 401 },
      );
    }

    const [workflow, runs] = await Promise.all([
      db.query.workflowJobs.findFirst({
        where: (workflowJobs, { eq }) => eq(workflowJobs.id, params.id),
      }),
      db.query.workflowRuns.findMany({
        where: (workflowRuns, { eq }) => eq(workflowRuns.workflowId, params.id),
      }),
    ]);

    if (!workflow) {
      throw new Error("Workflow not found");
    }

    if (!session.user || workflow.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const res = {
      id: workflow.id,
      runs: runs.map((run) => ({
        id: run.id,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        status: run.status,
        returnValues: run.returnValues ? JSON.parse(run.returnValues) : null,
      })),
    };

    log.info(`Returning workflow ${params.id} for user ${session.user?.id}`);
    return NextResponse.json(res);
  } catch (error) {
    log.error("Error getting workflow", error);
    return NextResponse.json("Unexpected error", { status: 500 });
  }
}
