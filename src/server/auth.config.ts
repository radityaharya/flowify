import SpotifyProvider from "next-auth/providers/spotify";
import type { NextAuthConfig } from "next-auth";
import { env } from "~/env";

const spotifyScopes = [
  "ugc-image-upload",
  "user-read-recently-played",
  "user-top-read",
  "user-read-playback-position",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "app-remote-control",
  "streaming",
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-follow-modify",
  "user-follow-read",
  "user-library-modify",
  "user-library-read",
  "user-read-email",
  "user-read-private",
];

export default {
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      // authorization: { params: { scope: spotifyScopes.join(" ") } },
      authorization: `https://accounts.spotify.com/authorize?scope=${encodeURIComponent(
        spotifyScopes.join(" "),
      )}`,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge:
      process.env.NODE_ENV === "development" ? 30 * 24 * 60 * 60 : 3 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
