import { db, schema } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { requireEventOwnerOrAdmin, requireIdentity, toAPIEvent } from '~~/server/utils'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing event ID' })

    const caller = await requireIdentity(event)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const row = await db.query.events.findFirst({
        where: isUUID ? eq(schema.events.EventID, id) : eq(schema.events.Slug, id),
        with: { ama: true },
    })

    if (!row) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    requireEventOwnerOrAdmin(caller, row.LeaderSlackId)

    return toAPIEvent(row, row.ama, undefined)
})
