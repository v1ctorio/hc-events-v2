import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core'

export const events = pgTable('events', {
    EventID: uuid().primaryKey().defaultRandom(),
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

    RSVPMessage: text(),
    Slug: text().notNull(),
}, (table) => ([
    uniqueIndex('events_slug_unique').on(table.Slug),
]))


export const rsvps = pgTable('rsvps', {
    RSVPedSlackID: text().notNull(),
    EventID: uuid('event_id')
        .references(() => events.EventID, { onDelete: 'cascade' }),
    SentOneDayReminder: boolean().notNull().default(false),
    SentThreeHoursReminder: boolean().notNull().default(false),
    SentStartingReminder: boolean().notNull().default(false),
    EmailNotificationEnabled: boolean().notNull().default(false),
}, t => [
    primaryKey({ columns: [t.EventID, t.RSVPedSlackID] }),
])

export const amas = pgTable('amas', {
    EventID: uuid('event_id')
        .primaryKey()
        .references(() => events.EventID, { onDelete: 'cascade' }),
    AMAName: text().notNull(),
    AMACompany: text(),
    AMATitle: text().notNull(),
    //TODO: AMALink exists in airtable but i'm not sure of what it does
    AMAAvatar: text()
})

export const eventsRelations = relations(events, ({ one, many }) => ({
    rsvps: many(rsvps),
    ama: one(amas),
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