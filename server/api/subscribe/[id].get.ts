import { db } from '../../db'
import { subscribe } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  }

  const result = await db.select().from(subscribe).where(eq(subscribe.id, id)).limit(1)
  if (result.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Subscription not found' })
  }

  return result[0]
})