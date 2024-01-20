import { env } from "~/env";
import { Runner } from "~/lib/workflow/Workflow";
import { type Workflow } from "~/lib/workflow/types";
import { getAccessTokenFromUserId } from "~/server/db/helper";
import { v4 as uuid } from "uuid";

const WORKER_ID = process.env.WORKER_ID ?? `instrumentation-${uuid()}`;

export const register = async () => {
  //This if statement is important, read here: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.NO_WORKER) {
    console.log("Registering worker");
    console.log("Worker ID", WORKER_ID);
    const { Worker } = await import("bullmq");
    const Redis = (await import("ioredis")).default;
    const updateWorkflowJob = (await import("~/app/api/workflow/workflowQueue")).updateWorkflowJob;
    const connection = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });

    new Worker(
      "workflowQueue",
      async (job) => {
        const data = job?.data;
        await updateWorkflowJob(job.id!, "active", WORKER_ID);
        if (!data) {
          throw new Error("No data found in job");
        }

        const accessToken = await getAccessTokenFromUserId(data.userId as string);
        const runner = new Runner({
          slug: data.userId,
          access_token: accessToken,
        });
        const workflow = data.workflow as Workflow;
        let res: any;
        try{
          res = await runner.runWorkflow(workflow);
        } catch(e){
          await updateWorkflowJob(job.id!, "failed", WORKER_ID);
          console.error("Error running workflow", e);
          throw e;
        }
        // console.log("Workflow executed successfully", res);
        await updateWorkflowJob(job.id!, "completed", WORKER_ID);
        // console.log("Updated job", updated);
        // console.log(data);
        return res;
      },
      {
        connection,
        concurrency: 5,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      }
    );
  } else {
    console.log("Not registering worker");
  }
};