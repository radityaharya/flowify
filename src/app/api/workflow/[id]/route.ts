import { type NextRequest, NextResponse } from "next/server";
import { isUUID } from "validator";

import { Logger } from "@/lib/log";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

const log = new Logger("/api/workflow/[id]");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await params;
  if (!(id && isUUID(id))) {
    log.error("No id provided", id);
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
    where: (workflowJobs, { eq }) => eq(workflowJobs.id, id),
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

  log.info(`Returning workflow ${id} for user ${session.user.id}`);
  return NextResponse.json(res);
}
