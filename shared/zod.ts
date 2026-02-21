import * as schema  from "@nuxthub/db/schema"
import { z } from 'zod'
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
import { createInsertSchema } from 'drizzle-zod'

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be at most 100 characters')
  .regex(slugPattern, 'Slug must be lowercase alphanumeric with hyphens only')

export const NewEventFormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  scheduledStartTime: z.iso.datetime(),
  leaderSlackId: z.string(),
  eventLink: z.httpUrl().optional().default("https://app.slack.com/huddle/T0266FRGM/C01D7AHKMPF")
})