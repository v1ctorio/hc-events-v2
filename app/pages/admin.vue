<script setup lang="ts">
const { data, status, error, refresh } = await useFetch('/api/admin/events')

const actionLoading = ref<string>()
const actionError = ref('')

const events = computed(() => data.value?.events ?? [])
const pendingCount = computed(() => events.value.filter(event => !event.Approved && !event.Cancelled).length)

function eventStatus(event: { Approved: boolean, Cancelled: boolean }) {
  if (!event.Approved && event.Cancelled) return 'Rejected'
  if (!event.Approved) return 'Pending'
  if (event.Cancelled) return 'Cancelled'
  return 'Approved'
}

async function updateEvent(id: string, action: 'approve' | 'reject' | 'cancel' | 'restore') {
  actionLoading.value = `${id}:${action}`
  actionError.value = ''

  try {
    await $fetch(`/api/admin/events/${id}`, {
      method: 'PATCH',
      body: { action },
    })
    await refresh()
  } catch (error: any) {
    actionError.value = error?.data?.statusMessage || 'The event could not be updated.'
  } finally {
    actionLoading.value = undefined
  }
}

const formatDate = (value: string | Date) => new Date(value).toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

useSeoMeta({
  title: 'Manage Events · Hack Club Events',
  robots: 'noindex',
})
</script>

<template>
  <main class="container admin-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Admin</p>
        <h1>Manage events</h1>
      </div>
      <p v-if="!error" class="caption">{{ pendingCount }} pending</p>
    </header>

    <p v-if="actionError" class="error-message" role="alert">{{ actionError }}</p>

    <div v-if="status === 'pending'" class="page-state">Loading events…</div>

    <div v-else-if="error?.statusCode === 401 || error?.statusCode === 403" class="page-state">
      You do not have access to this page.
    </div>

    <div v-else-if="error" class="page-state" role="alert">
      Events could not be loaded.
    </div>

    <div v-else-if="events.length" class="event-list">
      <article v-for="event in events" :key="event.EventID" class="event-row">
        <div class="event-main">
          <div class="event-title-line">
            <NuxtLink v-if="event.Approved && !event.Cancelled" :to="`/${event.Slug}`">
              {{ event.Title }}
            </NuxtLink>
            <strong v-else>{{ event.Title }}</strong>
            <span class="status" :data-status="eventStatus(event).toLowerCase()">
              {{ eventStatus(event) }}
            </span>
          </div>
          <p>{{ formatDate(event.ScheduledStartTime) }}</p>
          <p>Host: {{ event.LeaderSlackId }}</p>
          <div v-if="event.Tags.length" class="event-tags">
            <span v-for="tag in event.Tags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <div class="actions">
          <UButton
            :to="`/events/${event.EventID}/edit`"
            size="sm"
            variant="outline"
            color="neutral"
          >
            Edit
          </UButton>

          <template v-if="!event.Approved && !event.Cancelled">
            <UButton
              size="sm"
              :loading="actionLoading === `${event.EventID}:approve`"
              :disabled="!!actionLoading"
              @click="updateEvent(event.EventID, 'approve')"
            >
              Approve
            </UButton>
            <UButton
              size="sm"
              variant="outline"
              color="neutral"
              :loading="actionLoading === `${event.EventID}:reject`"
              :disabled="!!actionLoading"
              @click="updateEvent(event.EventID, 'reject')"
            >
              Reject
            </UButton>
          </template>

          <UButton
            v-else-if="event.Cancelled"
            size="sm"
            variant="outline"
            color="neutral"
            :loading="actionLoading === `${event.EventID}:restore`"
            :disabled="!!actionLoading"
            @click="updateEvent(event.EventID, 'restore')"
          >
            Restore
          </UButton>

          <UButton
            v-else
            size="sm"
            variant="outline"
            color="neutral"
            :loading="actionLoading === `${event.EventID}:cancel`"
            :disabled="!!actionLoading"
            @click="updateEvent(event.EventID, 'cancel')"
          >
            Cancel
          </UButton>
        </div>
      </article>
    </div>

    <div v-else class="page-state">No events found.</div>
  </main>
</template>

<style scoped>
.admin-page {
  max-width: var(--size-layout);
  padding-top: var(--spacing-4);
  padding-bottom: var(--spacing-5);
}
.page-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}
.page-header h1 {
  margin: 0;
}
.page-header .eyebrow {
  color: var(--primary);
}
.event-list {
  border-top: 1px solid var(--border);
}
.event-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--border);
}
.event-main {
  min-width: 0;
}
.event-title-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.event-title-line a,
.event-title-line strong {
  color: var(--text);
  font-size: var(--font-3);
  font-weight: var(--font-weight-bold);
}
.event-main p {
  margin: var(--spacing-1) 0 0;
  color: var(--muted);
  font-size: var(--font-2);
}
.status,
.event-tags span {
  border: 1px solid var(--border);
  border-radius: var(--radii-small);
  padding: 2px var(--spacing-2);
  font-size: var(--font-1);
  font-weight: var(--font-weight-bold);
}
.status[data-status="pending"] {
  border-color: var(--orange);
  color: var(--orange);
}
.status[data-status="approved"] {
  border-color: var(--green);
  color: var(--steel);
}
.status[data-status="rejected"],
.status[data-status="cancelled"] {
  color: var(--muted);
}
.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
}
.event-tags span {
  color: var(--muted);
  font-weight: normal;
}
.actions {
  display: flex;
  flex: none;
  gap: var(--spacing-2);
}
.admin-page :deep(button) {
  border-radius: var(--radii-small);
  box-shadow: none;
  transform: none;
}
.error-message {
  border-left: 3px solid var(--red);
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--red);
}
.page-state {
  padding: var(--spacing-5) 0;
  color: var(--muted);
  text-align: center;
}
@media (max-width: 40em) {
  .event-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
