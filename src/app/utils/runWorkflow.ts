import { toast } from "sonner";
import useStore, { workflowRunStore } from "../states/store";
import { mutate } from "swr";

export async function runWorkflow(workflow: Workflow.WorkflowResponse) {
  if (!workflow.id) {
    throw new Error("Workflow ID is undefined");
  }

  const dryrun = !useStore.getState().flowState.dryrun;
  const id = workflow.id;
  console.log("dryrun", dryrun);
  toast.info("Requesting to run workflow", {
    description: "Please wait...",
  });
  const promise = fetch(
    `/api/workflow/${id}/run${dryrun ? "?dryrun=true" : ""}`,
    {
      method: "POST",
    },
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        toast.error("Failed running workflow", {
          duration: 5000,
          description: data.error,
        });
      }
      return data;
    });

  const job = await promise.then((data) => {
    return data.job;
  });

  if (!job.id) {
    return;
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
          .then((data: Workflow.QueueResponse) => {
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
      mutate(`/api/user/@me/workflows`, undefined, { revalidate: true });
      return "Workflow completed successfully";
    },
    error: (data) => {
      console.info("data on err", data);
      workflowRun.resetWorkflowRun();
      return "Failed running workflow: " + data;
    },
  });
}
