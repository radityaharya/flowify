import useStore from "../states/store";
import { type Node } from "@xyflow/react";
import { type Edge } from "@xyflow/react";
import validateWorkflow from "./validate";
import { type Workflow } from "~/lib/workflow/types";

import { useShallow } from "zustand/react/shallow";
type reactFlowtoWorkflow = {
  nodes: Node[];
  edges: Edge[];
};
export default async function reactFlowToWorkflow({
  nodes,
  edges,
}: reactFlowtoWorkflow): Promise<{ workflow: Workflow; errors: any }> {
  console.log("reactFlowToWorkflow", { nodes, edges });

  const workflow = {
    name: "spotify-playlist",
    sources: [],
    operations: [],
  } as Workflow;

  // remove node types that doesnt match this pattern: *.*
  nodes = nodes.filter((node) => node.type?.match(/\w+\.\w+/));

  // remove "playlists" and "playlistIds" from nodes data except for Source nodes
  nodes.forEach((node) => {
    if (node.type!.startsWith("Source.")) {
      return;
    }
    delete node.data.playlists;
    delete node.data.playlistIds;
  });

  nodes.forEach((node) => {
    if (node.type!.startsWith("Source.")) {
      workflow.sources.push({
        id: node.id,
        type: node.type!,
        params: {
          id: node.data.playlistId,
        },
      });
    } else {
      workflow.operations.push({
        id: node.id,
        type: node.type! as any,
        params: node.data,
        sources: [],
      });
    }
  });

  edges.forEach((edge) => {
    const operation = workflow.operations.find((op) => op.id === edge.target);
    if (operation) {
      operation.sources.push(edge.source);
    }
  });

  const { errors } = await validateWorkflow(workflow);

  if (errors?.length > 0) {
    // setAlert({
    //   message: `Workflow is not valid because of the following errors: ${errors}`,
    //   title: "Error",
    //   type: "error",
    // });

    useStore.setState({
      alert: {
        message: `Workflow is not valid because of the following errors: \n${errors
          .map(
            (error) =>
              `Error Type: ${error.errorType}\nOperation: ${JSON.stringify(
                error.operation,
                null,
                2
              )}\n\n`
          )
          .join("")}`,
        title: "Error",
        type: "error",
      },
    });
  }

  console.log("workflow", workflow);
  console.log("errors", errors);

  return { workflow, errors };
}
