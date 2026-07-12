<script setup lang="ts">
const props = defineProps<{ event: Record<string, any> }>()

const isPast = computed(() => new Date(props.event.ScheduledStartTime) < new Date())

const endTime = computed(() => {
  const start = new Date(props.event.ScheduledStartTime)
  const dur = props.event.EstimatedDuration ?? 60
  return new Date(start.getTime() + dur * 60_000)
})

const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
const fmtTime = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
</script>

<template>
  <NuxtLink :to="`/${event.Slug}`" class="event-card" :class="{ past: isPast }">
    <div class="event-date-bar" :class="{ past: isPast }">
      <strong>{{ fmtDate(new Date(event.ScheduledStartTime)) }}</strong>
      {{ fmtTime(new Date(event.ScheduledStartTime)) }}–{{ fmtTime(endTime) }}
    </div>
    <div class="event-body">
      <h3 class="event-title">{{ event.Title }}</h3>
      <div v-if="event.Tags?.length" class="event-tags">
        <span v-for="tag in event.Tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="event-meta">
        <img
          v-if="event.leaderAvatar"
          :src="event.leaderAvatar"
          :alt="event.LeaderSlackId"
          class="leader-avatar"
        />
        <span class="leader-name">{{ event.LeaderSlackId }}</span>
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
  border-radius: var(--radii-extra);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: transform 0.125s ease-in-out, box-shadow 0.125s ease-in-out;
}
.event-card:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-elevated);
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
.event-date-bar strong {
  display: block;
}
@media (min-width: 32em) {
  .event-date-bar strong { display: inline; margin-right: var(--spacing-2); }
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
  border-radius: var(--radii-default);
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
  border-radius: var(--radii-circle);
}
</style>
