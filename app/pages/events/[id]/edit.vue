<script setup lang="ts">
import { EVENT_TAGS, isEventTag, type EventTag } from '#shared/event-tags'
import type { APIEvent } from '#shared/types/events'

const route = useRoute()
const id = route.params.id as string
const { data: event, status, error } = await useFetch<APIEvent>(`/api/manage/events/${id}`)
const { data: adminStatus } = await useFetch('/api/admin/status')

const title = ref('')
const description = ref('')
const scheduledStartTime = ref('')
const estimatedDuration = ref('')
const eventLink = ref('')
const tags = ref<EventTag[]>([])
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')
const backTo = computed(() => {
  if (event.value?.Approved && !event.value.Cancelled) return `/${event.value.Slug}`
  return adminStatus.value?.isAdmin ? '/admin' : '/'
})

function toLocalDateTime(value: string | Date) {
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

watch(event, value => {
  if (!value) return
  title.value = value.Title
  description.value = value.Description ?? ''
  scheduledStartTime.value = toLocalDateTime(value.ScheduledStartTime)
  estimatedDuration.value = String(value.EstimatedDuration ?? 60)
  eventLink.value = value.EventLink
  tags.value = value.Tags.filter(isEventTag)
}, { immediate: true })

function toggleTag(tag: EventTag) {
  tags.value = tags.value.includes(tag)
    ? tags.value.filter(current => current !== tag)
    : [...tags.value, tag]
}

async function saveEvent() {
  saving.value = true
  saved.value = false
  saveError.value = ''

  try {
    await $fetch(`/api/events/${id}`, {
      method: 'PATCH',
      body: {
        title: title.value.trim(),
        description: description.value.trim(),
        scheduledStartTime: new Date(scheduledStartTime.value).toISOString(),
        estimatedDuration: Number(estimatedDuration.value),
        eventLink: eventLink.value.trim(),
        tags: tags.value,
      },
    })
    saved.value = true
    await refreshNuxtData()
  } catch (error: any) {
    saveError.value = error?.data?.statusMessage || 'The event could not be saved.'
  } finally {
    saving.value = false
  }
}

useSeoMeta({
  title: computed(() => event.value ? `Edit ${event.value.Title} · Hack Club Events` : 'Edit Event'),
  robots: 'noindex',
})
</script>

<template>
  <main class="container edit-page">
    <div v-if="status === 'pending'" class="page-state">Loading event…</div>

    <div v-else-if="error?.statusCode === 401 || error?.statusCode === 403" class="page-state">
      You do not have permission to edit this event.
    </div>

    <div v-else-if="error || !event" class="page-state">Event not found.</div>

    <template v-else>
      <header>
        <h1>Edit event</h1>
        <p class="caption">{{ event.Title }}</p>
      </header>

      <form @submit.prevent="saveEvent">
        <p v-if="saveError" class="message error" role="alert">{{ saveError }}</p>
        <p v-if="saved" class="message success" role="status">Changes saved.</p>

        <label>
          <span>Title</span>
          <input v-model="title" required maxlength="120" />
        </label>

        <label>
          <span>Description</span>
          <textarea v-model="description" rows="6" maxlength="4000" />
        </label>

        <div class="field-row">
          <label>
            <span>Starts</span>
            <input v-model="scheduledStartTime" required type="datetime-local" />
          </label>

          <label>
            <span>Duration (in minutes)</span>
            <input
              v-model="estimatedDuration"
              required
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
            />
          </label>
        </div>

        <label>
          <span>Location</span>
          <input v-model="eventLink" required type="url" />
        </label>

        <fieldset>
          <legend>Tags</legend>
          <div class="tag-options">
            <button
              v-for="tag in EVENT_TAGS"
              :key="tag"
              type="button"
              class="tag-pill"
              :class="{ selected: tags.includes(tag) }"
              :aria-pressed="tags.includes(tag)"
              @click="toggleTag(tag)"
            >
              {{ tag.replaceAll('-', ' ').replace(/\b\w/g, letter => letter.toUpperCase()) }}
            </button>
          </div>
        </fieldset>

        <div class="actions">
          <UButton type="submit" :loading="saving">Save changes</UButton>
          <UButton
            :to="backTo"
            variant="outline"
            color="neutral"
          >
            Back
          </UButton>
        </div>
      </form>
    </template>
  </main>
</template>

<style scoped>
.edit-page {
  max-width: var(--size-copy-plus);
  padding-top: var(--spacing-4);
  padding-bottom: var(--spacing-5);
}
header {
  margin-bottom: var(--spacing-4);
}
header h1 {
  margin: 0;
}
header p:last-child {
  margin: var(--spacing-1) 0 0;
}
form {
  display: grid;
  gap: var(--spacing-3);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--border);
}
label {
  display: grid;
  gap: var(--spacing-1);
  font-weight: var(--font-weight-bold);
}
input,
textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radii-small);
  padding: 10px 12px;
  background: var(--background);
  color: var(--text);
  font: inherit;
  font-weight: normal;
}
textarea {
  resize: vertical;
}
input:focus,
textarea:focus {
  border-color: var(--primary);
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
}
fieldset {
  margin: 0;
  padding: 0;
  border: 0;
}
legend {
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-bold);
}
.tag-options,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.tag-pill {
  gap: var(--spacing-2);
  border: 1px solid var(--border);
  border-radius: var(--radii-circle);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--background);
  color: var(--muted);
  box-shadow: none;
  transform: none;
}
.tag-pill.selected {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--white);
}
.actions {
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--border);
}
.edit-page :deep(button) {
  box-shadow: none;
  transform: none;
}
.message {
  margin: 0;
  padding: var(--spacing-2) var(--spacing-3);
  border-left: 3px solid;
}
.message.error {
  border-color: var(--red);
  color: var(--red);
}
.message.success {
  border-color: var(--green);
  color: var(--steel);
}
.page-state {
  padding: var(--spacing-5) 0;
  color: var(--muted);
  text-align: center;
}
@media (max-width: 40em) {
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
