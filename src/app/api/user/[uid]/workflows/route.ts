import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { db } from "@/server/db";
import { Logger } from "@/lib/log";

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

  const workflows = await db.query.workflowJobs.findMany({
    where: (workflowJobs, { eq }) => eq(workflowJobs.userId, session.user.id),
  });

  if (!workflows.length) {
    return NextResponse.json("No workflows found", { status: 404 });
  }

  const res = workflows.map(workflow => ({
    id: workflow.id,
    cron: workflow.cron,
    workflow: workflow.workflow ? JSON.parse(workflow.workflow) : null,
    createdAt: workflow.createdAt,
  }));

  log.info(`Returning workflows for user ${session.user.id}`);
  return NextResponse.json(res);
}