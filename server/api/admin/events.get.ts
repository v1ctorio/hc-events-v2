import { db, schema } from '@nuxthub/db'
import { asc, desc } from 'drizzle-orm'
import { requireAdmin, toAPIEvent } from '~~/server/utils'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)

    const rows = await db.query.events.findMany({
        with: { ama: true },
        orderBy: [
            asc(schema.events.Approved),
            asc(schema.events.Cancelled),
            desc(schema.events.ScheduledStartTime),
        ],
        // ponytail: the admin screen shows the latest 200 events; add pagination when this becomes limiting
        limit: 200,
    })

    return { events: rows.map(row => toAPIEvent(row, row.ama, undefined)) }
})
