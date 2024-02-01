import { env } from "../src/env";
import { Runner } from "../src/lib/workflow/Workflow";
import { getAccessTokenFromUserId } from "../src/server/db/helper";
import { Worker } from "bullmq";
import { updateWorkflowRun } from "../src/app/api/workflow/workflowQueue";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import os from "os";
import { Logger } from "@/lib/log";

const log = new Logger("worker");

const CONCURRENCY = 5;
const WORKER_ID =
  os.hostname() + "-" + `${process.env.WORKER_ID ?? "worker-" + uuidv4()}`;

log.info(`
Starting worker ${WORKER_ID} with concurrency ${CONCURRENCY}
`);

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "workflowQueue",
  async (job) => {
    const data = job?.data;
    await updateWorkflowRun(job.id!, "active", WORKER_ID);
    if (!data) {
      throw new Error("No data found in job");
    }

    const accessToken = await getAccessTokenFromUserId(data.userId as string);
    if (!accessToken) {
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
      log.error("Error running workflow", e);
      throw e;
    }
    log.info("Workflow executed successfully");
    await updateWorkflowRun(job.id!, "completed", WORKER_ID, res);
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
  },
);

export default worker;
