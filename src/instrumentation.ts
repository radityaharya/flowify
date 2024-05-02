import { v4 as uuid } from "uuid";
import { env } from "~/env";
import { Runner } from "~/lib/workflow/Workflow";
import { getAccessTokenFromUserId } from "~/server/db/helper";

export const register = async () => {
  //This if statement is important, read here: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.NO_WORKER) {
    const hostname = (await import("os")).hostname();
    const WORKER_ID =
      hostname +
      "-" +
      `${process.env.WORKER_ID ?? `instrumentation-${uuid()}`}`;
    console.info("Registering worker");
    console.info("Worker ID", WORKER_ID);
    const { Worker } = await import("bullmq");
    const Redis = (await import("ioredis")).default;
    const updateWorkflowRun = (
      await import("~/lib/workflow/utils/workflowQueue")
    ).updateWorkflowRun;
    const connection = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });

    new Worker(
      "workflowQueue",
      async (job) => {
        const data = job?.data;
        await updateWorkflowRun(job.id!, "active", WORKER_ID);
        if (!data) {
          throw new Error("No data found in job");
        }
        const accessToken = await getAccessTokenFromUserId(
          data.userId as string,
        );
        const runner = new Runner({
          slug: data.userId,
          access_token: accessToken,
        });
        const workflow = data.workflow as Workflow.WorkflowObject;
        let res: any;
        try {
          res = await runner.runWorkflow(workflow);
        } catch (e) {
          await updateWorkflowRun(job.id!, "failed", WORKER_ID);
          console.error("Error running workflow", e);
          throw e;
        }
        await updateWorkflowRun(job.id!, "completed", WORKER_ID);
        return res.map((obj: any) => obj.track.id);
      },
      {
        connection,
        concurrency: 5,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    );
    return;
  }
  console.info("Not registering worker");
};
