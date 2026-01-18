import { db } from '../../db'
import { subscribe } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const result = await db.select().from(subscribe).where(eq(subscribe.id, id)).limit(1)
  if (result.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
  }

  return result[0]
})