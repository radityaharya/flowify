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
  const session = await auth();

  if (!(params.id && isUUID(params.id))) {
    log.error("No id provided", params.id);
    return NextResponse.json(
      {
        error: "No id provided",
      },
      { status: 400 },
    );
  }

  if (!session || !session.user) {
    log.error("Not authenticated");
    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      { status: 401 },
    );
  }

  const workflow = await db.query.workflowJobs.findFirst({
    where: (workflowJobs, { eq }) => eq(workflowJobs.id, params.id),
  });

  if (!workflow) {
    return NextResponse.json("Workflow not found", { status: 404 });
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
    cron: workflow.cron,
    workflow: workflow.workflow ? JSON.parse(workflow.workflow) : null,
    createdAt: workflow.createdAt,
  };

  log.info(`Returning workflow ${params.id} for user ${session.user.id}`);
  return NextResponse.json(res);
}
