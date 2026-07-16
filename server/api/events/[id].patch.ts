import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { EditEventSchema } from '#shared/zod'
import { requireEventOwnerOrAdmin, requireIdentity } from '~~/server/utils'
import type { NewEvent } from '~~/shared/types/events'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing event ID' })

    const caller = await requireIdentity(event)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const where = isUUID ? eq(schema.events.EventID, id) : eq(schema.events.Slug, id)
    const existing = await db.query.events.findFirst({ where })

    if (!existing) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    requireEventOwnerOrAdmin(caller, existing.LeaderSlackId)

    const { data, error } = await readValidatedBody(event, EditEventSchema.safeParse)
    if (error) throw createError({ statusCode: 400, statusMessage: 'Invalid event details' })

    const update: Partial<NewEvent> = {}
    if (data.title !== undefined) update.Title = data.title
    if (data.description !== undefined) update.Description = data.description || null
    if (data.scheduledStartTime !== undefined) update.ScheduledStartTime = new Date(data.scheduledStartTime)
    if (data.eventLink !== undefined) update.EventLink = data.eventLink
    if (data.estimatedDuration !== undefined) update.EstimatedDuration = data.estimatedDuration
    if (data.tags !== undefined) update.Tags = data.tags

    const [updated] = await db.update(schema.events).set(update).where(where).returning()
    return { event: updated }
})
