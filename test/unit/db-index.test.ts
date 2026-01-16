import { describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'

describe('server/db/index.ts', () => {
  it('should create db with in-memory database in test environment', async () => {
    const { db } = await import('../../server/db/index')
    expect(db).toBeDefined()
    expect(db.$client.name).toBe(':memory:')
  })

  it('should execute a simple SQL query', async () => {
    const { db } = await import('../../server/db/index')
    const result = db.get(sql`SELECT 1 as test`)
    expect(result).toEqual({ test: 1 })
  })
})