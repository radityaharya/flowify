import { Logger } from "@/lib/log";
import { authOptions } from "@/server/auth";
import {
  storeWorkflowJob,
  updateWorkflowJob,
  workflowExists,
} from "@lib/workflow/utils/workflowQueue";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { WorkflowObjectSchema } from "~/schemas";

const log = new Logger("/api/workflow");

export async function POST(request: NextRequest) {
  const session = await getServerSession({ req: request, ...authOptions });
  if (!session) {
    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      { status: 401 },
    );
  }

  const workflow = (await request.json()).workflow;
  const workflowParsed = WorkflowObjectSchema.safeParse(workflow);

  if (!workflowParsed.success) {
    return NextResponse.json(
      { error: "Invalid workflow", errors: workflow.error },
      { status: 400 },
    );
  }

  const job = {
    id: workflowParsed.data.id ?? uuidv4(),
    data: {
      workflow,
    },
    status: "wait",
    timestamp: Date.now(),
  };

  log.info("Storing workflow job", {
    jobId: job.id,
    userId: session.user.id,
  } as any);

  const response = (await workflowExists(job.id))
    ? await updateWorkflowJob(session.user.id, job)
    : await storeWorkflowJob(session.user.id, job);

  if (!response) {
    return NextResponse.json(
      { error: "Error storing workflow job" },
      { status: 500 },
    );
  }

  if (response.workflow) {
    try {
      response.workflow = JSON.parse(response.workflow);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json(
        { error: "Error parsing Workflow" },
        { status: 500 },
      );
    }
  }
  return NextResponse.json(response);
}
