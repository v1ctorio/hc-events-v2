import { db, schema } from '@nuxthub/db'

export default defineTask({
  meta: {
    name: 'nuke-events',
    description: 'Delete all events from the database',
  },
  async run() {
    await db.delete(schema.rsvps)
    await db.delete(schema.amas)
    await db.delete(schema.events)
    console.log('All events, RSVPs, and AMAs deleted.')
    return { result: 'success' }
  }
})
