<script setup lang="ts">
import type { APIEvent } from '~~/shared/types/events'

const route = useRoute()
const slug = route.params.slug as string

const { data: event, status } = await useFetch<APIEvent>(`/api/events/${slug}`)

if (!event.value && status.value !== 'pending') {
  throw createError({ statusCode: 404, message: 'Event not found' })
}

const { loggedIn, user } = useUserSession()

const leaderSlackId = computed(() => event.value?.LeaderSlackId ?? null)
const { displayName: leaderName, avatarUrl: leaderAvatar } = useCachetUser(leaderSlackId.value)

const startDate = computed(() => event.value ? new Date(event.value.ScheduledStartTime) : new Date())
const endDate = computed(() => {
  if (!event.value) return new Date()
  const dur = event.value.EstimatedDuration ?? 60
  return new Date(startDate.value.getTime() + dur * 60_000)
})
const isPast = computed(() => startDate.value < new Date())

const fmtFullDate = (d: Date) => d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
const fmtTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

// RSVP state
const hasRsvped = ref(false)
const rsvpLoading = ref(false)

async function toggleRsvp() {
  if (!event.value || !loggedIn.value) return
  rsvpLoading.value = true
  try {
    if (hasRsvped.value) {
      await $fetch(`/api/events/${event.value.EventID}/rsvp`, { method: 'DELETE' })
      hasRsvped.value = false
    } else {
      await $fetch(`/api/events/${event.value.EventID}/rsvp`, { method: 'POST' })
      hasRsvped.value = true
    }
  } catch (e) {
    console.error('RSVP error:', e)
  } finally {
    rsvpLoading.value = false
  }
}

useSeoMeta({
  title: event.value?.Title ?? 'Event',
  description: event.value?.Description ?? 'A Hack Club event.',
  ogTitle: event.value?.Title,
  ogDescription: `${event.value?.isAma ? 'An AMA' : 'An event'} on ${fmtFullDate(startDate.value)} at Hack Club.`,
})
</script>

<template>
  <div v-if="event">
    <!-- Header banner -->
    <header class="event-header">
      <div class="container event-header-content">
        <h1 class="title">{{ event.Title }}</h1>
        <div class="event-host">
          <span>{{ event.isAma ? 'An AMA hosted by' : 'An event by' }}</span>
          <img :src="leaderAvatar" :alt="leaderName" class="host-avatar" />
          <span>{{ leaderName }}</span>
        </div>
      </div>
    </header>

    <div class="container event-layout">
      <!-- Date sidebar -->
      <aside class="date-aside">
        <div class="date-card" :class="{ past: isPast }">
          <div class="date-month">{{ startDate.toLocaleDateString(undefined, { month: 'short' }) }}</div>
          <div class="date-day">{{ startDate.getDate() }}</div>
        </div>
        <img
          v-if="event.ama_info?.AMAAvatar"
          :src="event.ama_info.AMAAvatar"
          alt="AMA guest"
          class="ama-avatar"
        />
      </aside>

      <!-- Main content -->
      <article class="event-content">
        <p class="caption">{{ fmtFullDate(startDate) }}</p>
        <p class="subtitle event-time">
          {{ fmtTime(startDate) }} – {{ fmtTime(endDate) }}
        </p>

        <div v-if="event.Tags?.length" class="event-tags">
          <span v-for="tag in event.Tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div v-if="event.Description" class="event-description">
          <p>{{ event.Description }}</p>
        </div>

        <!-- Calendar buttons -->
        <div v-if="!isPast" class="action-buttons">
          <UButton
            :to="event.googleCalendarLink"
            target="_blank"
            icon="i-lucide-calendar"
            color="primary"
          >
            Add to Google Calendar
          </UButton>
        </div>

        <!-- RSVP -->
        <div class="rsvp-section">
          <template v-if="loggedIn">
            <UButton
              :loading="rsvpLoading"
              :color="hasRsvped ? 'neutral' : 'primary'"
              :variant="hasRsvped ? 'outline' : 'solid'"
              :icon="hasRsvped ? 'i-lucide-check' : 'i-lucide-hand-metal'"
              size="lg"
              @click="toggleRsvp"
            >
              {{ hasRsvped ? "You're RSVP'd!" : 'RSVP' }}
            </UButton>
          </template>
          <template v-else>
            <a href="/auth/hackclub">
              <UButton icon="i-lucide-log-in" color="primary" size="lg">
                Log in to RSVP
              </UButton>
            </a>
          </template>
          <p v-if="event.interestCount" class="caption rsvp-count">
            {{ event.interestCount }} {{ event.interestCount === 1 ? 'person' : 'people' }} interested
          </p>
        </div>

        <!-- YouTube embed for past AMAs -->
        <div v-if="event.YouTubeURL" class="youtube-section">
          <h2>Watch the recording</h2>
          <div class="embed-container">
            <iframe
              :src="event.YouTubeURL.replace('watch?v=', 'embed/')"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.event-header {
  background: var(--sheet);
  text-align: center;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-4);
}
.event-header-content h1 {
  margin-bottom: var(--spacing-2);
}
.event-host {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  color: var(--muted);
  font-size: var(--font-2);
}
.host-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}
.event-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  padding-bottom: var(--spacing-5);
}
@media (min-width: 48em) {
  .event-layout {
    grid-template-columns: auto 1fr;
    gap: var(--spacing-4);
  }
}
.date-aside {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
}
.date-card {
  border-radius: var(--radii-ultra);
  font-weight: bold;
  text-align: center;
  border: 4px solid var(--primary);
  width: 96px;
  overflow: hidden;
}
@media (min-width: 48em) {
  .date-card { width: 128px; }
}
.date-card.past {
  border-color: var(--muted);
}
.date-month {
  background: var(--primary);
  color: var(--white);
  font-size: var(--font-2);
  padding: var(--spacing-1) 0;
}
.date-card.past .date-month {
  background: var(--muted);
}
.date-day {
  font-size: var(--font-6);
  line-height: var(--line-height-subheading);
  padding: var(--spacing-2) 0;
}
.date-card.past .date-day {
  color: var(--muted);
}
.ama-avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
}
.event-time {
  margin-top: var(--spacing-1);
}
.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin: var(--spacing-2) 0 var(--spacing-3);
}
.tag {
  display: inline-block;
  font-size: var(--font-1);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--sunken);
  color: var(--muted);
  padding: 2px var(--spacing-2);
  border-radius: var(--radii-default);
}
.event-description {
  font-size: var(--font-3);
  margin: var(--spacing-3) 0;
  line-height: var(--line-height-body);
}
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}
.rsvp-section {
  margin: var(--spacing-4) 0;
}
.rsvp-count {
  margin-top: var(--spacing-2);
}
.youtube-section {
  margin-top: var(--spacing-4);
}
.embed-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 */
  border-radius: var(--radii-extra);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.embed-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
