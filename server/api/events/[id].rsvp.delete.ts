import { db, schema } from '@nuxthub/db'
import { and, eq } from 'drizzle-orm'
import { requireIdentity, isAdmin } from '~~/server/utils'

// DELETE /api/events/[id]/rsvp
// Requires identity (session or API key). You can only un-RSVP yourself; admins/API key can un-RSVP anyone.
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'missing event id' })

    const caller = await requireIdentity(event)

    // API key or admin can pass ?slackId=... to un-RSVP someone else
    const targetSlackId = (caller.isApiKey || isAdmin(caller.slack_id))
        ? (getQuery(event).slackId as string | undefined) ?? caller.slack_id
        : caller.slack_id

    await db.delete(schema.rsvps).where(
        and(
            eq(schema.rsvps.EventID, id),
            eq(schema.rsvps.RSVPedSlackID, targetSlackId)
        )
    )

    return { ok: true }
})
