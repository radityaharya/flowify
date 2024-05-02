import { Logger } from "@/lib/log";
import { authOptions } from "@/server/auth";
import { WorkflowObjectSchema } from "@schema";
import { getServerSession } from "next-auth";
import { type NextRequest, NextResponse } from "next/server";
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

  // workflow = (await request.json()) as Workflow.WorkflowObject;

  const workflow = WorkflowObjectSchema.safeParse(await request.json());

  return NextResponse.json(workflow);
}
