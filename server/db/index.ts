import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const isDev = import.meta.env.NODE_ENV === "development";

const sqlite = new Database(process.env.DATABASE_URL, {
  verbose: isDev ? console.log : undefined,
});
export const db = drizzle(sqlite, { schema });
