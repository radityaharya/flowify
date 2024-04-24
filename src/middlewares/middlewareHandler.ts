import { type NextMiddleware, NextResponse } from "next/server";
export type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;

export function middlewareHandler(
  functions: MiddlewareFactory[] = [],
  index = 0,
): NextMiddleware {
  const current = functions[index];
  if (current) {
    const next = middlewareHandler(functions, index + 1);
    return current(next);
  }
  return (req) => {
    const url = new URL(req.nextUrl.href);
    return NextResponse.rewrite(
      new URL(url.href + req.nextUrl.search, req.nextUrl.origin),
      {
        headers: {
          ...req.headers,
        },
      },
    );
  };
}
