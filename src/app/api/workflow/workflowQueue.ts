import { Queue } from "bullmq";

import Redis from "ioredis";
import { env } from "~/env";
import { type Workflow } from "~/lib/workflow/types";
import { db } from "~/server/db";
import { workflowJobs } from "~/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";


const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const workflowQueue = new Queue("workflowQueue", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

async function storeWorkflowJob(userId: string, job: any) {
  console.log("Storing workflow job", job.id);
  const workflowJob = db.insert(workflowJobs).values({
    id: job.id,
    workflow: JSON.stringify(job.data.workflow),
    userId,
    status: job.status,
    startedAt: new Date(job.timestamp as number),
  });
  return workflowJob;
}
export async function createWorkflowQueue(workflow: Workflow, userId: string) {
  try{
    const job = await workflowQueue.add(
      "workflowQueue",
      { workflow, userId },
      {
        jobId: uuidv4(),
        removeOnComplete: {
          age: 3600, // keep up to 1 hour
          count: 1000, // keep up to 1000 jobs
        },
        removeOnFail: {
          age: 24 * 3600, // keep up to 24 hours
        },
      },
    );
    await storeWorkflowJob(userId, job);
    return job;
  } catch (err) {
    console.error("Error adding job to queue", err);
    throw err;
  }
}

export async function getWorkflowJob(id: string) {
  const job = await workflowQueue.getJob(id);
  return job;
}

export async function updateWorkflowJob(jobId: string, status?: string, workerId?: string) {
  try{
  console.log("Updating workflow job", jobId);
  const job = await workflowQueue.getJob(jobId);
  if (!job) {
    throw new Error("Job not found");
  }


  if (!status) {
    if (job.finishedOn) {
      status = "completed";
    } else if (job.stacktrace) {
      status = "failed";
    } else if (job.processedOn) {
      status = "active";
    } else if (job.delay) {
      status = "delayed";
    }
  }

  const finished = ["completed", "failed", "cancelled"].includes(status!);

  let completedAt;
  if (finished) {
    completedAt = new Date();
  }
  
  await db.update(workflowJobs).set({
    status: status,
    error: job.failedReason,
    completedAt: completedAt,
    workerId: workerId,
  }).where(
    eq(workflowJobs.id, jobId),
  );
  return "updated"
  } catch (err) {
    console.error("Error updating job", err);
    throw err;
  }
}