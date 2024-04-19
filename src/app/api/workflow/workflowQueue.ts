import { Queue } from "bullmq";

import Redis from 'ioredis';
import { env } from "~/env";
import { db } from "~/server/db";
import { workflowJobs, workflowRuns } from "~/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { Logger } from "@/lib/log";

const log = new Logger("workflowQueue");

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const workflowQueue = new Queue("workflowQueue", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export async function storeWorkflowJob(userId: string, job: any) {
  log.info("Storing workflow job", job.id);
  await db.insert(workflowJobs).values({
    id: job.id,
    workflow: JSON.stringify(job.data.workflow),
    userId,
    createdAt: new Date(job.timestamp as number),
  });
  const res = await db.query.workflowJobs.findFirst({
    where: (workflowJobs, { eq }) => eq(workflowJobs.id, job.id as string),
  });
  return res;
}

export async function updateWorkflowJob(userId: string, job: any) {
  log.info("Updating workflow job", job.id);
  await db
    .update(workflowJobs)
    .set({
      workflow: JSON.stringify(job.data.workflow),
      // cron:
    })
    .where(eq(workflowJobs.id, job.id as string));
  const res = await db.query.workflowJobs.findFirst({
    where: (workflowJobs, { eq }) => eq(workflowJobs.id, job.id as string),
  });
  return res;
}

export async function workflowExists(id: string) {
  const workflow = await db.query.workflowJobs.findFirst({
    where: (workflowJobs, { eq }) => eq(workflowJobs.id, id),
  });
  return !!workflow;
}

export async function storeWorkflowQueueRun(workflowId: string, job: any) {
  log.info("Storing workflow run", workflowId);
  await db.insert(workflowRuns).values({
    id: job.id,
    workflowId,
    startedAt: new Date(job.timestamp as number),
  });
  const res = await db.query.workflowRuns.findFirst({
    where: (workflowRuns, { eq }) => eq(workflowRuns.id, job.id as string),
  });
  return res;
}
export async function createWorkflowQueue(
  workflow: WorkflowObject,
  userId: string,
  workflowId: string,
) {
  try {
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
    await storeWorkflowQueueRun(workflowId, job);
    return job;
  } catch (err) {
    log.error("Error adding job to queue", err);
    throw err;
  }
}

export async function getWorkflowJob(id: string) {
  const job = await workflowQueue.getJob(id);
  return job;
}

export async function updateWorkflowRun(
  jobId: string,
  status?: string,
  workerId?: string,
  returnValues?: any,
  prevState?: string,
) {
  try {
    log.info("Updating workflow run", jobId);
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

    if (returnValues?.length > 0) {
      returnValues = compressReturnValues(returnValues);
    }

    log.info("Updating workflow job", jobId);

    await db
      .update(workflowRuns)
      .set({
        status: status,
        error: job.failedReason,
        completedAt: completedAt,
        workerId: workerId,
        prevState: JSON.stringify(prevState),
        returnValues: JSON.stringify(returnValues),
      })
      .where(eq(workflowRuns.id, jobId));
    return "updated";
  } catch (err) {
    log.error("Error updating run", err);
    throw err;
  }
}

function compressReturnValues(returnValues: any) {
  returnValues.forEach((obj: any) => {
    delete obj.track.audio_features;
    delete obj.track.available_markets;
    delete obj.album.release_date_precision;
    delete obj.added_by;
    delete obj.video_thumbnail;
    delete obj.track.preview_url;
    delete obj.track.external_ids;
    delete obj.track.external_urls;

    obj.track.album.artists.forEach((artist: any) => {
      delete artist.external_urls;
      delete artist.href;
      delete artist.uri;
    });
    obj.track.artists.forEach((artist: any) => {
      delete artist.external_urls;
      delete artist.href;
      delete artist.uri;
    });
  });
  return returnValues;
}
