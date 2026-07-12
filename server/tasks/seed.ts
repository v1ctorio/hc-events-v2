import { db, schema } from '@nuxthub/db'

export default defineTask({
  meta: {
    name: 'seed',
    description: 'Seed the database with boilerplate events',
  },
  async run() {
    const { events } = schema
    console.log('Seeding database with events...')

    // Helper to generate a future date
    const inDays = (days: number) => {
      const d = new Date()
      d.setDate(d.getDate() + days)
      return d
    }
    
    // Helper to generate a past date
    const daysAgo = (days: number) => {
      const d = new Date()
      d.setDate(d.getDate() - days)
      return d
    }

    const boilerplateEvents = [
      {
        Title: 'Introduction to 3D Printing',
        Slug: '2026-07-intro-to-3d-printing',
        Description: 'Join us for a crash course on how to use the new 3D printers! We will cover everything from finding models to slicing and printing.',
        ScheduledStartTime: inDays(2),
        EstimatedDuration: 60,
        LeaderSlackId: 'U040N4ESCEL',
        Location: 'https://hackclub.zoom.us/j/123456789',
        Tags: ['hardware', '3d-printing', 'workshop'],
        Approved: true,
      },
      {
        Title: 'Weekly Show & Tell',
        Slug: '2026-07-weekly-show-tell',
        Description: 'Come show off what you have been working on this week! Everyone gets 5 minutes to demo their project.',
        ScheduledStartTime: inDays(5),
        EstimatedDuration: 90,
        LeaderSlackId: 'U123ABCDEF',
        Location: 'https://hackclub.zoom.us/j/987654321',
        Tags: ['show-and-tell', 'community'],
        Approved: true,
      },
      {
        Title: 'Game Dev AMA with Notch',
        Slug: '2026-06-game-dev-ama',
        Description: 'We are hosting an AMA with the creator of Minecraft! Bring your best questions.',
        ScheduledStartTime: daysAgo(10),
        EstimatedDuration: 60,
        LeaderSlackId: 'U040N4ESCEL',
        Location: 'Hack Club Slack',
        YouTubeURL: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        Tags: ['ama', 'game-dev'],
        Approved: true,
      },
      {
        Title: 'Late Night Code & Chill',
        Slug: '2026-07-code-and-chill',
        Description: 'No agenda, just hanging out and coding together while listening to lo-fi beats.',
        ScheduledStartTime: inDays(30),
        EstimatedDuration: 120,
        LeaderSlackId: 'U999XYZAB',
        Location: 'Hack Club Slack Huddle',
        Tags: ['chill', 'coding'],
        Approved: true,
      },
      {
        Title: 'Past: Web Performance Deep Dive',
        Slug: '2026-06-web-performance',
        Description: 'Learn how to make your websites load instantly. We will look at caching, bundle splitting, and more.',
        ScheduledStartTime: daysAgo(25),
        EstimatedDuration: 60,
        LeaderSlackId: 'U888QWERTY',
        Location: 'Zoom',
        YouTubeURL: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        Tags: ['web', 'performance'],
        Approved: true,
      },{
        Title: 'Event now',
        Slug: '2026-06-web-performance',
        Description: 'Hello chat',
        ScheduledStartTime: new Date(),
        EstimatedDuration: 60,
        LeaderSlackId: 'U888QWERTY',
        Location: 'gogle',
        YouTubeURL: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        Tags: ['web', 'performance'],
        Approved: true,
      }
    ]

    for (const ev of boilerplateEvents) {
      await db.insert(events).values(ev).onConflictDoUpdate({
        target: events.Slug,
        set: ev
      })
    }

    console.log('Successfully seeded 5 boilerplate events!')
    return { result: 'success' }
  }
})
