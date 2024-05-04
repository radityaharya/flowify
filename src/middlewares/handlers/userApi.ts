import { getToken } from "next-auth/jwt";
import { type NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { Logger } from "~/lib/log";

const logger = new Logger("middleware:userApi");

const matchPaths = ["/api/user", "/api/workflow", "/workflow"];

const secret = process.env.NEXTAUTH_SECRET;

async function fetchSession(req: NextRequest) {
  const response = await fetch(process.env.NEXTAUTH_URL + "/api/auth/session", {
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }

  const session = await response.json();
  return session.user;
}

async function getUser(req: NextRequest) {
  try {
    const token = await getToken({ req, secret });
    if (token) {
      return token.user;
    }
  } catch (e: any) {
    logger.error(e.message);
  }

  return await fetchSession(req);
}

const rewriteToken = (newurl, request: NextRequest, sessionToken: string) => {
  const url = request.nextUrl;
  const cookies = `next-auth.session-token=${sessionToken}`;
  logger.debug("rewrite token");

  logger.info(`REWRITE: ${newurl}`);

  const newRequest = new NextRequest(new URL(newurl.href), {
    headers: {
      ...request.headers,
      "Content-Type": "application/json",
      Cookie: cookies,
    },
  });

  return newRequest;
};

const errorResponse = (message: string, status: number) => {
  logger.error(message);
  return NextResponse.json(
    {
      error: message,
    },
    { status },
  );
};

const handleUserPath = (request: NextRequest, user: any) => {
  const { pathname, search } = request.nextUrl;
  const userParam = pathname.split("/")[3];
  if (typeof userParam !== "string" || userParam.length > 100) {
    return errorResponse("Invalid userParam", 400);
  }
  logger.info(`userParam: ${userParam}`);

  if (userParam === "@me") {
    const userId = user.providerAccountId as string;
    const url = new URL(
      pathname.replace("@me", encodeURIComponent(userId)) + search,
      process.env.NEXTAUTH_URL,
    );
    logger.debug(`REWRITE: ${url.href}`);
    const sessionToken = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "");
    const sessionCookie = request.cookies.get("next-auth.session-token");
    if (!sessionCookie && sessionToken) {
      return rewriteToken(url, request, sessionToken);
    } else {
      return new NextRequest(url, {
        headers: request.headers,
      });
    }
  } else if (
    user.providerAccountId &&
    userParam &&
    user.providerAccountId !== userParam
  ) {
    return errorResponse("Unauthorized request to user namespace", 401);
  }
};

const handleWorkflowPath = (request: NextRequest) => {
  const sessionToken = request.headers
    .get("Authorization")
    ?.replace("Bearer ", "");
  const url = request.nextUrl;
  const sessionCookie = request.cookies.get("next-auth.session-token");
  if (!sessionCookie && sessionToken) {
    return rewriteToken(url, request, sessionToken);
  }
};

export const withUserApi = (
  nextHandler: (arg0: NextRequest, arg1: NextFetchEvent) => any,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    if (matchPaths.some((path) => pathname.startsWith(path))) {
      logger.debug("Match!");

      const user = await getUser(request);

      // if (!user && pathname.startsWith("/workflow")) {
      //   return NextResponse.redirect(
      //     new URL("/auth/login", process.env.NEXTAUTH_URL),
      //   );
      // }

      // if (!user) {
      //   return errorResponse("Not authenticated", 401);
      // }

      // user namespace check
      if (pathname.startsWith("/api/user/")) {
        const newRequest = handleUserPath(request, user);
        if (newRequest instanceof NextRequest) {
          request = newRequest;
        } else if (newRequest) {
          return newRequest;
        }
      } else if (pathname.startsWith("/api/workflow/")) {
        const newRequest = handleWorkflowPath(request);
        if (newRequest instanceof NextRequest) {
          request = newRequest;
        } else if (newRequest) {
          return newRequest;
        }
      }

      return nextHandler(request, _next);
    }
    return nextHandler(request, _next);
  };
};
