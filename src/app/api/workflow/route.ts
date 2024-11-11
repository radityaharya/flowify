import {
  storeWorkflowJob,
  updateWorkflowJob,
  workflowExists,
} from "@lib/workflow/utils/workflowQueue";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { Logger } from "@/lib/log";
import { auth } from "@/server/auth";
import { WorkflowObjectSchema } from "~/schemas";

const log = new Logger("/api/workflow");

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      { status: 401 },
    );
  }

  const rawWorkflowJob = await request.json();

  const workflow = rawWorkflowJob.workflow;
  const workflowParsed = WorkflowObjectSchema.safeParse(workflow);

  if (!workflowParsed.success) {
    return NextResponse.json(
      { error: "Invalid workflow", errors: workflowParsed.error.errors },
      { status: 400 },
    );
  }

  const job = {
    id: workflowParsed.data.id ?? uuidv4(),
    data: {
      workflow: workflowParsed.data,
      cron: rawWorkflowJob.cron,
    },
    status: "wait",
    timestamp: Date.now(),
  };

  log.info("Storing workflow job", {
    jobId: job.id,
    userId: session.user.id,
  });

  try {
    if (!session.user.id) {
      return NextResponse.json(
        { error: "User ID is missing" },
        { status: 400 },
      );
    }

    const response = await ((await workflowExists(job.id))
      ? updateWorkflowJob(session.user.id, job)
      : storeWorkflowJob(session.user.id, job));

    if (!response) {
      throw new Error("Error storing workflow job");
    }

    return NextResponse.json(response);
  } catch (error) {
    log.error("Error processing workflow job", {
      error: error instanceof Error ? error.message : String(error),
      jobId: job.id,
      userId: session.user.id,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
