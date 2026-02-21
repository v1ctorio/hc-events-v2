import { db, schema } from '@nuxthub/db';
import { and, count, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { APIEvent } from '~~/shared/types/events';
import { generateGoogleCalendarLink } from '../utils';
const { events } = schema;
export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const page = Math.max(1, Number(query.page || 1))
    const limit = Math.min(200, Number(query.limit || 30))
    const offset = (page - 1) * limit

    const queryConditions = [
        eq(events.Approved, true),
        eq(events.Cancelled, false)
    ]

    if (query.year) {
        const year = Number(query.year)
        const month = query.month ? Number(query.month) : null

        if (month) {
            const start = new Date(year, month -1, 1)
            const end = new Date(year, month, 1)
            queryConditions.push(gte(events.ScheduledStartTime, start))
            queryConditions.push(lt(events.ScheduledStartTime, end))
        } else {
            const start = new Date(year, 0, 1)
            const end = new Date(year + 1,0,1)
            queryConditions.push(gte(events.ScheduledStartTime, start))
            queryConditions.push(lt(events.ScheduledStartTime, end))
        }
    }

    const where = and(...queryConditions)
    const rawEvReq = await db.query.events.findMany({
        where,
        with: {
            ama: true
        },
        orderBy: [desc(events.ScheduledStartTime)],
        limit: limit,
        offset: (page -1) * limit
    })

    const totalCount =(await db.select({ count: count() })
        .from(events)
        .where(where)
    )[0]?.count
    const response: { events: APIEvent[], pagination: { page: number, limit: number, total: number, totalPages: number } } = {
        events: rawEvReq.map(ev => ({
            ...ev,
            leaderAvatar: `https://cachet.dunkirk.sh/users/${ev.LeaderSlackId}/r`,
            isAma: !!ev.ama,
            ama_info: ev.ama || undefined,
            googleCalendarLink: generateGoogleCalendarLink(ev),
            interestCount: undefined,
        })),
        pagination: {
            page,
            limit,
            total: totalCount || 0,
            totalPages: totalCount ? Math.ceil(totalCount / limit) : 0

        }
    }
    return response
})