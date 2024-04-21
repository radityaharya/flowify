import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";
import { getSession } from "next-auth/react";
import { Logger } from "~/lib/log";
import { env } from "~/env";

const logger = new Logger("middleware:userApi");

const matchPaths = ["/api/user"];

export const withUserApi = (
  nextHandler: (arg0: NextRequest, arg1: NextFetchEvent) => any,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname, search } = request.nextUrl;

    if (matchPaths.some((path) => pathname.startsWith(path))) {
      logger.info("Match!");

      const req = {
        headers: Object.fromEntries(request.headers.entries()),
        method: request.method,
        url: request.nextUrl.href,
        body: request.body,
      };

      const session = await getSession({ req });

      if (!session) {
        logger.error("Not authenticated");
        return NextResponse.json(
          {
            error: "Not authenticated",
          },
          { status: 401 },
        );
      }

      // user namespace check
      if (pathname.startsWith("/api/user/")) {
        const userParam = pathname.split("/")[3];
        if (typeof userParam !== "string" || userParam.length > 100) {
          logger.error("Invalid userParam");
          return NextResponse.json(
            {
              error: "Invalid request",
            },
            { status: 400 },
          );
        }
        logger.debug(`userParam: ${userParam}`);

        if (userParam === "@me") {
          const userId = session.user.providerAccountId;
          const url = new URL(
            pathname.replace("@me", encodeURIComponent(userId)) + search,
            env.NEXTAUTH_URL,
          );
          logger.debug(`REWRITE: ${url.href}`);
          return NextResponse.rewrite(url);
        } else if (
          session.user.providerAccountId &&
          userParam &&
          session.user.providerAccountId !== userParam
        ) {
          logger.error("Unauthorized request to user namespace");
          return NextResponse.json(
            {
              error: "Unauthorized",
            },
            { status: 401 },
          );
        }
      }

      return nextHandler(request, _next);
    }
    return nextHandler(request, _next);
  };
};
