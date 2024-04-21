import { NextResponse, type NextRequest } from "next/server";
import { getAccessTokenFromProviderAccountId } from "~/server/db/helper";
import SpotifyWebApi from "spotify-web-api-node";
import { env } from "~/env";
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: { uid: string };
  },
) {
  const accessToken = await getAccessTokenFromProviderAccountId(params.uid);
  if (!accessToken) {
    return NextResponse.json("No access token found", { status: 500 });
  }

  // const connection = new Redis(env.REDIS_URL, {
  //   maxRetriesPerRequest: null,
  // });

  // get user playlists and format them like above
  const spClient = new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
  });

  spClient.setAccessToken(accessToken as string);

  const q = request.nextUrl.searchParams.get("q");

  if (q) {
    const data = await spClient.searchPlaylists(q, {
      limit: 50,
    });
    const playlists = data.body.playlists?.items.map((playlist) => ({
      playlistId: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image: playlist.images?.[0]?.url,
      total: playlist.tracks.total,
      owner: playlist.owner.display_name,
    }));
    return NextResponse.json(playlists);
  } else {
    const data = await spClient.getUserPlaylists(params.uid, {
      limit: 50,
    });
    const playlists = data.body.items.map((playlist) => ({
      playlistId: playlist.id,
      name: playlist.name,
      description: playlist.description,
      image: playlist.images?.[0]?.url,
      total: playlist.tracks.total,
      owner: playlist.owner.display_name,
    }));
    return NextResponse.json(playlists);
  }
}
