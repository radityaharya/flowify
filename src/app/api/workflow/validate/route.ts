import { Logger } from "@/lib/log";
import { auth } from "@/server/auth";
import { WorkflowObjectSchema } from "@schema";
import { type NextRequest, NextResponse } from "next/server";
import { getAccessTokenFromUserId } from "~/server/db/helper";

const log = new Logger("/api/workflow/validate");

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.redirect("/api/auth/signin");
  }
  const userId = session.user.id;
  if (!userId) {
    log.error("User ID is undefined");
    return NextResponse.redirect("/api/auth/signin");
  }
  const accessToken = await getAccessTokenFromUserId(userId);
  if (!accessToken) {
    return NextResponse.redirect("/api/auth/signin");
  }

  log.info("Received workflow from user", session.user.id);

  const workflow = WorkflowObjectSchema.safeParse(await request.json());

  return NextResponse.json(workflow);
}
