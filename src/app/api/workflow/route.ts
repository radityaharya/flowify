import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getToken } from "next-auth/jwt";
import { Runner } from "~/lib/workflow/Workflow";
import { type Workflow } from "~/lib/workflow/types";
import { getAccessTokenFromProviderAccountId } from "~/server/db/helper";

export async function POST(request: NextRequest) {

  const session = await getServerSession({ req: request, ...authOptions });
  console.log(session)

  if (!session) {
    return NextResponse.redirect("/api/auth/signin");
  }

  const accessToken = await getAccessTokenFromProviderAccountId(session.user.providerAccountId);

  if (!accessToken) {
    return NextResponse.redirect("/api/auth/signin");
  }

  console.log(accessToken)

  // TODO: Change accessToken structure
  const runner = new Runner({
    slug: "spotify",
    access_token: accessToken,
  });

  const workflow = await request.json() as Workflow;

  console.log(JSON.parse(JSON.stringify(workflow)));

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
