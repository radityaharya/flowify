import { toast } from "sonner";

export async function runWorkflow(workflow: WorkflowResponse) {
  if (!workflow.id) {
    throw new Error("Workflow ID is undefined");
  }
  const id = workflow.id;
  const promise = fetch(`/api/workflow/${id}/run`, {
    method: "POST",
  })
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
            } else if (data.status === "completed") {
              clearInterval(interval);
              resolve(data);
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
      return "Workflow completed successfully";
    },
    error: (data) => {
      console.info("data on err", data);
      return "Failed running workflow: " + data;
    },
  });
}
