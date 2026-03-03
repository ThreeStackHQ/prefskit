import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import * as relations from "./relations";

type Schema = typeof schema & typeof relations;

// Use a singleton pattern to avoid multiple connections in dev (Next.js HMR)
const globalForDb = globalThis as unknown as {
  _pkConn: postgres.Sql | undefined;
  _pkDb: PostgresJsDatabase<Schema> | undefined;
};

function getDb(): PostgresJsDatabase<Schema> {
  if (globalForDb._pkDb) return globalForDb._pkDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const sql =
    globalForDb._pkConn ??
    postgres(connectionString, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb._pkConn = sql;
  }

  const dbInstance = drizzle(sql, { schema: { ...schema, ...relations } });

  if (process.env.NODE_ENV !== "production") {
    globalForDb._pkDb = dbInstance;
  }

  return dbInstance;
}

// Lazy proxy — only connects to DB when a method is actually called.
// This prevents build-time failures when DATABASE_URL is not set.
export const db = new Proxy({} as PostgresJsDatabase<Schema>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type Db = typeof db;
