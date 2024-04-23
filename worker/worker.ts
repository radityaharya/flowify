import { env } from "../src/env";
import { Runner } from "../src/lib/workflow/Workflow";
import { getAccessTokenFromUserId } from "../src/server/db/helper";
import { Worker } from "bullmq";
import { updateWorkflowRun } from "../src/app/api/workflow/workflowQueue";
import Redis from "ioredis";
import os from "os";
import { Logger } from "@/lib/log";
import { db } from "@/server/db";
import { workerPoll } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const log = new Logger("worker");

const CONCURRENCY = 5;
let WORKER_ID = `${os.hostname()}-${process.env.WORKER_ID ?? `worker`}`;

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "workflowQueue",
  async (job) => {
    const data = job?.data;
    await reportWorking();
    await updateWorkflowRun(job.id!, "active", WORKER_ID);
    if (!data) {
      throw new Error("No data found in job");
    }

    const accessToken = await getAccessTokenFromUserId(data.userId as string);
    if (!accessToken) {
      await reportIdle();
      throw new Error("no access token");
    }
    const runner = new Runner({
      slug: data.userId,
      access_token: accessToken,
    });
    const workflow = data.workflow as WorkflowObject;
    let res: any;
    try {
      log.info("Running workflow...");
      res = await runner.runWorkflow(workflow);
    } catch (e) {
      await updateWorkflowRun(job.id!, "failed", WORKER_ID);
      await reportIdle();
      log.error("Error running workflow", e);
      throw e;
    }
    log.info("Workflow executed successfully");
    await updateWorkflowRun(job.id!, "completed", WORKER_ID, res);
    await reportIdle();
    if (res.tracks) {
      res = res.tracks;
    }
    return res.map((obj: any) => obj.track.id);
  },
  {
    connection,
    concurrency: CONCURRENCY,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
    useWorkerThreads: true,
  },
);

async function reportInit() {
  log.info("Worker started");
  let i = 0;
  let worker = await db.query.workerPoll.findFirst({
    where: (workerPoll, { eq }) => eq(workerPoll.deviceHash, WORKER_ID),
  });

  while (worker) {
    i++;
    WORKER_ID = `${os.hostname()}-${process.env.WORKER_ID ?? `worker`}-${i}`;
    worker = await db.query.workerPoll.findFirst({
      where: (workerPoll, { eq }) => eq(workerPoll.deviceHash, WORKER_ID),
    });
  }

  await db.insert(workerPoll).values({
    deviceHash: WORKER_ID,
    concurrency: CONCURRENCY,
    threads: os.cpus().length,
    status: "idle",
  });

  const updatedWorker = await db.query.workerPoll.findFirst({
    where: (workerPoll, { eq }) => eq(workerPoll.deviceHash, WORKER_ID),
  });
  if (updatedWorker) {
    log.info("Worker status updated");
  }
}

async function reportExit() {
  log.info("Worker exiting...");
  await db.delete(workerPoll).where(eq(workerPoll.deviceHash, WORKER_ID));
  log.info("Worker deleted");
}

async function reportWorking() {
  await db
    .update(workerPoll)
    .set({
      status: "working",
    })
    .where(eq(workerPoll.deviceHash, WORKER_ID));
}

async function reportIdle() {
  await db
    .update(workerPoll)
    .set({
      status: "idle",
    })
    .where(eq(workerPoll.deviceHash, WORKER_ID));
}

async function allWorkers() {
  return await db.query.workerPoll.findMany();
}

async function onExit() {
  log.info("Worker exiting...");
  await reportExit();
  worker.close();
  process.exit(0);
}

async function onInit() {
  log.info(`
Starting worker ${WORKER_ID} with concurrency ${CONCURRENCY}
`);
  await reportInit();
  const workers = await allWorkers();
  console.info(workers);
}

process.on("SIGTERM", () => {
  onExit();
});

process.on("SIGINT", () => {
  onExit();
});

onInit();

export default worker;
