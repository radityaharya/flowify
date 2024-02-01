import { toast } from "sonner";

export async function saveWorkflow(workflow: WorkflowResponse) {
  const promise = fetch("/api/workflow", {
    method: "POST",
    body: JSON.stringify(workflow),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.errors) {
        throw new Error("Error saving workflow");
      }
      return data;
    });
  toast.promise(promise, {
    loading: "Saving workflow...",
    success: (data) => {
      return `${workflow.name} saved successfully`;
    },
    error: "Error saving workflow",
  });
  return promise;
}
