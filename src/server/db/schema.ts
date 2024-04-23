import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import {
  index,
  integer as int,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    userIdIdx: index().on(account.userId),
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable(
  "session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    sessionToken: text("sessionToken").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index().on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const workflowJobs = pgTable(
  "workflowJob",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    workflow: text("workflow"),
    createdAt: timestamp("createdAt", { mode: "date" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    modifiedAt: timestamp("modifiedAt", { mode: "date" }),
    userId: varchar("userId", { length: 255 }).notNull(),
    cron: varchar("cron", { length: 255 }),
  },
  (workflowJob) => ({
    userIdIdx: index("workflowJobs_userId_idx").on(workflowJob.userId),
    workflowIdIdx: index("workflowJobs_workflowId_idx").on(workflowJob.id),
  }),
);
export const workflowJobsRelations = relations(
  workflowJobs,
  ({ one, many }) => ({
    user: one(users, { fields: [workflowJobs.userId], references: [users.id] }),
    workflowRuns: many(workflowRuns),
  }),
);

export const workflowRuns = pgTable(
  "workflowRun",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    workflowId: varchar("workflowId", { length: 255 }).notNull(),
    status: varchar("status", { length: 255 }),
    error: text("error"),
    startedAt: timestamp("startedAt", { mode: "date" }),
    completedAt: timestamp("completedAt", { mode: "date" }),
    workerId: varchar("workerId", { length: 255 }),
    prevState: text("prevState"),
    returnValues: text("returnValues"),
  },
  (workflowRun) => ({
    workflowIdIdx: index("workflowRuns_workflowId_idx").on(workflowRun.id),
  }),
);
export const workflowRunsRelations = relations(workflowRuns, ({ one }) => ({
  workflow: one(workflowJobs, {
    fields: [workflowRuns.workflowId],
    references: [workflowJobs.id],
  }),
}));
// export const trackModifications = pgTable(
//   "trackModificattion",
//   {
//     id: varchar("id", { length: 36 }).notNull().primaryKey(),
//     userId: varchar("userId", { length: 36 }).notNull(),
//     createdAt: timestamp("createdAt", { mode: "date" }).default(
//       sql`CURRENT_TIMESTAMP`,
//     ),
//     workflowRunId: varchar("workflowRunId", { length: 36 }).notNull(),
//     operationId: varchar("operationId", { length: 36 }).notNull(),
//     before: json("before").$type<string[]>(),
//     after: json("after").$type<string[]>(),
//   },
//   (trackModificattion) => ({
//     userIdIdx: index("userId_idx").on(trackModificattion.userId),
//     workflowRunIdIdx: index("workflowRunId_idx").on(
//       trackModificattion.workflowRunId,
//     ),
//   }),
// );

// export const trackModificationsRelations = relations(
//   trackModifications,
//   ({ one }) => ({
//     user: one(users, {
//       fields: [trackModifications.userId],
//       references: [users.id],
//     }),
//     workflowRun: one(workflowRuns, {
//       fields: [trackModifications.workflowRunId],
//       references: [workflowRuns.id],
//     }),
//   }),
// );
export const workerPool = pgTable(
  "workerPool",
  {
    deviceHash: varchar("deviceHash", { length: 255 }).notNull().primaryKey(),
    joinedAt: timestamp("joinedAt", { mode: "date" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    concurrency: int("concurrency"),
    threads: int("threads"),
    status: varchar("status", { length: 10 }),
  },
  (workerPool) => ({
    workerIdIdx: index("workerId_idx").on(workerPool.deviceHash),
  }),
);
