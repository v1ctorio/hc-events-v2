import { sql, relations } from 'drizzle-orm';
import { boolean, interval, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const events = pgTable('events', {
    EventID: uuid().primaryKey(),
    Title: text().notNull(),
    Description: text(),
    ScheduledStartTime: timestamp({withTimezone: true}).notNull(),
    //TODO: add estimated duration column and infer ScheduledEndTime EstimatedDuration: interval({})
    LeaderSlackId: text().notNull().default("U040N4ESCEL"),
    
    Approved: boolean().notNull().default(false),
    EventLink: text().notNull().default("https://app.slack.com/huddle/T0266FRGM/C01D7AHKMPF"),
    Cancelled: boolean().notNull().default(false),
    HasStarted: boolean().notNull().default(false),
    HasFinished: boolean().notNull().default(false),

    RSVPMessage: text()
})


export const rsvps = pgTable('rsvps', {
    EventID: uuid('event_id')
        .primaryKey()
        .references(() => events.EventID),
    SentOneDayReminder: boolean().notNull().default(false),
    SentThreeHoursReminder: boolean().notNull().default(false),
    SentStartingReminder: boolean().notNull().default(false),
    RSVPedSlackID: text().array().notNull().default(sql`'{}'::text[]`),
})

export const amas = pgTable('amas', {
    EventID: uuid('event_id')
        .primaryKey()
        .references(() => events.EventID),
    AMAName: text().notNull(),
    AMACompany: text(),
    AMATitle: text().notNull(),
    //TODO: AMALink exists in airtable but i'm not sure of what it does
    AMAAvatar: text()
})

export const eventsRelations = relations(events, ({ one }) => ({
    rsvp: one(rsvps, {
        fields: [events.EventID],
        references: [rsvps.EventID],
    }),
    ama: one(amas, {
        fields: [events.EventID],
        references: [amas.EventID],
    }),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
    event: one(events, {
        fields: [rsvps.EventID],
        references: [events.EventID],
    }),
}));

export const amasRelations = relations(amas, ({ one }) => ({
    event: one(events, {
        fields: [amas.EventID],
        references: [events.EventID],
    }),
}));