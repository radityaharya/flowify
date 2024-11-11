import os from "node:os";

import { Logger } from "@lib/log";
import {
  compressReturnValues,
  updateWorkflowRun,
  updateWorkflowRunOperation,
} from "@lib/workflow/utils/workflowQueue";
import { Runner } from "@lib/workflow/Workflow";
import { Worker } from "bullmq";
import { eq } from "drizzle-orm";
import Redis from "ioredis";

import { db } from "@/server/db";
import { env } from "~/env";
import { getAccessTokenFromUserId } from "~/server/db/helper";
import { workerPool } from "~/server/db/schema";

const log = new Logger("worker");

const CONCURRENCY = 5;
let WORKER_ID = `${os.hostname()}-${process.env.WORKER_ID ?? `worker`}`;

let WORKER_ENDPOINT =
  process.env.WORKER_ENDPOINT ||
  (process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : undefined);

// simple server to wake up the worker
const server = Bun.serve({
  fetch() {
    return new Response(JSON.stringify({ status: "ok", workerId: WORKER_ID }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  port: 3020,
});
log.info("Listening on 0.0.0.0:3020");

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "workflowQueue",
  async (job, done) => {
    const data = job?.data;
    log.info("Running job", { jobId: job.id, data });

    if (!data) {
      throw new Error("No data found in job");
    }

    const maxExecutionTime = data.maxExecutionTime || 60000;
    await reportWorking();

    if (!job.id) {
      throw new Error("Job ID is undefined");
    }
    if (!WORKER_ID) {
      throw new Error("Worker ID is undefined");
    }

    await updateWorkflowRun(job.id, "active", WORKER_ID);


    console.log("debug: userid: " + data.userId)

    const userToken = await getAccessTokenFromUserId(data.userId as string);
    if (!userToken) {
      await reportIdle();
      throw new Error("No access token");
    }

    const runner = new Runner({
      slug: data.userId,
      token: userToken,
    });

    const workflow = data.workflow as Workflow.WorkflowObject;
    const operationCallback = createOperationCallback(job.id);
    let res: any;

    try {
      log.info("Running workflow...", {
        workflowId: workflow.id,
        job: job.id,
        userId: data.userId,
        maxExecutionTime,
        numOfOperations: workflow.operations.length,
      });

      res = await runner.runWorkflow(
        workflow,
        maxExecutionTime,
        operationCallback,
      );

      res = compressReturnValues(res);
    } catch (e) {
      log.error("Error running workflow", e);
      throw e;
    }

    log.info("Workflow executed successfully");
    return res;
  },
  {
    connection,
    concurrency: CONCURRENCY,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
);

worker.on("completed", async (job) => {
  log.info(`Job ${job.id} completed`);
  await updateWorkflowRun(job.id!, "completed", WORKER_ID);
});

worker.on("drained", () => {
  log.info("Queue drained");
  reportIdle();
});

worker.on("failed", async (job, err) => {
  log.error(`Job ${job?.id} failed`, err);
  if (job) {
    await updateWorkflowRun(job.id!, "failed", WORKER_ID);
  }
});

worker.on("active", (job) => {
  log.info(`Job ${job.id} active`);
  reportWorking();
});

function createOperationCallback(workflowRunId: string) {
  return async function operationCallback(id: string, data: any) {
    await updateWorkflowRunOperation(id, workflowRunId, data);
    return "ok";
  };
}

async function reportInit() {
  log.info("Worker started");

  const workerData = {
    deviceHash: WORKER_ID,
    concurrency: CONCURRENCY,
    threads: os.cpus().length,
    status: "idle",
    endpoint: WORKER_ENDPOINT,
  };

  log.info("Worker data for initialization:", workerData);

  await db.insert(workerPool).values(workerData).onConflictDoUpdate({
    target: workerPool.deviceHash,
    set: workerData,
  });

  const updatedWorker = await db.query.workerPool.findFirst({
    where: (workerPool, { eq }) => eq(workerPool.deviceHash, WORKER_ID),
  });
  if (updatedWorker) {
    log.info("Worker status updated");
  }
}

async function reportExit() {
  const workerData = {
    status: "sleeping",
    endpoint: WORKER_ENDPOINT,
  };

  log.info("Worker data for exit:", workerData);

  await db
    .update(workerPool)
    .set(workerData)
    .where(eq(workerPool.deviceHash, WORKER_ID));
  log.info("Worker exited");
}

async function reportWorking() {
  const workerData = {
    status: "working",
    endpoint: WORKER_ENDPOINT,
  };

  log.info("Worker data for working:", workerData);

  await db
    .update(workerPool)
    .set(workerData)
    .where(eq(workerPool.deviceHash, WORKER_ID));
}

async function reportIdle() {
  const workerData = {
    status: "idle",
    endpoint: WORKER_ENDPOINT,
  };

  log.info("Worker data for idle:", workerData);

  await db
    .update(workerPool)
    .set(workerData)
    .where(eq(workerPool.deviceHash, WORKER_ID));
}

async function allWorkers() {
  return await db.query.workerPool.findMany();
}

async function onExit() {
  log.info("Worker exiting...");
  await reportExit();
  worker.close();
  server.stop();
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
