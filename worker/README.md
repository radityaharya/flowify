# Flowify Worker

This contains a standalone worker that can be run to process tasks from the queue. The worker is responsible for executing workflows and updating their the status to the database.


## Usage

Create a `.env` file in the root directory and add the following variables:

| Variable              | Description                        |
| --------------------- | -----------------------------------|
| DATABASE_URL          | Postgres connection string         |
| SPOTIFY_CLIENT_ID     | Spotify API client ID              |
| SPOTIFY_CLIENT_SECRET | Spotify API client secret          |
| REDIS_URL             | Redis connection URL               |

- Start worker

```bash
npm run start:worker
```

- Using docker

```bash
docker build -f worker/Dockerfile . -t flowify-worker
```

```bash
docker run -d -p 3020:3020 --env-file .env flowify-worker
```
