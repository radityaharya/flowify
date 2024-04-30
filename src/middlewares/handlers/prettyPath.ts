import { type NextFetchEvent, NextRequest } from "next/server";
import { Logger } from "~/lib/log";

const logger = new Logger("middleware:prettyPath");

const matchPaths = ["/workflow", "/api/workflow"];

const handlePath = (
  request: NextRequest,
  path: string,
  includeSearch: boolean = false,
) => {
  const { pathname, search } = request.nextUrl;
  logger.debug("pathname:", pathname);
  const uuidPattern =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const uuidMatch = pathname.match(uuidPattern);
  logger.debug("uuidMatch:", uuidMatch);
  let newPathname = pathname;

  if (uuidMatch) {
    const uuid = uuidMatch[0];
    const postUuidPath = pathname.split(uuid)[1];
    newPathname = `/${path}/${uuid}${postUuidPath}`;
  }

  logger.debug("newPathname:", newPathname);

  const url = new URL(
    `${request.nextUrl.origin}${newPathname}${includeSearch ? search : ""}`,
  );

  const newRequest = new NextRequest(
    new URL(url.href, request.nextUrl.origin),
    {
      headers: {
        ...request.headers,
        "Content-Type": "application/json",
      },
    },
  );

  return newRequest;
};

// is workflow namespace
const isWorkflowNamespace = (pathname: string) => {
  const uuidPattern =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const uuidMatch = pathname.match(uuidPattern);
  return uuidMatch;
};

const handleWorkflowPath = (request: NextRequest) =>
  handlePath(request, "workflow", true);
const handleWorkflowApiPath = (request: NextRequest) =>
  handlePath(request, "api/workflow", true);

export const prettyPath = (
  nextHandler: (arg0: NextRequest, arg1: NextFetchEvent) => any,
) => {
  return async (request: NextRequest, _next: NextFetchEvent) => {
    const { pathname } = request.nextUrl;
    if (
      matchPaths.some((path) => pathname.startsWith(path)) &&
      !pathname.includes("queue") &&
      !pathname.endsWith("run") &&
      !pathname.includes("/api") &&
      !pathname.includes("/history")
    ) {
      logger.debug("Match! Prettying path:", pathname);

      if (pathname.startsWith("/workflow")) {
        const newRequest = handleWorkflowPath(request);
        if (newRequest instanceof NextRequest) {
          request = newRequest;
        } else if (newRequest) {
          return newRequest;
        }
      } else if (
        pathname.startsWith("/api/workflow/") &&
        isWorkflowNamespace(pathname)
      ) {
        const newRequest = handleWorkflowApiPath(request);
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
