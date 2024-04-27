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

  const responsePromise = fetch("/api/workflow", {
    method: "POST",
    body: JSON.stringify(workflow),
  });

  toast.promise(responsePromise, {
    loading: "Saving workflow...",
    success: (_data) => `${workflow.name} saved successfully`,
    error: "Error saving workflow",
  });

  const response = await responsePromise;
  const data = await response.json();

  data.workflow = JSON.parse(data.workflow);

  if (data.errors) {
    throw new Error("Error saving workflow");
  }

  useStore.setState((state) => ({
    ...state,
    flowState: {
      ...state.flowState,
      description: data.description,
      name: data.name,
      id: data.id,
    },
  }));

  return data;
}
