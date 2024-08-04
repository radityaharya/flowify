import { eq } from "drizzle-orm";
import { env } from "~/env";
import { accounts } from "~/server/db/schema";
import { db } from ".";

async function getAccessToken(whereClause: any) {
  const user = await db.query.accounts.findFirst({ where: whereClause });

  if (!(user?.access_token && user.refresh_token && user.expires_at)) {
    throw new Error("No access token");
  }

  if (user.expires_at * 1000 < Date.now()) {
    console.debug("Refreshing access token for user", user.userId);
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

      const refreshedTokens = (await response.json()) as {
        access_token: string;
        expires_in: number;
        refresh_token: string;
        token_type: string;
      };

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

      return refreshedTokens;
    } catch (error) {
      console.error("Error refreshing access token", error);
      return null;
    }
  }

  return {
    access_token: user.access_token,
    expires_in: (user.expires_at ?? 0) - Date.now() / 1000,
    refresh_token: user.refresh_token,
    token_type: "Bearer",
  };
}

async function getAccessTokenFromUserId(userId: string) {
  return await getAccessToken(eq(accounts.userId, userId));
}

async function getAccessTokenFromProviderAccountId(providerAccountId: string) {
  return await getAccessToken(
    eq(accounts.providerAccountId, providerAccountId),
  );
}

export { getAccessTokenFromUserId, getAccessTokenFromProviderAccountId };
