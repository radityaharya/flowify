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
import { type DefaultJWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify";
import { env } from "~/env";
import { db } from "~/server/db";
import { accounts, users } from "~/server/db/schema";

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

async function fetchNewTokens(refreshToken: string): Promise<TokenSet> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.SPOTIFY_CLIENT_ID,
      client_secret: env.SPOTIFY_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    method: "POST",
  });

  const tokens: TokenSet = await response.json();

  if (!response.ok) throw tokens;

  return tokens;
}

async function updateTokensInDB(
  userId: string,
  tokens: TokenSet,
  spotify: any,
) {
  const updateResult = await db
    .update(accounts)
    .set({
      access_token: tokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + (tokens?.expires_in ?? 0)),
      refresh_token: tokens.refresh_token ?? spotify!.refresh_token,
    })
    .where(
      and(
        eq(accounts.provider, "spotify"),
        eq(accounts.providerAccountId, spotify?.providerAccountId),
      ),
    );

  // logger.info(`Token update result for user ${userId}`, updateResult);
}

async function refreshAccessToken(userId: string, spotify: any) {
  if (spotify?.expires_at) {
    const expiryTime = spotify.expires_at * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;

    logger.debug(
      `Token expiry time for user ${userId}: ${new Date(expiryTime).toISOString()}, current time: ${new Date(currentTime).toISOString()}, time until expiry: ${timeUntilExpiry}ms`,
    );

    if (timeUntilExpiry < 10 * 60 * 1000) {
      logger.info(`Refreshing access token for user ${userId}`);
      try {
        const tokens = await fetchNewTokens(spotify?.refresh_token ?? "");
        logger.info(`New tokens received for user ${userId}`);

        await updateTokensInDB(userId, tokens, spotify);

        return tokens;
      } catch (error) {
        logger.error(`Error refreshing access token for user ${userId}`, error);
        return "RefreshAccessTokenError";
      }
    }
  }
  return null;
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user, token }) {
      const userId = user?.id || session?.user?.id || token?.user?.id;
      const spotify = await db.query.accounts.findFirst({
        where: (accounts, { eq }) => eq(accounts.userId, userId),
      });

      const errorOrTokens = await refreshAccessToken(userId, spotify);
      if (errorOrTokens === "RefreshAccessTokenError") {
        session.error = errorOrTokens;
      } else if (errorOrTokens) {
        // Update session with new tokens
        session.user.spotify_access_token = errorOrTokens.access_token ?? "";
      }

      session.user.providerAccountId = spotify?.providerAccountId ?? "";
      session.user.id = userId;
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user?.id) {
        if (account) {
          token.user = {
            ...user,
            providerAccountId: account.providerAccountId,
            spotify_access_token: account?.access_token ?? "",
          };
        }
      }

      // set to default plan if not set
      const userAcc = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, token.user.id),
        with: {
          plan: {
            columns: {
              id: true,
            },
          },
        },
      });

      if (!userAcc?.plan?.id) {
        const defaultPlan = await db.query.plans.findFirst({
          where: (plans, { eq }) => eq(plans.default, true),
        });
        await db
          .update(users)
          .set({ planId: defaultPlan?.id ?? "" })
          .where(eq(users.id, token.user.id));
      }

      return token;
    },
  },
  // @ts-expect-error next-auth types
  adapter: DrizzleAdapter(db),
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      authorization: { params: { scope: spotifyScopes.join(" ") } },
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
};

export const getServerAuthSession = () => getServerSession(authOptions);
