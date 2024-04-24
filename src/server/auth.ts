/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { type TokenSet } from "@auth/core/types";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Logger } from "@lib/log";
import { and, eq } from "drizzle-orm";
import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify";
import { env } from "~/env";
import { db } from "~/server/db";
import { accounts } from "~/server/db/schema";

const logger = new Logger("auth");

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
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    error?: string;
    user: {
      id: string;
      providerAccountId: string;
      spotify_access_token: string;
      // role: UserRole;
    } & DefaultJWT["user"];
  }
}

async function refreshAccessToken(userId, spotify) {
  if (spotify?.expires_at! * 1000 < Date.now()) {
    logger.info("Refreshing access token for user", userId);
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.SPOTIFY_CLIENT_ID,
          client_secret: env.SPOTIFY_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: spotify!.refresh_token ?? "",
        }),
        method: "POST",
      });

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
      logger.error("Error refreshing access token", error);
      return "RefreshAccessTokenError";
    }
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user, token }) {
      const userId = user?.id || session?.user?.id || token?.user?.id;
      const spotify = await db.query.accounts.findFirst({
        where: (accounts, { eq }) => eq(accounts.userId, userId),
      });

      const error = await refreshAccessToken(userId, spotify);
      if (error) {
        session.error = error;
      }

      session.user.providerAccountId = spotify?.providerAccountId!;
      session.user.id = userId;
      return session;
    },
    jwt({ token, user, account, profile }) {
      if (user?.id) {
        if (account) {
          token.user = {
            ...user,
            providerAccountId: account.providerAccountId,
            spotify_access_token: account.access_token!,
          };
        }
      }

      return token;
    },
  },
  // @ts-expect-error, the DrizzleAdapter type is not compatible with the NextAuthOptions type
  adapter: DrizzleAdapter(db),
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
  session: {
    strategy: "jwt",
    maxAge:
      process.env.NODE_ENV === "development" ? 30 * 24 * 60 * 60 : 3 * 60 * 60, // 30 days in development, 3 hours otherwise
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: env.NEXTAUTH_SECRET,
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
