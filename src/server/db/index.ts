import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";
import { env } from "~/env";
import { relations } from "./schema";
import * as schema from "./schema/tables";

function getDB() {
  const globalForDb = globalThis as unknown as {
    pool: Pool | undefined;
  };

  const client =
    globalForDb.pool ??
    createPool({
      host: env.MYSQL_HOST,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      port: env.MYSQL_PORT,
      database: env.MYSQL_DATABASE,
    });

  const db = drizzle({ client, schema, relations, mode: "default" });

  if (env.NODE_ENV === "production") {
    return db;
  }

  globalForDb.pool = client;
  return db;
}

export const db = getDB();
