import { toast } from "sonner";
import useStore from "~/app/states/store";
import reactFlowToWorkflow from "./reactFlowToWorkflow";
export async function saveWorkflow() {
  const nodes = useStore.getState().nodes;
  const edges = useStore.getState().edges;
  const { workflowResponse: workflow, errors } = await reactFlowToWorkflow({
    nodes,
    edges,
  });

  if (errors.length > 0) {
    console.error("Errors in workflow", errors);
    return;
  }

  const responsePromise = fetch("/api/workflow", {
    method: "POST",
    body: JSON.stringify(workflow),
  });

  toast.promise(responsePromise, {
    loading: "Saving workflow...",
    success: (_data) => `${workflow.workflow.name} saved successfully`,
    error: "Error saving workflow",
  });

  const response = await responsePromise;
  const data = await response.json();

  if (data.errors) {
    throw new Error("Error saving workflow");
  }

  useStore.setState((state) => ({
    ...state,
    flowState: {
      ...state.flowState,
      description: data.workflow.description,
      name: data.workflow.name,
      id: data.id,
    },
  }));

  return data;
}
