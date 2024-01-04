
import { getWorkflowJob } from "../workflowQueue";
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
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

  const job = await getWorkflowJob(id);
  console.log(session);
  if (!job) {
    return NextResponse.json({ job: null });
  }

  if (job.data.userId !== session.user.id) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  return NextResponse.json({ job });
}
