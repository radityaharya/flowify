/* eslint-disable @typescript-eslint/no-floating-promises */
import useStore from "../states/store";
import { type Node, type Edge } from "@xyflow/react";
import validateWorkflow from "./validate";
import { type Workflow } from "~/lib/workflow/types";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

type ReactFlowToWorkflowInput = {
  nodes: Node[];
  edges: Edge[];
};

export default async function reactFlowToWorkflow({
  nodes,
  edges,
}: ReactFlowToWorkflowInput): Promise<{ workflow: Workflow; errors: any }> {
  console.log("reactFlowToWorkflow", { nodes, edges });

  const workflow: Workflow = {
    name: "spotify-playlist",
    sources: [],
    operations: [],
  };

  // remove node types that don't match this pattern: *.*
  nodes = nodes.filter((node) => node.type?.match(/\w+\.\w+/));

  // remove "playlists" and "playlistIds" from nodes data except for Source nodes
  nodes.forEach((node) => {
    if (node.type!.startsWith("Source.")) {
      return;
    }
    delete node.data.playlists;
    delete node.data.playlistIds;
  });

  let hasSource = false;

  nodes.forEach((node) => {
    if (node.type!.startsWith("Source.")) {
      hasSource = true;
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

  // Set nodes that have no sources as a source
  workflow.operations.forEach((operation) => {
    if (operation.sources.length === 0) {
      workflow.sources.push({
        id: operation.id,
        type: operation.type,
        params: operation.params,
      });
      // Remove the operation from the operations array
      workflow.operations = workflow.operations.filter(
        (op) => op.id !== operation.id,
      );
    }
  });

  const validatePromise = validateWorkflow(workflow).then((result) => {
    if (result.errors.length > 0 || !result.valid) {
      throw new Error("Validation failed");
    }
    return result;
  });

  toast.promise(validatePromise, {
    loading: "Validating workflow...",
    success: async (validationResult: { valid: boolean; errors: any[] }) => {
      const { valid, errors } = validationResult;
      console.log("validationResult", validationResult);
      if (!valid) {
        useStore.setState({
          alert: {
            message: `Workflow is not valid because of the following errors: \n${errors
              .map(
                (error) =>
                  `Error Type: ${error.errorType}\nOperation: ${JSON.stringify(
                    error.operation,
                    null,
                    2,
                  )}\n\n`,
              )
              .join("")}`,
            title: "Error",
            type: "error",
          },
        });
        return "Workflow is not valid";
      } else {
        return "Workflow is valid";
      }
    },
    error: "Workflow is not valid",
  });

  type ErrorType = { errorType: string; operation: string };

  let { valid, errors }: { valid: boolean; errors: ErrorType[] } = {
    valid: false,
    errors: [],
  };
  try {
    const result = await validatePromise;
    valid = result.valid;
    errors = result.errors;
    console.log("result", result);
  } catch (err) {
    console.error("Error validating workflow", err);
    valid = false;
    errors = [{ errorType: "Error", operation: "Error validating workflow" }];
  }

  if (valid) {
    const saveWorkflow = async (workflow) => {
      const promise = fetch("/api/workflow", {
        method: "POST",
        body: JSON.stringify(workflow),
      })
        .then((res) => {
          console.log("Server response", res);
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
          console.log("data", data);
          return "'Daily Intake' workflow saved successfully";
        },
        error: "Error saving workflow",
      });
      return promise;
    };
    const workflowResponse = await saveWorkflow(workflow);
    console.log("workflowResponse", workflowResponse);

    const { job } = workflowResponse;
    const { id } = job;

    const poolStatus = (id) => {
      return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
          (async () => {
            const res = await fetch(`/api/workflow/${id}`)
              .then((res) => res.json())
              .then((data) => {
                if (data.failedReason) {
                  reject(new Error(data.failedReason as string));
                }
                return data;
              });

            if (res.job.finishedOn) {
              clearInterval(intervalId);
              if (res.job.returnvalue) {
                resolve("'Daily Intake' workflow finished successfully");
              } else if (res.job.failedReason) {
                reject(new Error(res.job.failedReason as string));
              }
            }
          })().catch((err) => {
            clearInterval(intervalId);
            reject(err);
          });
        }, 1000);
      });
    };

    const promise = poolStatus(id);

    toast.promise(promise, {
      loading: `Running workflow ${id}...`,
      success: () => {
        return "'Daily Intake' workflow finished successfully";
      },
      error: (data) => {
        console.log("data on err", data);
        return "Failed running workflow: " + data;
      },
    });
  }

  console.log("workflow", workflow);
  console.log("errors", errors);

  return { workflow, errors };
}
