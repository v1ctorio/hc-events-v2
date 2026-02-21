import { db, schema } from "@nuxthub/db" 
import { NewEventFormSchema } from "#shared/zod"
import { useSlackUser } from "../utils";
import { eq } from "drizzle-orm";
import { events } from "hub:db:schema";
export default defineEventHandler(async event =>{
    const {data} = await readValidatedBody(event, NewEventFormSchema.safeParse)

    if (!data) {
        throw createError({
            statusCode: 400,
            statusMessage: "invalid body"
        })
    }
    const user = await useSlackUser(event) 
    const scheduledStartTime = new Date(data?.scheduledStartTime)

    const slug = [
        scheduledStartTime.getUTCFullYear(), scheduledStartTime.getUTCMonth,
        data.title.trim().toLowerCase().replace(/[^\x20-\x7E]/g, '').substring(0,15)
    ].join("-") 

    const existing = await db.query.events.findFirst({
        where: eq(events.Slug, slug),
        columns: { EventID: true }
    })
    if (existing) {
        throw createError({ statusCode: 409, statusMessage:"slug conflict"})
    }
    //TODO: support ama creation. also update zod schema 
    const [insertedEvent] = await db.insert(schema.events).values({
        Title: data.title,
        Description: data.description,
        ScheduledStartTime: scheduledStartTime,
        LeaderSlackId: data.leaderSlackId,
        Approved: false,
        EventLink: data.eventLink,
        Slug: slug,
    }).returning()

    if (!insertedEvent) {
        throw createError({statusCode:500, statusMessage: "error inserting the event"})
    }
    setResponseStatus(event, 201)
    //TODO: return the APIEvent
    return insertedEvent
})