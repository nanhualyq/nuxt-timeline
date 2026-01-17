import { afterEach, beforeAll, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../server/db/schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const sqlite = new Database(":memory:");
const db = drizzle(sqlite, { schema });

beforeAll(async () => {
  migrate(db, { migrationsFolder: "./server/db/migrations" });
});

afterEach(async () => {
  const tables = Object.keys(schema);
  for (const table of tables) {
    await db.delete(schema[table as keyof typeof schema]).run();
  }
});

vi.mock("../server/db/index", () => {
  return { db };
});
