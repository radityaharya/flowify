import { type NextRequest, NextResponse } from "next/server";
import { isUUID } from "validator";

import { Logger } from "@/lib/log";
import { auth } from "@/server/auth";
import { deleteWorkflowJob } from "~/lib/workflow/utils/workflowQueue";

const log = new Logger("/api/workflow/[id]");

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!(id && isUUID(id))) {
      log.error("No id provided");
      return NextResponse.json(
        {
          error: "No id provided",
        },
        { status: 400 },
      );
    }

    if (!session?.user) {
      log.error("Not authenticated");
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        { status: 401 },
      );
    }

    try {
      await deleteWorkflowJob(id);
    } catch (error) {
      log.error("Error deleting workflow", error);
      return NextResponse.json("Unexpected error", { status: 500 });
    }

    log.info(`Returning workflow ${id} for user ${session.user.id}`);
    return NextResponse.json({
      status: "success",
    });
  } catch (error) {
    log.error("Error getting workflow", error);
    return NextResponse.json("Unexpected error", { status: 500 });
  }
}
