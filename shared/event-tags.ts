export const EVENT_TAGS = ['stardance', 'ama', 'workshop', 'social'] as const

export type EventTag = typeof EVENT_TAGS[number]

export const isEventTag = (tag: string): tag is EventTag => EVENT_TAGS.includes(tag as EventTag)
