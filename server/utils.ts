import { Event } from "~~/shared/types/events";
import type { H3Event } from "#imports";
export function generateGoogleCalendarLink(event: Event): string {
    //TODO
    return `https://nosesisaid.com`;
}

export async function useSlackUser(event: H3Event<EventHandlerRequest>) {
    const session = await requireUserSession(event)
    if (!((session.user as any).slack_id)) {
        throw createError({statusCode: 401, statusMessage: "Authentication required"})
    }
    return session.user as { slack_id: string, email: string }
}