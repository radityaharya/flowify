import { toast } from "sonner";
import { ZodError } from "zod";
type validationResponse =
  | { success: true; data: Workflow.WorkflowObject }
  | { success: false; error: ZodError };
export async function requestValidateWorkflow(
  workflow: Workflow.WorkflowObject,
): Promise<validationResponse> {
  const data = await fetch("/api/workflow/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workflow),
  });
  const json = (await data.json()) as validationResponse;
  return json;
}

export async function validateWorkflow(workflow: Workflow.WorkflowObject) {
  const validatePromise = requestValidateWorkflow(workflow).then((response) => {
    if (response.success) {
      return { valid: true, errors: [] };
    } else {
      return {
        valid: false,
        errors: response.error.errors.map((error) => ({
          errorType: error.message,
          operation: error.path.join("."),
        })),
      };
    }
  });

  toast.promise(validatePromise, {
    loading: "Validating workflow...",
    success: "Workflow is valid!",
    error: (error: Error) => {
      console.error("Error validating workflow", error);
      return "Workflow is not valid";
    },
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
    console.info("result", result);
  } catch (err) {
    console.error("Error validating workflow", err);
    valid = false;
    errors = [{ errorType: "Error", operation: "Error validating workflow" }];
  }
  return { valid, errors };
}
