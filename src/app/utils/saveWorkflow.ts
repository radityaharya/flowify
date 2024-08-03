import { toast } from "sonner";
import useStore from "~/app/states/store";
import reactFlowToWorkflow from "./reactFlowToWorkflow";

async function fetchWorkflow(workflow: any): Promise<Response> {
  return fetch("/api/workflow", {
    method: "POST",
    body: JSON.stringify(workflow),
  });
}

function handleErrors(errors: any[]): void {
  if (errors.length > 0) {
    console.error("Errors in workflow", errors);
    throw new Error("Error saving workflow");
  }
}

function updateStore(data: any): void {
  useStore.setState((state) => ({
    ...state,
    flowState: {
      ...state.flowState,
      description: data.workflow.description,
      name: data.workflow.name,
      id: data.id,
    },
  }));
}

export async function saveWorkflow(): Promise<Workflow.WorkflowResponse> {
  const { nodes, edges } = useStore.getState();
  const { workflowResponse: workflow, errors } = await reactFlowToWorkflow({
    nodes,
    edges,
  });

  handleErrors(errors);

  const responsePromise = fetchWorkflow(workflow);

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

  data.workflow = JSON.parse(data.workflow);

  updateStore(data);

  return data;
}
