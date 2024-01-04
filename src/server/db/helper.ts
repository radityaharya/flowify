import { db } from ".";
import { accounts } from "~/server/db/schema";
import { env } from "~/env";
import { eq } from "drizzle-orm";

async function getAccessToken(whereClause: any) {
  const user = await db.query.accounts.findFirst({ where: whereClause });

  if (user && user.expires_at! * 1000 < Date.now()) {
    // console.debug("Refreshing access token for user", user.userId);
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: user.refresh_token!,
        }),
      });

      const refreshedTokens = await response.json();

      if (!response.ok) {
        throw refreshedTokens;
      }

      await db.update(accounts).set({
        access_token: refreshedTokens.access_token,
        expires_at: Math.floor(
          Date.now() / 1000 + Number(refreshedTokens?.expires_in ?? 0),
        ),
        refresh_token: refreshedTokens.refresh_token ?? user.refresh_token,
      });

      return refreshedTokens.access_token;
    } catch (error) {
      console.error("Error refreshing access token", error);
      return null;
    }
  }

  console.info("Returning access token from user", user?.userId);
  return user?.access_token;
}

async function getAccessTokenFromUserId(userId: string) {
  return getAccessToken(eq(accounts.userId, userId));
}

async function getAccessTokenFromProviderAccountId(providerAccountId: string) {
  return getAccessToken(eq(accounts.providerAccountId, providerAccountId));
}

export { getAccessTokenFromUserId, getAccessTokenFromProviderAccountId };
