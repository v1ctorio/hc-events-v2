import { events, amas, rsvps } from '@nuxthub/db/schema'


export type Event = typeof events.$inferSelect
export type Ama = typeof amas.$inferSelect
export type Rsvps = typeof rsvps.$inferSelect

export type NewEvent = typeof events.$inferInsert
export type NewAma = typeof amas.$inferInsert
export type NewRsvps = typeof rsvps.$inferInsert


// Use camelCase for runtime properties, PascalCase for database properties
export interface APIEvent extends Event {
    leaderAvatar: string
    
    isAma: boolean
    ama_info?: Ama
    googleCalendarLink: string
    interestCount?: number 
}

