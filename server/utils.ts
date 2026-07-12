import type { Event, Ama, APIEvent } from '~~/shared/types/events'
import type { H3Event, EventHandlerRequest } from 'h3'

export function toAPIEvent(ev: Event, ama: Ama | null | undefined, interestCount: number | undefined): APIEvent {
    return {
        ...ev,
        leaderAvatar: `https://cachet.dunkirk.sh/users/${ev.LeaderSlackId}/r`,
        isAma: !!ama,
        ama_info: ama ?? undefined,
        googleCalendarLink: generateGoogleCalendarLink(ev),
        interestCount,
    }
}

export function generateGoogleCalendarLink(ev: Event): string {
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const start = ev.ScheduledStartTime
    const end = ev.EstimatedDuration
        ? new Date(start.getTime() + ev.EstimatedDuration * 60_000)
        : new Date(start.getTime() + 60 * 60_000) // default 1h

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: ev.Title,
        dates: `${fmt(start)}/${fmt(end)}`,
        details: ev.Description ?? '',
        location: ev.EventLink,
    })
    return `https://calendar.google.com/calendar/render?${params}`
}

export async function useSlackUser(event: H3Event<EventHandlerRequest>) {
    const session = await requireUserSession(event)
    if (!((session.user as any).slack_id)) {
        throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }
    return session.user as { slack_id: string, email: string }
}