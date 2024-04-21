import { env } from "~/env";
import { Runner } from "~/lib/workflow/Workflow";
import { getAccessTokenFromUserId } from "~/server/db/helper";
import { v4 as uuid } from "uuid";

export const register = async () => {
  //This if statement is important, read here: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.NO_WORKER) {
    const hostname = (await import("os")).hostname();
    const WORKER_ID =
      hostname +
      "-" +
      `${process.env.WORKER_ID ?? `instrumentation-${uuid()}`}`;
    console.log("Registering worker");
    console.log("Worker ID", WORKER_ID);
    const { Worker } = await import("bullmq");
    const updateWorkflowRun = (await import("~/app/api/workflow/workflowQueue"))
      .updateWorkflowRun;

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
        const workflow = data.workflow as WorkflowObject;
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
        connection: {
          path: env.REDIS_URL,
        },
        concurrency: 5,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      },
    );
    return;
  }
  console.log("Not registering worker");
};
