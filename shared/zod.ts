import { z } from 'zod'
import { EVENT_TAGS } from './event-tags'
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be at most 100 characters')
  .regex(slugPattern, 'Slug must be lowercase alphanumeric with hyphens only')

export const NewEventFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledStartTime: z.iso.datetime(),
  leaderSlackId: z.string().min(1).optional(),
  eventLink: z.url().optional().default("https://app.slack.com/huddle/T0266FRGM/C01D7AHKMPF"),
  estimatedDuration: z.number().int().positive().optional(), // minutes
  tags: z.array(z.enum(EVENT_TAGS)).optional().default([]),
})

export const AdminEventActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'cancel', 'restore']),
})

export const EditEventSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(4000).optional(),
  scheduledStartTime: z.iso.datetime().optional(),
  eventLink: z.url().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  tags: z.array(z.enum(EVENT_TAGS)).optional(),
}).refine(body => Object.keys(body).length > 0, 'At least one field is required')
