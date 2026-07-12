import { db, schema } from '@nuxthub/db'
import { and, eq } from 'drizzle-orm'
import { useSlackUser } from '~~/server/utils'

// DELETE /api/events/[id]/rsvp
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'missing event id' })

    const user = await useSlackUser(event)

    await db.delete(schema.rsvps).where(
        and(
            eq(schema.rsvps.EventID, id),
            eq(schema.rsvps.RSVPedSlackID, user.slack_id)
        )
    )

    return { ok: true }
})
