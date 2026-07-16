import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { AdminEventActionSchema } from '#shared/zod'
import { requireAdmin } from '~~/server/utils'

const updates = {
    approve: { Approved: true, Cancelled: false },
    reject: { Approved: false, Cancelled: true },
    cancel: { Cancelled: true },
    restore: { Cancelled: false },
} as const

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing event ID' })

    const { data, error } = await readValidatedBody(event, AdminEventActionSchema.safeParse)
    if (error) throw createError({ statusCode: 400, statusMessage: 'Invalid action' })

    const [updated] = await db.update(schema.events)
        .set(updates[data.action])
        .where(eq(schema.events.EventID, id))
        .returning()

    if (!updated) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

    return { ok: true }
})
