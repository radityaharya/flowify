# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.0.23
FROM oven/bun:${BUN_VERSION}-slim as base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY --link bun.lockb package.json ./
RUN bun install

# Copy application code
COPY worker/package.json ./
COPY worker/bun.lockb ./
COPY worker/worker.ts ./worker/worker.ts
COPY drizzle.config.ts ./
COPY tsconfig.json ./
COPY src/server ./src/server
COPY src/env.js ./src/env.js
COPY src/lib ./src/lib
COPY src/app/api/workflow/workflowQueue.ts ./src/app/api/workflow/workflowQueue.ts

# Build application
# Remove development dependencies
# RUN rm -rf node_modules && \
#   bun install --ci


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

CMD [ "bun", "./worker/worker.ts"]