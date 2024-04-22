import million from "million/compiler";
await import("./src/env.js");

import { withSentryConfig } from "@sentry/nextjs";

/** @type {import("next").NextConfig} */
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
};

let sentryConfig
let millionConfig

if (process.env.SENTRY) {
  sentryConfig = withSentryConfig(
    config,
    {
      silent: true,
      org: "raditya-harya",
      project: "flowify",
    },
    {
      widenClientFileUpload: true,
      transpileClientSDK: false,
      tunnelRoute: "/monitoring",
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
    },
  );
}

if (process.env.MILLION) {
  millionConfig = million.next(
    {
      ...sentryConfig,
      webpack: (config, options) => {
        return config;
      },
    },
    {
      auto: { rsc: true },
    },
  );
}

const prodConfig = {
  ...millionConfig,
  ...sentryConfig,
  ...config,
  webpack: (config, options) => {
    return config;
  },
};

export default process.env.NODE_ENV === "development" ? config : prodConfig;