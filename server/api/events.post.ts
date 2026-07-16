import { db, schema } from "@nuxthub/db"
import { NewEventFormSchema } from "#shared/zod"
import { requireIdentity, toAPIEvent } from "../utils";
import { eq } from "drizzle-orm";

export default defineEventHandler(async event => {
    const { data } = await readValidatedBody(event, NewEventFormSchema.safeParse)

    if (!data) {
        throw createError({ statusCode: 400, statusMessage: "invalid body" })
    }

    const user = await requireIdentity(event)
    if (user.isApiKey && !data.leaderSlackId) {
        throw createError({ statusCode: 400, statusMessage: "leaderSlackId is required for API-key submissions" })
    }
    const scheduledStartTime = new Date(data.scheduledStartTime)
    if (scheduledStartTime <= new Date()) {
        throw createError({ statusCode: 400, statusMessage: "scheduledStartTime must be in the future" })
    }

    const slug = [
        scheduledStartTime.getUTCFullYear(),
        scheduledStartTime.getUTCMonth() + 1, // fix: was missing ()
        data.title.trim().toLowerCase().replace(/[^\x20-\x7E]/g, '').substring(0, 15).replace(/\s+/g, '-')
    ].join("-")

    const existing = await db.query.events.findFirst({
        where: eq(schema.events.Slug, slug),
        columns: { EventID: true }
    })
    if (existing) {
        throw createError({ statusCode: 409, statusMessage: "slug conflict" })
    }

    //TODO: support ama creation (update zod schema + insert into amas table)
    const [insertedEvent] = await db.insert(schema.events).values({
        Title: data.title,
        Description: data.description,
        ScheduledStartTime: scheduledStartTime,
        LeaderSlackId: user.isApiKey ? data.leaderSlackId! : user.slack_id,
        EventLink: data.eventLink,
        EstimatedDuration: data.estimatedDuration,
        Tags: data.tags,
        Approved: false,
        Slug: slug,
    }).returning()

    if (!insertedEvent) {
        throw createError({ statusCode: 500, statusMessage: "error inserting the event" })
    }

    setResponseStatus(event, 201)
    return toAPIEvent(insertedEvent, null, 0)
})
