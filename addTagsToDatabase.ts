import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { env } from "~/env";
import { relations, schema } from "~/server/db/schema";
import tags from "~/server/db/tags.json";

interface Tree {
  [key: string]: Tree;
}

interface NestedSetItem {
  name: string;
  depth: number;
  lft: number;
  rgt: number;
}

function buildNestedSet(tags: Tree, offset = 0, depth = 0): NestedSetItem[] {
  const keys = Object.keys(tags);
  const result: NestedSetItem[] = [];

  for (const name of keys) {
    const lft = result.length > 0 ? result[result.length - 1]!.rgt + 1 : offset;
    const children = buildNestedSet(tags[name]!, lft + 1, depth + 1);

    result.push(...children, {
      name,
      depth,
      lft,
      rgt: lft + children.length * 2 + 1,
    });
  }

  return result;
}

const db = drizzle({
  client: createPool({
    host: env.MYSQL_HOST,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    port: env.MYSQL_PORT,
    database: env.MYSQL_DATABASE,
  }),
  schema,
  relations,
  mode: "default",
});

await db
  .insert(schema.tags)
  .values(buildNestedSet(tags))
  .onDuplicateKeyUpdate({
    set: {
      id: sql`id`,
      name: sql`name`,
      lft: sql`values(${schema.tags.lft})`,
      rgt: sql`values(${schema.tags.rgt})`,
      depth: sql`values(${schema.tags.depth})`,
    },
  })
  .catch(() => {
    console.warn("Database already seeded.");
  });

process.exit(0);
