import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getToken } from "next-auth/jwt";
import { Runner } from "~/lib/workflow/Workflow";
import { type Workflow } from "~/lib/workflow/types";


const secret = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {

  const accessToken = {
    slug: "",
    access_token: ""
  }
  const runner = new Runner(accessToken);

  const workflow = await request.json() as Workflow;

  let res: any
  try {
    res = await runner.runWorkflow(workflow);
  } catch (err) {
    console.error("Error running workflow", err);
    const errorMessage = (err as Error).message;
    const errorLines = errorMessage.split('\n');
    const prettyErrors = errorLines.map(line => {
      const [errorType, operation] = line.split(' in operation: ') as [string, string];
      let operationObj = {};
      try {
        operationObj = operation ? JSON.parse(operation) : undefined;
      } catch (e) {
        operationObj = operation;
      }
      return { errorType: errorType.replace('Invalid ', ''), operation: operationObj };
    });
    return NextResponse.json({ errors: prettyErrors }, { status: 500 });
  }

  return NextResponse.json(res);
}
