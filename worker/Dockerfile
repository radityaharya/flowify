FROM oven/bun:1 as base
WORKDIR /app
ENV NODE_ENV="production"

FROM base as deps
RUN bun add \
    postgres@^3.4.4 \
    radash@^12.1.0 \
    bullmq@^5.12.0 \
    drizzle-orm@latest \
    ioredis@^5.4.1 \
    spotify-web-api-node@^5.0.2 \
    @t3-oss/env-nextjs@^0.11.1 \
    lodash@^4.17.21 \
    cron-parser \
    @spotify/web-api-ts-sdk@^1.2.0

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