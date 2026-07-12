import { db, schema } from '@nuxthub/db'

export default defineTask({
  meta: {
    name: 'create-live',
    description: 'Create a 2h event starting right now for testing',
  },
  async run() {
    const now = new Date()
    const slug = `test-live-${now.toISOString().slice(0, 10)}-${Date.now()}`

    await db.insert(schema.events).values({
      Title: `Live Test Event – ${now.toLocaleDateString()}`,
      Slug: slug,
      Description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      ScheduledStartTime: now,
      EstimatedDuration: 120,
      LeaderSlackId: 'U040N4ESCEL',
      Approved: true,
      Tags: ['test'],
    })

    console.log(`Created live event: ${slug}`)
    return { result: 'success', slug }
  }
})
