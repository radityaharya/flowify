Worker service for running Bullmq jobs.

## Usage

```bash
npm run start:worker
```

## Building Docker Image

```bash
docker build -f worker/Dockerfile . -t flowify-worker
```

## Running Docker Image

```bash
docker run flowify-worker
```