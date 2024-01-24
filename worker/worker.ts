import { env } from "../src/env";
import { Runner } from "../src/lib/workflow/Workflow";
import { type Workflow } from "../src/lib/workflow/types";
import { getAccessTokenFromUserId } from "../src/server/db/helper";
import { Worker } from "bullmq";
import { updateWorkflowJob } from "../src/app/api/workflow/workflowQueue";
import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";
import os from "os";

const CONCURRENCY = 5;
const WORKER_ID =
  os.hostname() + "-" + `${process.env.WORKER_ID ?? "worker-" + uuidv4()}`;

console.log(`
Starting worker ${WORKER_ID} with concurrency ${CONCURRENCY}
`);

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "workflowQueue",
  async (job) => {
    const data = job?.data;
    await updateWorkflowJob(job.id!, "active", WORKER_ID);
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
    const workflow = data.workflow as Workflow;
    let res: any;
    try {
      console.log("Running workflow...");
      res = await runner.runWorkflow(workflow);
    } catch (e) {
      await updateWorkflowJob(job.id!, "failed", WORKER_ID);
      console.error("Error running workflow", e);
      throw e;
    }
    console.log("Workflow executed successfully");
    await updateWorkflowJob(job.id!, "completed", WORKER_ID);
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
