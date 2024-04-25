import { type Edge, type Node } from "@xyflow/react";
import { generate } from "random-words";
import { toast } from "sonner";
/* eslint-disable @typescript-eslint/no-floating-promises */
import useStore from "../states/store";
import { validateWorkflow } from "./validateWorkflow";

type ReactFlowToWorkflowInput = {
  nodes: Node[];
  edges: Edge[];
};

function filterNodes(nodes) {
  return nodes.filter((node) => node.type?.match(/\w+\.\w+/));
}

function removeUnnecessaryData(nodes) {
  nodes.forEach((node) => {
    if (node.type === "Combiner.alternate") {
      node.params.playlists = undefined;
      node.params.playlistIds = undefined;
    }
  });
}

function addNodesToWorkflow(nodes, workflow) {
  let _hasSource = false;

  nodes.forEach((node) => {
    if (node.type!.startsWith("Source.")) {
      _hasSource = true;
      workflow.sources.push({
        id: node.id,
        type: node.type!,
        params: node.data,
        rfstate: {
          position: node.position,
          data: node.data,
        },
      });
    } else {
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
    }
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

function setNodesAsSources(workflow) {
  workflow.operations.forEach((operation) => {
    if (operation.sources.length === 0) {
      workflow.sources.push({
        id: operation.id,
        type: operation.type,
        params: operation.params,
        rfstate: {
          position: operation.position,
          data: operation.params,
        },
      });
      workflow.operations = workflow.operations.filter(
        (op) => op.id !== operation.id,
      );
    }
  });
}
export default async function reactFlowToWorkflow({
  nodes,
  edges,
}: ReactFlowToWorkflowInput): Promise<{
  workflowResponse: WorkflowResponse;
  errors: any;
}> {
  // const { flowState } = useStore((state) => ({
  //   flowState: state.flowState,
  // }));

  const flowState = useStore.getState().flowState;

  function generateName() {
    return generate({ exactly: 2, join: "-" });
  }

  const workflowObject = {
    id: flowState.id ?? undefined,
    name:
      flowState.name && flowState.name.trim() !== ""
        ? flowState.name
        : generateName(),
    description: flowState.description,
    sources: [],
    operations: [],
    connections: [],
  };

  let [valid, errors] = [true, {}];
  if (nodes.length > 0 && edges.length > 0) {
    // nodes = filterNodes(nodes);
    addNodesToWorkflow(nodes, workflowObject);
    addEdgesToWorkflow(edges, workflowObject);
    setNodesAsSources(workflowObject);

    removeUnnecessaryData(workflowObject.sources);
    removeUnnecessaryData(workflowObject.operations);
    const response = await validateWorkflow(workflowObject);
    valid = response.valid;
    errors = response.errors;
    if (!valid) {
      throw new Error("Workflow is not valid");
    }
  } else {
    toast.error("No workflow provided");
    valid = false;
  }

  console.info("workflow", workflowObject);

  const workflowResponse: WorkflowResponse = {
    id: workflowObject.id,
    name: workflowObject.name,
    workflow: workflowObject,
    cron: flowState.cron,
  } as WorkflowResponse;

  return { workflowResponse, errors };
}
