import { db, schema } from '@nuxthub/db';
import { and, arrayOverlaps, count, desc, eq, gte, lt } from 'drizzle-orm';
import { toAPIEvent } from '../utils';
import type { APIEvent } from '~~/shared/types/events';
import { isEventTag } from '~~/shared/event-tags';
const { events } = schema;

function integerQuery(value: unknown, name: string): number | undefined {
    if (value === undefined) return undefined
    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw createError({ statusCode: 400, statusMessage: `${name} must be a positive integer` })
    }
    return parsed
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const page = integerQuery(query.page, 'page') ?? 1
    const limit = Math.min(200, integerQuery(query.limit, 'limit') ?? 30)

    const queryConditions = [
        eq(events.Approved, true),
        eq(events.Cancelled, false)
    ]

    if (query.tags) {
        const tags = String(query.tags).split(',').map(t => t.trim()).filter(Boolean)
        if (tags.some(tag => !isEventTag(tag))) {
            throw createError({ statusCode: 400, statusMessage: 'unknown event tag' })
        }
        if (tags.length) queryConditions.push(arrayOverlaps(events.Tags, tags))
    }

    if (query.year) {
        const year = integerQuery(query.year, 'year')!
        const month = integerQuery(query.month, 'month')
        if (year > 9999) throw createError({ statusCode: 400, statusMessage: 'year must be 9999 or earlier' })
        if (month && month > 12) throw createError({ statusCode: 400, statusMessage: 'month must be between 1 and 12' })

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
    } else if (query.month) {
        throw createError({ statusCode: 400, statusMessage: 'month requires year' })
    }

    // upcoming=true → only events from the start of the current month onwards
    if (query.upcoming === 'true' || query.upcoming === '1') {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        queryConditions.push(gte(events.ScheduledStartTime, monthStart))
    }

    if (query.past === 'true' || query.past === '1') {
        queryConditions.push(lt(events.ScheduledStartTime, new Date()))
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
