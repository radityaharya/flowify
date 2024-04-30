import { Queue } from "bullmq";

import { Logger } from "@/lib/log";
import { eq } from "drizzle-orm";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import { env } from "~/env";
import { db } from "~/server/db";
import { workflowJobs, workflowRuns, workflowRunOperations } from "~/server/db/schema";

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

/**
 * Stores a workflow job in the database.
 * @param userId - The ID of the user associated with the job.
 * @param job - The job object to store.
 * @returns A Promise that resolves to the stored job.
 */
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

/**
 * Updates a workflow job in the database.
 * @param _userId - The user ID (not used in the function).
 * @param job - The job object containing the updated workflow job information.
 * @returns A Promise that resolves to the updated workflow job.
 */
export async function updateWorkflowJob(_userId: string, job: any) {
  log.info("Updating workflow job", job.id);
  await db
    .update(workflowJobs)
    .set({
      workflow: JSON.stringify(job.data.workflow),
      modifiedAt: new Date(job.timestamp as number),
    })
    .where(eq(workflowJobs.id, job.id as string));
  const res = await db.query.workflowJobs.findFirst({
    where: (workflowJobs, { eq }) => eq(workflowJobs.id, job.id as string),
  });
  return res;
}

/**
 * Checks if a workflow with the specified ID exists.
 * @param id - The ID of the workflow to check.
 * @returns A boolean indicating whether the workflow exists or not.
 */
export async function workflowExists(id: string) {
  const workflow = await db.query.workflowJobs.findFirst({
    where: (workflowJobs, { eq }) => eq(workflowJobs.id, id),
  });
  return !!workflow;
}

/**
 * Stores a workflow queue run in the database.
 *
 * @param workflowId - The ID of the workflow.
 * @param job - The job object containing information about the workflow run.
 * @returns A Promise that resolves to the stored workflow run.
 */
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

/**
 * Checks the availability of workers and wakes them up if necessary.
 * Returns the first available worker or null if no workers are available.
 * @returns {Promise<WorkerPool | null>} The first available worker or null.
 */
async function checkOrWakeWorkers() {
  log.info("Waking workers");

  const available = await db.query.workerPool.findMany({
    where: (workerPool, { eq }) =>
      eq(workerPool.status, "idle") || eq(workerPool.status, "working"),
    orderBy: (workerPool, { asc }) => asc(workerPool.joinedAt),
  });

  if (available.length > 0) {
    log.info("Worker available");
    return available[0];
  }

  const workers = await db.query.workerPool.findMany({
    where: (workerPool, { eq, isNotNull }) =>
      eq(workerPool.status, "sleep") && isNotNull(workerPool.endpoint),
    orderBy: (workerPool, { asc }) => asc(workerPool.joinedAt),
  });

  for (const worker of workers) {
    try {
      log.info("Waking worker", worker.deviceHash);
      const response = await fetch(worker.endpoint!);
      if (response.ok) {
        log.info("Worker woken up", worker.deviceHash);
        return worker;
      }
    } catch (err) {
      log.error("Error fetching worker status, trying next worker", err);
    }
  }
  return null;
}

/**
 * Creates a workflow queue and adds a job to it.
 * @param workflow - The workflow object.
 * @param userId - The user ID.
 * @param workflowId - The workflow ID.
 * @returns A promise that resolves to the added job.
 * @throws If there is an error adding the job to the queue.
 */
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
    await checkOrWakeWorkers();
    return job;
  } catch (err) {
    log.error("Error adding job to queue", err);
    throw err;
  }
}

/**
 * Retrieves a workflow job by its ID.
 * @param id - The ID of the workflow job.
 * @returns A Promise that resolves to the workflow job.
 */
export async function getWorkflowJob(id: string) {
  const job = await workflowQueue.getJob(id);
  return job;
}

/**
 * Updates the workflow run with the specified jobId.
 * @param jobId - The ID of the job to update.
 * @param status - The status of the job (optional).
 * @param workerId - The ID of the worker (optional).
 * @param returnValues - The return values of the job (optional).
 * @param prevState - The previous state of the job (optional).
 * @returns A promise that resolves to "updated" if the update is successful.
 * @throws If there is an error updating the run.
 */
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

export async function updateWorkflowRunOperation(
  operationId: string,
  workflowRunId: string,
  data: any,
) {
  log.info(`Updating operation ${operationId}`);
  const { startedAt, completedAt, ...cleanData } = data;
  await db
    .insert(workflowRunOperations)
    .values({
      id: operationId,
      workflowRunId: workflowRunId,
      data: JSON.stringify(cleanData),
      startedAt: data.startedAt,
      completedAt: data.completedAt,
    })
    .onConflictDoUpdate({
      target: workflowRunOperations.id,
      set: {
        workflowRunId: workflowRunId,
        data: JSON.stringify(cleanData),
        startedAt: data.startedAt,
        completedAt: data.completedAt,
      },
    });
}
/**
 * Compresses the return values by removing unnecessary properties.
 * @param returnValues - The array of return values to be compressed.
 * @returns The compressed array of return values.
 */
function compressReturnValues(returnValues: any[]) {
  const compressedValues: any[] = [];

  returnValues.forEach((playlist: any) => {
    const compressedPlaylist: any = {
      ...playlist,
      tracks: {
        items: playlist.tracks.map((item: any) => {
          const compressedItem: any = {
            ...item,
            track: {
              ...item.track,
              audio_features: undefined,
              available_markets: undefined,
              preview_url: undefined,
              external_ids: undefined,
              external_urls: undefined,
            },
          };

          if (compressedItem.track?.album) {
            compressedItem.track.album.release_date_precision = undefined;
            compressedItem.track.album.artists =
              compressedItem.track.album.artists.map(
                (artist: SpotifyApi.ArtistObjectSimplified) => ({
                  ...artist,
                  external_urls: undefined,
                  href: undefined,
                  uri: undefined,
                }),
              );
          }

          if (compressedItem.track) {
            compressedItem.track.artists = compressedItem.track.artists.map(
              (artist: SpotifyApi.ArtistObjectSimplified) => ({
                ...artist,
                external_urls: undefined,
                href: undefined,
                uri: undefined,
              }),
            );
          }

          return compressedItem;
        }),
      },
    };

    compressedValues.push(compressedPlaylist);
  });

  return compressedValues;
}
