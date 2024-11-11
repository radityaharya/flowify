await import("./src/env.js");

const config = {
  output: process.env.STANDALONE_OUTPUT ? "standalone" : undefined,
  experimental: {
    reactCompiler: true,
  },
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
