<script setup lang="ts">
const props = defineProps<{ event: Record<string, any> }>()

const { displayName, avatarUrl } = useCachetUser(props.event.LeaderSlackId)

const startTime = computed(() => new Date(props.event.ScheduledStartTime))
const endTime = computed(() => {
  const dur = props.event.EstimatedDuration ?? 60
  return new Date(startTime.value.getTime() + dur * 60_000)
})

const isPast = computed(() => endTime.value < new Date())
const isLive = computed(() => {
  const now = new Date()
  return startTime.value <= now && now < endTime.value
})

const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
const fmtTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
</script>

<template>
  <NuxtLink :to="`/${event.Slug}`" class="event-card" :class="{ past: isPast, live: isLive }">
    <div class="event-date-bar" :class="{ past: isPast, live: isLive }">
      <span v-if="isLive" class="live-badge">● LIVE</span>
      <template v-else>
        <strong>{{ fmtDate(startTime) }}</strong>
      </template>
      {{ fmtTime(startTime) }}–{{ fmtTime(endTime) }}
    </div>
    <div class="event-body">
      <h3 class="event-title">{{ event.Title }}</h3>
      <div v-if="event.Tags?.length" class="event-tags">
        <span v-for="tag in event.Tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="event-meta">
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          :alt="displayName"
          class="leader-avatar"
        />
        <span class="leader-name">{{ displayName }}</span>
        <span v-if="event.isAma" class="ama-badge">AMA</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.event-card {
  display: block;
  text-decoration: none;
  color: var(--text);
  background: var(--elevated);
  border-radius: 8px;
  overflow: hidden;
}
.event-card:hover {
  outline: 2px solid var(--primary);
}

/* Live event glow */
.event-card.live {
  outline: 2px solid var(--green);
}

.event-date-bar {
  background: var(--primary);
  color: var(--white);
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-2);
  line-height: var(--line-height-body);
}
.event-date-bar.past {
  background: var(--sunken);
  color: var(--text);
}
.event-date-bar.live {
  background: var(--green);
}
.event-date-bar strong {
  display: block;
}
@media (min-width: 32em) {
  .event-date-bar strong { display: inline; margin-right: var(--spacing-2); }
}

.live-badge {
  font-weight: bold;
  margin-right: var(--spacing-2);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.event-body {
  padding: var(--spacing-3);
}
.event-title {
  font-size: var(--font-3);
  margin: 0 0 var(--spacing-2);
}
.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-2);
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
  border-radius: 4px;
}
.event-meta {
  display: flex;
  align-items: center;
  color: var(--muted);
  font-size: var(--font-2);
  gap: var(--spacing-2);
}
.leader-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
.ama-badge {
  background: var(--purple);
  color: var(--white);
  font-size: var(--font-1);
  font-weight: bold;
  padding: 2px var(--spacing-2);
  border-radius: 4px;
}
</style>
