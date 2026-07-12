import { db, schema } from '@nuxthub/db'
import { and, eq } from 'drizzle-orm'
import { useSlackUser } from '~~/server/utils'

// POST /api/events/[id]/rsvp
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'missing event id' })

    const user = await useSlackUser(event)

    const ev = await db.query.events.findFirst({
        where: and(
            eq(schema.events.EventID, id),
            eq(schema.events.Approved, true),
            eq(schema.events.Cancelled, false)
        ),
        columns: { EventID: true }
    })
    if (!ev) throw createError({ statusCode: 404, statusMessage: 'event not found' })

    await db.insert(schema.rsvps)
        .values({ EventID: ev.EventID, RSVPedSlackID: user.slack_id })
        .onConflictDoNothing()

    setResponseStatus(event, 201)
    return { ok: true }
})
