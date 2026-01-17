import { db } from '../../db'
import { subscribe } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, link, downloadCode, contentCode } = body

  if (!name || !link || !downloadCode || !contentCode) {
    throw createError({ statusCode: 400, statusMessage: 'All fields are required' })
  }

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const updatedAt = createdAt

  await db.insert(subscribe).values({
    id,
    name,
    link,
    downloadCode,
    contentCode,
    createdAt,
    updatedAt
  })

  return { id }
})