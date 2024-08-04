FROM oven/bun:1 as base
WORKDIR /app
ENV NODE_ENV="production"

FROM base as deps
RUN bun add postgres radash bullmq drizzle-orm ioredis spotify-web-api-node @t3-oss/env-nextjs lodash cron-parser @spotify/web-api-ts-sdk

FROM base as build
COPY --from=deps /app/node_modules ./node_modules
COPY worker/ ./worker
COPY src/lib ./src/lib
COPY src/server ./src/server
COPY src/env.js ./src/env.js
COPY src/schemas.ts ./src/schemas.ts
COPY drizzle.config.ts ./
COPY tsconfig.json ./
RUN bun build --target bun --compile --minify --smol --sourcemap --outfile flowify-worker ./worker/worker.ts

FROM oven/bun:1-alpine as release
COPY --from=build /app/flowify-worker ./
ENV SKIP_ENV_VALIDATION true
EXPOSE 3020
CMD [ "./flowify-worker" ]