import { Logger } from "@/lib/log";
import { Runner } from "@/lib/workflow/Workflow";
import { authOptions } from "@/server/auth";
import { db } from "@/server/db";
import { getAccessTokenFromUserId } from "@/server/db/helper";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { createWorkflowQueue } from "~/lib/workflow/utils/workflowQueue";
import { WorkflowObjectSchema } from "~/schemas";

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

  const dryrun = request.nextUrl.searchParams.get("dryrun") === "true";

  const runner = new Runner({
    slug: session.user.id,
    token: accessToken,
  });
  const workflowParsed = WorkflowObjectSchema.safeParse(
    (await JSON.parse(workflow.workflow)) as any,
  );

  if (!workflowParsed.success) {
    log.error("Invalid workflow", {
      errors: workflowParsed.error,
      workflowId: workflow.id,
      userId: session.user.id,
    } as any);
    return NextResponse.json({ error: "Invalid workflow" }, { status: 400 });
  }

  workflowParsed.data.operations = runner.sortOperations(workflowParsed.data);
  workflowParsed.data.dryrun = dryrun;
  if (dryrun) {
    log.info("Dryrun mode enabled");
  }

  try {
    const job = await createWorkflowQueue(
      workflowParsed.data,
      session.user.id,
      workflow.id,
    );
    log.info("Added job to queue", {
      jobId: job.id,
      workflowId: workflow.id,
      userId: session.user.id,
    } as any);
    return NextResponse.json({ job });
  } catch (err: any) {
    log.error("Error adding job to queue", {
      error: err.message,
      workflowId: workflow.id,
      userId: session.user.id,
    } as any);
    return NextResponse.json(
      { error: "Error adding job to queue: " + err.message },
      { status: 500 },
    );
  }
}
