import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
// import { Runner } from "~/lib/workflow/Workflow";
import { type Workflow } from "~/lib/workflow/types";
import { getAccessTokenFromProviderAccountId } from "~/server/db/helper";
import { Runner } from "~/lib/workflow/Workflow";
export async function POST(request: NextRequest) {
  const session = await getServerSession({ req: request, ...authOptions });
  if (!session) {
    return NextResponse.redirect("/api/auth/signin");
  }
  const accessToken = await getAccessTokenFromProviderAccountId(
    session.user.providerAccountId,
  );
  if (!accessToken) {
    return NextResponse.redirect("/api/auth/signin");
  }

  console.log("session", session);
  console.log("Received workflow from user", session.user.providerAccountId);

  let workflow: Workflow;
  try {
    workflow = (await request.json()) as Workflow;
  } catch (err) {
    console.error("Error parsing workflow", err);
    return NextResponse.json(
      { error: "Error parsing workflow: " + (err as Error).message },
      { status: 400 },
    );
  }
  const runner = new Runner({
    slug: session.user.id,
    access_token: accessToken,
  });

  let res: any;
  try {
    const operations = runner.sortOperations(workflow);
    workflow.operations = operations;
    // res = runner.validateWorkflow(workflow);
    const [valid, errors] = runner.validateWorkflow(workflow);
    res = { valid, errors };
  } catch (err) {
    const errorMessage = (err as Error).message;
    const errorLines = errorMessage.split("\n");
    const prettyErrors = errorLines.map((line) => {
      const [errorType, operation] = line.split(" in operation: ") as [
        string,
        string,
      ];
      let operationObj = {};
      try {
        operationObj = operation ? JSON.parse(operation) : undefined;
      } catch (e) {
        operationObj = operation;
      }
      return {
        errorType: errorType.replace("Invalid ", ""),
        operation: operationObj,
      };
    });

    res = { valid: false, errors: prettyErrors };
    return NextResponse.json(res, { status: 500 });
  }

  return NextResponse.json(res);
}