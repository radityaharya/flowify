# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
FROM oven/bun:1 as base

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
COPY worker/ ./
COPY src/ ./src/
COPY drizzle.config.ts ./
COPY tsconfig.json ./

# Build application
# Remove development dependencies
# RUN rm -rf node_modules && \
#   bun install --ci


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

CMD [ "bun", "./worker/worker.ts"]