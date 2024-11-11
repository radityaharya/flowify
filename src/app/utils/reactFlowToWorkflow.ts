import { type Edge, type Node } from "@xyflow/react";
import { toast } from "sonner";

import useStore from "../states/store";
import { validateWorkflow } from "./validateWorkflow";

type ReactFlowToWorkflowInput = {
  nodes: Node[];
  edges: Edge[];
};

function addNodesToWorkflow(nodes, workflow) {
  nodes.forEach((node) => {
    const typeWithoutPostfix = node.type!.split("-")[0];
    workflow.operations.push({
      id: node.id,
      type: typeWithoutPostfix,
      params: node.data,
      position: node.position,
      sources: [],
      rfstate: {
        position: node.position,
        data: node.data,
      },
    });
  });
}

function addEdgesToWorkflow(edges, workflow) {
  edges.forEach((edge) => {
    const operation = workflow.operations.find((op) => op.id === edge.target);
    if (operation) {
      operation.sources.push(edge.source);
    }
    workflow.connections.push({
      id: `${edge.source}->${edge.target}`,
      source: edge.source,
      target: edge.target,
    });
  });
}
export default async function reactFlowToWorkflow({
  nodes,
  edges,
}: ReactFlowToWorkflowInput): Promise<{
  workflowResponse: Workflow.WorkflowResponse;
  errors: any;
}> {
  const flowState = useStore.getState().flowState;

  const workflowObject = {
    id: flowState.id ?? undefined,
    name:
      flowState.name && flowState.name.trim() !== ""
        ? flowState.name
        : "Untitled",
    description: flowState.description,
    operations: [],
    connections: [],
  };

  console.log({ nodes, edges });

  let [valid, errors] = [true, {}];
  if (nodes.length > 0 && edges.length > 0) {
    addNodesToWorkflow(nodes, workflowObject);
    addEdgesToWorkflow(edges, workflowObject);
    const response = await validateWorkflow(workflowObject);
    valid = response.valid;
    errors = response.errors;
    if (!valid) {
      throw new Error("Workflow is not valid");
    }
  } else {
    toast.error("You cannot save an empty workflow");
    errors = ["You cannot save an empty workflow"];
    valid = false;
  }

  console.info("workflow", workflowObject);

  const workflowResponse: Workflow.WorkflowResponse = {
    id: workflowObject.id,
    name: workflowObject.name,
    workflow: workflowObject,
    cron: flowState.cron,
  } as Workflow.WorkflowResponse;

  return { workflowResponse, errors };
}
