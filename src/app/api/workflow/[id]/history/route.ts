import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { db } from "@/server/db";
import { isUUID } from "validator";
import { Logger } from "@/lib/log";

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
    const session = await getServerSession({ req: request, ...authOptions });

    if (!params.id || !isUUID(params.id)) {
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

    if (workflow.userId !== session.user.id) {
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
        returnValues: run.returnValues
          ? JSON.parse(run.returnValues).tracks.map((v: any) => v.track.id)
          : [],
      })),
    };

    log.info(`Returning workflow ${params.id} for user ${session.user.id}`);
    return NextResponse.json(res);
  } catch (error) {
    log.error("Error getting workflow", error);
    return NextResponse.json("Unexpected error", { status: 500 });
  }
}
