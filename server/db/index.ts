import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const isTest = process.env.NODE_ENV === 'test' || process.env.TEST === 'true'
const sqlite = new Database(isTest ? ':memory:' : './server/db/database.sqlite')
export const db = drizzle(sqlite, { schema })