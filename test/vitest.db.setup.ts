import { beforeAll, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../server/db/schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const sqlite = new Database(":memory:");
const db = drizzle(sqlite, { schema });

beforeAll(async () => {
  migrate(db, { migrationsFolder: "./server/db/migrations" });
});

vi.mock("../server/db/index", () => {
  return { db };
});
