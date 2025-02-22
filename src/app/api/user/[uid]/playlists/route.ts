import Redis from "ioredis";
import { type NextRequest, NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";

import { env } from "~/env";
import { Logger } from "~/lib/log";
import { getAccessTokenFromProviderAccountId } from "~/server/db/helper";

const logger = new Logger("/api/user/[uid]/playlists");

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ uid: string }>;
  },
) {
  const { uid } = await params;
  const accessToken = await getAccessTokenFromProviderAccountId(uid);
  if (!accessToken) {
    return NextResponse.json("No access token found", { status: 500 });
  }

  let redis: Redis | null = null;
  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  } catch (error) {
    logger.error("Failed to connect to Redis", error);
  }

  const spClient = new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
  });

  spClient.setAccessToken(accessToken.access_token);

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");

  const cacheKey = q ? `search:${q}` : `user:${uid}`;
  let cachedData;
  if (redis) {
    cachedData = await redis.get(cacheKey);
  }

  if (cachedData) {
    logger.info(`Cache hit for ${cacheKey}`);
    return NextResponse.json(JSON.parse(cachedData), {
      headers: {
        "X-Cache": "HIT",
      },
    });
  }

  let data;
  let playlists;

  if (q) {
    data = await spClient.searchPlaylists(q, {
      limit: 50,
    });
    playlists = data.body.playlists?.items.map((playlist) => ({
      playlistId: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image: playlist.images?.[0]?.url,
      total: playlist.tracks.total,
      owner: playlist.owner.display_name,
    }));
  } else {
    data = await spClient.getUserPlaylists(uid, {
      limit: 50,
    });
    playlists = data.body.items.map((playlist) => ({
      playlistId: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image: playlist.images?.[0]?.url,
      total: playlist.tracks.total,
      owner: playlist.owner.display_name,
    }));
  }

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(playlists), "EX", 10);
  }

  return NextResponse.json(playlists);
}
