import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env.js";
import * as schema from "./schema";

import { type PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Fix for "sorry, too many clients already"
declare global {
  // eslint-disable-next-line no-var -- only var works here
  var db: PostgresJsDatabase<typeof schema> | undefined;
}

// biome-ignore lint/suspicious/noRedeclare: <explanation>
let db: PostgresJsDatabase<typeof schema>;

if (env.NODE_ENV === "production") {
  db = drizzle(postgres(env.DATABASE_URL), { schema });
} else {
  if (!global.db) global.db = drizzle(postgres(env.DATABASE_URL), { schema });

  db = global.db;
}

export { db };
