import { db, schema } from '@nuxthub/db'
import fs from 'node:fs'
import path from 'node:path'

export default defineTask({
  meta: {
    name: 'import-legacy',
    description: 'Import events from upcomingevents.json (old API format)',
  },
  async run() {
    const { events } = schema

    const filePath = path.resolve(process.cwd(), 'upcomingevents.json')
    if (!fs.existsSync(filePath)) {
      console.error('upcomingevents.json not found at', filePath)
      return { result: 'error', message: 'File not found' }
    }

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const legacyEvents: any[] = Array.isArray(raw) ? raw : []
    let imported = 0

    for (const ev of legacyEvents) {
      const startDate = new Date(ev.start)
      const endDate = new Date(ev.end)
      const durationMs = endDate.getTime() - startDate.getTime()
      const durationMinutes = Math.max(1, Math.round(durationMs / 60_000))

      // Extract location from the Google Calendar link's `location` param
      let location = 'https://app.slack.com/huddle/T0266FRGM/C01D7AHKMPF'
      if (ev.cal) {
        try {
          const url = new URL(ev.cal)
          const loc = url.searchParams.get('location')
          if (loc) location = loc
        } catch {}
      }

      await db.insert(events).values({
        EventID: ev.id,
        Title: ev.title,
        Description: ev.desc?.trim() || null,
        ScheduledStartTime: startDate,
        EstimatedDuration: durationMinutes,
        LeaderSlackId: ev.leaderSlackId,
        Approved: ev.approved ?? true,
        EventLink: location,
        YouTubeURL: ev.youtube || null,
        Tags: ev.tags ?? [],
        Slug: ev.slug,
      }).onConflictDoUpdate({
        target: events.Slug,
        set: {
          Title: ev.title,
          Description: ev.desc?.trim() || null,
          ScheduledStartTime: startDate,
          EstimatedDuration: durationMinutes,
          LeaderSlackId: ev.leaderSlackId,
          Approved: ev.approved ?? true,
          EventLink: location,
          YouTubeURL: ev.youtube || null,
          Tags: ev.tags ?? [],
        }
      })

      imported++
      console.log(`  ✓ ${ev.title}`)
    }

    console.log(`Imported ${imported} events from legacy JSON.`)
    return { result: 'success', imported }
  }
})
