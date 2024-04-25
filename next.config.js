import million from "million/compiler";
await import("./src/env.js");

import { withSentryConfig } from "@sentry/nextjs";

const config = {
  experimental: {
    instrumentationHook: process.env.NO_WORKER ? false : true,
  },
  output: process.env.STANDALONE_OUTPUT ? "standalone" : undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.scdn.co",
      },
      {
        protocol: "https",
        hostname: "**.spotifycdn.com",
      },
    ],
  },
  appDir: true,
  webpack: (config) => {
    return config;
  },
};

const sentryConfig = withSentryConfig(
  config,
  {
    silent: true,
    org: "raditya-harya",
    project: "flowify",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  },
);

const prodConfig = million.next(sentryConfig, {
  auto: { rsc: true },
});

export default process.env.NODE_ENV === "development" ? config : prodConfig;
