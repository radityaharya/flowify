import { toast } from "sonner";
import useStore, { workflowRunStore } from "../states/store";

export async function runWorkflow(workflow: WorkflowResponse) {
  if (!workflow.id) {
    throw new Error("Workflow ID is undefined");
  }

  const dryrun = !useStore.getState().flowState.dryrun;
  const id = workflow.id;
  console.log("dryrun", dryrun);
  const promise = fetch(
    `/api/workflow/${id}/run${dryrun ? "?dryrun=true" : ""}`,
    {
      method: "POST",
    },
  )
    .then((res) => {
      return res.json();
    })
    .then(async (data) => {
      if (data.errors) {
        throw new Error("Error running workflow");
      }
      return data;
    });

  const job = await promise.then((data) => {
    return data.job;
  });

  if (!job.id) {
    throw new Error("Job ID is undefined");
  }

  const jobId = job.id as string;
  const workflowRun = workflowRunStore.getState();

  const pollRequest = (id: string) => {
    return new Promise((resolve, reject) => {
      let isRequesting = false;
      const interval = setInterval(() => {
        if (isRequesting) return;
        isRequesting = true;
        fetch(`/api/workflow/queue/${id}`)
          .then((res) => res.json())
          .then((data: QueueResponse) => {
            isRequesting = false;
            if (data.error) {
              clearInterval(interval);
              reject(new Error(data.error));
            } else {
              workflowRun.setWorkflowRun(data);
              if (data.status === "completed") {
                clearInterval(interval);
                resolve(data);
              }
            }
          })
          .catch((err) => {
            isRequesting = false;
            clearInterval(interval);
            reject(err);
          });
      }, 1000); // Poll every 1 second
    });
  };

  toast.promise(pollRequest(jobId), {
    loading: "Running workflow...",
    success: () => {
      setTimeout(() => {
        workflowRun.resetWorkflowRun();
      }, 5000);
      return "Workflow completed successfully";
    },
    error: (data) => {
      console.info("data on err", data);
      workflowRun.resetWorkflowRun();
      return "Failed running workflow: " + data;
    },
  });
}
