import { NextResponse, type NextRequest } from "next/server";
import { getAccessTokenFromProviderAccountId } from "~/server/db/helper";
import SpotifyWebApi from "spotify-web-api-node";
import { env } from "~/env";
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      uid: string;
      playlistId: string;
    };
  },
) {
  const accessToken = await getAccessTokenFromProviderAccountId(params.uid);
  if (!accessToken) {
    return NextResponse.json("No access token found", { status: 500 });
  }

  const spClient = new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
  });

  spClient.setAccessToken(accessToken as string);

  const data = await spClient.getPlaylistTracks(params.playlistId);
  const tracks = data.body.items;
  const total = data.body.total;
  const limit = data.body.limit;
  let offset = limit;
  while (offset < total) {
    const data = await spClient.getPlaylistTracks(params.playlistId, {
      offset,
    });
    tracks.push(...data.body.items);
    offset += limit;
  }

  const playlist = {
    id: params.playlistId,
    tracks,
    total,
    actual: tracks.length,
  };

  return NextResponse.json(playlist);
}
