
import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
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
  const session = await getServerSession({ req: request, ...authOptions });

  if (!session) {
    return NextResponse.json(
      {
        error: "Not authenticated",
      },
      { status: 401 },
    );
  }

  if (session.user.providerAccountId !== params.uid) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const accessToken = await getAccessTokenFromProviderAccountId(params.uid);
  if (!accessToken) {
    return NextResponse.json("No access token found", { status: 500 });
  }

  // get user playlists and format them like above
  const spClient = new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
  });

  spClient.setAccessToken(accessToken as string);

  const data = await spClient.getUserPlaylists(params.uid, {
    limit: 50,
  });
  
  const playlists = data.body.items.map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    image: playlist.images[0]?.url,
    total: playlist.tracks.total,
    owner: playlist.owner.display_name,
  }));

  return NextResponse.json(playlists);
}