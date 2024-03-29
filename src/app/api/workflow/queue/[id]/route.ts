import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { workflowRuns } from "~/server/db/schema";
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  },
) {
  const session = await getServerSession({ req: request, ...authOptions });
  const id = params.id;
  if (!id) {
    return NextResponse.json(
      {
        error: "No id provided",
      },
      { status: 400 },
    );
  }

  if (!session) {
    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      { status: 401 },
    );
  }

  const fields = request.nextUrl.searchParams.get("fields");

  const columns = fields
    ? fields.split(",").reduce((obj, key) => ({ ...obj, [key]: true }), {})
    : {
        id: true,
        workflow: true,
        returnValues: true,
        userId: true,
        status: true,
        startedAt: true,
        completedAt: true,
        error: true,
      };

  const workflowQuery = await db.query.workflowRuns.findFirst({
    where: eq(workflowRuns.id, id),
    with: {
      workflow: {
        columns: {
          ...columns,
          id: true,
          userId: true,
          workflow: true,
        },
      },
    },
  });

  if (!workflowQuery) {
    return NextResponse.json({ job: null });
  }

  if (workflowQuery.workflow.userId !== session.user.id) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  if (workflowQuery.workflow.workflow) {
    workflowQuery.workflow = JSON.parse(workflowQuery.workflow.workflow);
  }
  if (workflowQuery.returnValues) {
    workflowQuery.returnValues = JSON.parse(workflowQuery.returnValues);
  }
  return NextResponse.json(workflowQuery);
}
