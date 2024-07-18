// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://64d7c7e096529fb09786607e4566768c@o4505652838596608.ingest.sentry.io/4506564012212224",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations: [
    Sentry.replayIntegration(
      {
        maskAllText: true,
        blockAllMedia: true,
      }
    )
  ]
});
