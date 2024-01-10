import { type Workflow } from "~/lib/workflow/types";

export default async function validateWorkflow(workflow: Workflow) {
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
