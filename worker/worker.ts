import { env } from "../src/env";
import { Runner } from "../src/lib/workflow/Workflow";
import { type Workflow } from "../src/lib/workflow/types";
import { getAccessTokenFromUserId } from "../src/server/db/helper";
import { Worker } from "bullmq";
import { updateWorkflowJob } from "../src/app/api/workflow/workflowQueue";
import Redis from "ioredis";

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "workflowQueue",
  async (job) => {
    const data = job?.data;
    await updateWorkflowJob(job.id!, "active");
    if (!data) {
      throw new Error("No data found in job");
    }

    const accessToken = await getAccessTokenFromUserId(data.userId as string);
    if (!accessToken){
      throw new Error("no access token")
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
      await updateWorkflowJob(job.id!, "failed");
      console.error("Error running workflow", e);
      throw e;
    }
    console.log("Workflow executed successfully");
    await updateWorkflowJob(job.id!, "completed");
    return res;
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
);

export default worker;