import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getAccessTokenFromUserId } from "@/server/db/helper";
import { createWorkflowQueue } from "../../workflowQueue";
import { Runner } from "@/lib/workflow/Workflow";
import { db } from "@/server/db";
import { Logger } from "@/lib/log";

const log = new Logger("/api/workflow/[id]/run");
export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  },
) {
  log.info("running workflow");
  const session = await getServerSession({ req: request, ...authOptions });
  if (!session) {
    log.error("Not authenticated");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const accessToken = await getAccessTokenFromUserId(session.user.id);
  if (!accessToken) {
    log.error("Unable to get access token");
    return NextResponse.json(
      { error: "Unable to get access token" },
      { status: 500 },
    );
  }
  const id = params.id;
  const workflow = await db.query.workflowJobs.findFirst({
    where: (workflowJobs, { eq }) => eq(workflowJobs.id, id),
  });

  if (!workflow?.workflow || workflow.userId !== session.user.id) {
    log.error("Unauthorized or Workflow not found");
    return NextResponse.json(
      { error: "Unauthorized or Workflow not found" },
      { status: 404 },
    );
  }

  const runner = new Runner({
    slug: session.user.id,
    access_token: accessToken,
  });
  const workflowObj = JSON.parse(workflow.workflow) as WorkflowObject;

  workflowObj.operations = runner.sortOperations(workflowObj);
  runner.validateWorkflow(workflowObj);

  try {
    const job = await createWorkflowQueue(
      workflowObj,
      session.user.id,
      workflow.id,
    );
    log.info("Added job to queue", {
      jobId: job.id,
      workflowId: workflow.id,
      userId: session.user.id,
    } as any);
    return NextResponse.json({ job });
  } catch (err) {
    log.error("Error adding job to queue", {
      error: err,
      workflowId: workflow.id,
      userId: session.user.id,
    } as any);
    return NextResponse.json(
      { error: "Error adding job to queue" },
      { status: 500 },
    );
  }
}
