import type { Event, Ama, APIEvent } from '~~/shared/types/events'
import type { H3Event, EventHandlerRequest } from 'h3'

// ponytail: admin list is hardcoded per-process; upgrade path → move to a DB table when needed
function getConfig() {
    const cfg = useRuntimeConfig()
    return {
        apiSecret: cfg.hcApiSecret as string,
        adminIds: new Set((cfg.hcAdminSlackIds as string).split(',').map((s: string) => s.trim()).filter(Boolean))
    }
}

export function isAdmin(slackId: string): boolean {
    return getConfig().adminIds.has(slackId)
}

export async function requireAdmin(event: H3Event<EventHandlerRequest>) {
    const caller = await requireIdentity(event)
    if (!caller.isApiKey && !isAdmin(caller.slack_id)) {
        throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }
    return caller
}

/**
 * Resolves the caller's identity from either:
 *   1. Authorization: Bearer <HC_API_SECRET>  → treated as a super-admin API caller
 *   2. nuxt-auth-utils session cookie          → Slack-authenticated user
 *
 * Returns { slack_id, email, isApiKey } or throws 401.
 */
export async function requireIdentity(event: H3Event<EventHandlerRequest>): Promise<{
    slack_id: string
    email: string
    isApiKey: boolean
}> {
    const { apiSecret } = getConfig()
    const authHeader = getHeader(event, 'authorization')

    if (apiSecret && authHeader === `Bearer ${apiSecret}`) {
        // API key caller — treated as admin, no Slack ID
        return { slack_id: '__api__', email: '__api__', isApiKey: true }
    }

    const session = await getUserSession(event)
    const slack_id = (session?.user as any)?.slack_id
    if (!slack_id) {
        throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }
    return { slack_id, email: (session.user as any).email ?? '', isApiKey: false }
}

/**
 * Authorises a write to an event. Passes if the caller:
 *   - used the API key, OR
 *   - is in the admin list, OR
 *   - is the event owner (LeaderSlackId)
 */
export function requireEventOwnerOrAdmin(
    caller: { slack_id: string; isApiKey: boolean },
    eventLeaderSlackId: string
) {
    if (caller.isApiKey) return
    if (isAdmin(caller.slack_id)) return
    if (caller.slack_id === eventLeaderSlackId) return
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
}

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
