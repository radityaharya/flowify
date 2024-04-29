import { toast } from "sonner";

type validationResponse = {
  valid: boolean;
  errors: {
    errorType: string;
    operation: string;
  }[];
};
export async function requestValidateWorkflow(
  workflow: WorkflowObject,
): Promise<validationResponse> {
  const data = await fetch("/api/workflow/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workflow),
  });
  const json = await data.json();
  return json;
}

export async function validateWorkflow(workflow: WorkflowObject) {
  const validatePromise = requestValidateWorkflow(workflow).then((result) => {
    if (result.errors.length > 0 || !result.valid) {
      result.errors.forEach((error) => {
        toast.error(`Error Type: ${error.errorType}`, {
          description: `Operation: ${JSON.stringify(error.operation, null, 2)}`,
        });
      });
      throw new Error(result.errors.map((error) => error.errorType).join(", "));
    }
    return result;
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
