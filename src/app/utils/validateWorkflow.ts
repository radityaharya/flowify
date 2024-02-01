import { toast } from "sonner";
import { error } from "console";
import { string } from "zod";

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
        toast.error(
          `Workflow is not valid because of the following errors: \n${errors
            .map(
              (error) =>
                `Error Type: ${error.errorType}\nOperation: ${JSON.stringify(
                  error.operation,
                  null,
                  2,
                )}\n\n`,
            )
            .join("")}`,
        );
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
  return { valid, errors };
}
