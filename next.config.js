import million from 'million/compiler';
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    // domains: ["i.scdn.co", "mosaic.scdn.co", "image-cdn-fa.spotifycdn.com", "image-cdn-ak.spotifycdn.com", "image-cdn-ak.spotifycdn.com"],
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

export default million.next(
  config, { auto: { rsc: true } }
);

// export default config;