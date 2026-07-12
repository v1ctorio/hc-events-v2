import { db, schema } from '@nuxthub/db'
import { and, eq } from 'drizzle-orm'

// POST /api/events/[id]/rsvp
// Public — no account needed. In the future this will accept an email body for non-Slack users.
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id) throw createError({ statusCode: 400, statusMessage: 'missing event id' })

    // ponytail: currently ties RSVP to Slack session if present, else no-op identity.
    // Upgrade path → accept { email } body and create a guest RSVP row when no session.
    const session = await getUserSession(event)
    const slackId = (session?.user as any)?.slack_id as string | undefined

    if (!slackId) {
        // TODO: handle email-based RSVP for non-Slack users
        throw createError({ statusCode: 501, statusMessage: 'Email RSVP not yet implemented. Log in with Slack to RSVP.' })
    }

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
        .values({ EventID: ev.EventID, RSVPedSlackID: slackId })
        .onConflictDoNothing()

    setResponseStatus(event, 201)
    return { ok: true }
})
