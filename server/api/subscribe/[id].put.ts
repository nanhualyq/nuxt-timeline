import { db } from '../../db'
import { subscribe } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  }

  const body = await readBody(event)
  const { name, link, downloadCode, contentCode } = body

  if (!name || !link || !downloadCode || !contentCode) {
    throw createError({ statusCode: 400, statusMessage: 'All fields are required' })
  }

  const updatedAt = new Date().toISOString()

  await db.update(subscribe).set({
    name,
    link,
    downloadCode,
    contentCode,
    updatedAt
  }).where(eq(subscribe.id, id))

  return { success: true }
})