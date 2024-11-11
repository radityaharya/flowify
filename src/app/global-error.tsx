"use client";

// import * as Sentry from "@sentry/nextjs";
import Error from "next/error";

export default function GlobalError({ error }) {
  // useEffect(() => {
  //   Sentry.captureException(error);
  // }, [error]);

  return (
    <html lang="en">
      <body>
        <Error statusCode={error.statusCode || 500} />
      </body>
    </html>
  );
}
