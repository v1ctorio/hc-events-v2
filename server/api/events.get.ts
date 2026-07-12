import { db, schema } from '@nuxthub/db';
import { and, arrayOverlaps, count, desc, eq, gte, lt } from 'drizzle-orm';
import { toAPIEvent } from '../utils';
import type { APIEvent } from '~~/shared/types/events';
const { events } = schema;

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const page = Math.max(1, Number(query.page || 1))
    const limit = Math.min(200, Number(query.limit || 30))

    const queryConditions = [
        eq(events.Approved, true),
        eq(events.Cancelled, false)
    ]

    if (query.tags) {
        const tags = String(query.tags).split(',').map(t => t.trim()).filter(Boolean)
        if (tags.length) queryConditions.push(arrayOverlaps(events.Tags, tags))
    }

    if (query.year) {
        const year = Number(query.year)
        const month = query.month ? Number(query.month) : null

        if (month) {
            const start = new Date(year, month - 1, 1)
            const end = new Date(year, month, 1)
            queryConditions.push(gte(events.ScheduledStartTime, start))
            queryConditions.push(lt(events.ScheduledStartTime, end))
        } else {
            const start = new Date(year, 0, 1)
            const end = new Date(year + 1, 0, 1)
            queryConditions.push(gte(events.ScheduledStartTime, start))
            queryConditions.push(lt(events.ScheduledStartTime, end))
        }
    }

    const where = and(...queryConditions)
    const [rawEvents, totalCountRow] = await Promise.all([
        db.query.events.findMany({
            where,
            with: { ama: true },
            orderBy: [desc(events.ScheduledStartTime)],
            limit,
            offset: (page - 1) * limit,
        }),
        db.select({ count: count() }).from(events).where(where)
    ])

    const totalCount = totalCountRow[0]?.count ?? 0
    const response: { events: APIEvent[], pagination: { page: number, limit: number, total: number, totalPages: number } } = {
        // ponytail: interestCount omitted on list for perf (would require N extra queries); fetch per-event on detail page
        events: rawEvents.map(ev => toAPIEvent(ev, ev.ama, undefined)),
        pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
    return response
})