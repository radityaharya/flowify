/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { type TokenSet } from "@auth/core/types";
import { env } from "~/env";
import { db } from "~/server/db";
import { accounts, mysqlTable } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

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

declare module "next-auth" {
  interface Session extends DefaultSession {
    error?: string;
    user: {
      id: string;
      providerAccountId: string;
      spotify_access_token: string;
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user }) {
      const spotify = await db.query.accounts.findFirst({
        where: (accounts, { eq }) => eq(accounts.userId, user.id),
      });
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      if (spotify?.expires_at! * 1000 < Date.now()) {
        // If the access token has expired, try to refresh it
        console.log("Refreshing access token for user", user.id);
        try {
          const response = await fetch(
            "https://accounts.spotify.com/api/token",
            {
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id: env.SPOTIFY_CLIENT_ID,
                client_secret: env.SPOTIFY_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: spotify!.refresh_token ?? "",
              }),
              method: "POST",
            },
          );

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const tokens: TokenSet = await response.json();

          if (!response.ok) throw tokens;

          await db
            .update(accounts)
            .set({
              access_token: tokens.access_token,
              expires_at: Math.floor(Date.now() / 1000 + tokens?.expires_in!),
              refresh_token: tokens.refresh_token ?? spotify!.refresh_token,
            })
            .where(
              and(
                eq(accounts.provider, "spotify"),
                eq(accounts.providerAccountId, spotify!.providerAccountId),
              ),
            );
        } catch (error) {
          console.error("Error refreshing access token", error);
          // The error property will be used client-side to handle the refresh token error
          session.error = "RefreshAccessTokenError";
        }
      }

      session.user.providerAccountId = spotify?.providerAccountId!;
      session.user.id = user.id;
      return session;
    },
  },
  // @ts-expect-error, the DrizzleAdapter type is not compatible with the NextAuthOptions type
  adapter: DrizzleAdapter(db, mysqlTable),
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      authorization: { params: { scope: spotifyScopes.join(" ") } },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  // session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  }
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
