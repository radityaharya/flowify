await import("./src/env.js");

const config = {
  experimental: {
    instrumentationHook: true
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

export default config;
