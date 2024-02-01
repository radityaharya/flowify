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
