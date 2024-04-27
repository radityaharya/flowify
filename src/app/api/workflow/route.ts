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
import { Runner } from "~/lib/workflow/Workflow";
import { getAccessTokenFromUserId } from "~/server/db/helper";

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
  const accessToken = await getAccessTokenFromUserId(session.user.id);
  if (!accessToken) {
    return NextResponse.json(
      {
        error: "Something went wrong, unable to get access token",
      },
      { status: 500 },
    );
  }

  log.info("Received workflow from user", session.user.id);
  let workflowRes: WorkflowResponse;
  try {
    workflowRes = (await request.json()) as WorkflowResponse;
  } catch (err) {
    log.error("Error parsing workflow", err);
    return NextResponse.json(
      { error: "Error parsing workflow: " + (err as Error).message },
      { status: 400 },
    );
  }
  const runner = new Runner({
    slug: session.user.id,
    access_token: accessToken,
  });

  const workflow = workflowRes.workflow;

  if (!workflow) {
    return NextResponse.json(
      { error: "No workflow provided" },
      { status: 400 },
    );
  }

  const operations = runner.sortOperations(workflow);
  workflow.operations = operations;
  const [valid, errors] = await runner.validateWorkflow(workflow);

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid workflow", errors },
      { status: 400 },
    );
  }

  const job = {
    id: workflow.id ?? uuidv4(),
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
