import { db, schema } from '@nuxthub/db';
import { and, count, eq, or } from 'drizzle-orm';
import { generateGoogleCalendarLink } from '~~/server/utils';
import { APIEvent } from '~~/shared/types/events';
const { events } = schema;


export default defineEventHandler(async (event): Promise<APIEvent> => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'missing event ID or slug'
        });
    }

    const ev = await db.query.events.findFirst({
        where: and(
            or(
                eq(events.EventID, id),
                eq(events.Slug, id)
            ),
            eq(events.Approved, true)
        ),
        with: {
            ama: true
        }
    });
    if (!ev) {
        throw createError({
            statusCode: 400,
            message: "event not found"
        });
    }
    const _rsvpCount = await db.select({ count: count() }).from(schema.rsvps).where(eq(schema.rsvps.EventID, ev.EventID));
    const rsvpCount = _rsvpCount[0] ? _rsvpCount[0].count : 0;
    return {
        ...ev,

        leaderAvatar: `https://cachet.dunkirk.sh/users/${ev.LeaderSlackId}/r`,
        isAma: !!ev.ama,
        ama_info: ev.ama || undefined,
        googleCalendarLink: generateGoogleCalendarLink(ev),
        interestCount: rsvpCount,
    };
});