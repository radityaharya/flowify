import { Logger } from "@/lib/log";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
import { Runner } from "~/lib/workflow/Workflow";
import { getAccessTokenFromUserId } from "~/server/db/helper";

const log = new Logger("/api/workflow/validate");
export async function POST(request: NextRequest) {
  const session = await getServerSession({ req: request, ...authOptions });
  if (!session) {
    return NextResponse.redirect("/api/auth/signin");
  }
  const accessToken = await getAccessTokenFromUserId(session.user.id);
  if (!accessToken) {
    return NextResponse.redirect("/api/auth/signin");
  }

  log.info("Received workflow from user", session.user.id);

  let workflow: WorkflowObject;
  try {
    workflow = (await request.json()) as WorkflowObject;
  } catch (err) {
    log.error("Error parsing workflow", err);
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
    const [valid, errors] = await runner.validateWorkflow(workflow);
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
      } catch (_e) {
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
