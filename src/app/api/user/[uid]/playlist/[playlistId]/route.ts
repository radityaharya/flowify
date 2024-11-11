import { type NextRequest, NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";

import { env } from "~/env";
import { getAccessTokenFromProviderAccountId } from "~/server/db/helper";
export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ uid: string; playlistId: string }>;
  },
) {
  const { uid, playlistId } = await params;
  const accessToken = await getAccessTokenFromProviderAccountId(uid);
  if (!accessToken) {
    return NextResponse.json("No access token found", { status: 500 });
  }

  const spClient = new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
  });

  spClient.setAccessToken(accessToken.access_token);

  const response = await spClient.getPlaylist(playlistId);

  const playlist = {
    id: response.body.id,
    name: response.body.name,
    description: response.body.description,
    image: response.body.images?.[0]?.url,
    total: response.body.tracks.total,
    owner: response.body.owner.display_name,
  };

  return NextResponse.json(playlist);
}
