<script setup lang="ts">
import { EVENT_TAGS, type EventTag } from '#shared/event-tags'
import type { APIEvent } from '#shared/types/events'

const { loggedIn, user } = useUserSession()

const title = ref('')
const description = ref('')
const scheduledStartTime = ref('')
const estimatedDuration = ref('60')
const eventLink = ref('')
const tags = ref<EventTag[]>([])
const submitting = ref(false)
const errorMessage = ref('')
const submittedTitle = ref('')
const submittedEventId = ref('')

const minimumStartTime = computed(() => {
  const now = new Date(Date.now() + 5 * 60_000)
  now.setSeconds(0, 0)
  return toLocalDateTime(now)
})

function toLocalDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function toggleTag(tag: EventTag) {
  tags.value = tags.value.includes(tag)
    ? tags.value.filter(current => current !== tag)
    : [...tags.value, tag]
}

function resetForm() {
  title.value = ''
  description.value = ''
  scheduledStartTime.value = ''
  estimatedDuration.value = '60'
  eventLink.value = ''
  tags.value = []
}

async function submitEvent() {
  if (!scheduledStartTime.value) return

  submitting.value = true
  errorMessage.value = ''

  try {
    const event = await $fetch<APIEvent>('/api/events', {
      method: 'POST',
      body: {
        title: title.value.trim(),
        description: description.value.trim() || undefined,
        scheduledStartTime: new Date(scheduledStartTime.value).toISOString(),
        estimatedDuration: Number(estimatedDuration.value),
        eventLink: eventLink.value.trim() || undefined,
        tags: tags.value,
      },
    })
    submittedTitle.value = title.value.trim()
    submittedEventId.value = event.EventID
    resetForm()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'Your event could not be submitted. Please try again.'
  } finally {
    submitting.value = false
  }
}

useSeoMeta({
  title: 'Create an Event · Hack Club Events',
  description: 'Propose an event for the Hack Club community.',
})
</script>

<template>
  <div>
    <header class="form-hero">
      <div class="container hero-inner">
        <h1 class="title">Create an event</h1>
        <p class="subtitle">Submit an event for the Hack Club community.</p>
      </div>
    </header>

    <main class="container form-container">
      <section v-if="!loggedIn" class="login-gate">
        <h2>Log in to submit an event</h2>
        <p>Event proposals are connected to your Hack Club Slack account.</p>
        <UButton to="/auth/hackclub">Log in with Hack Club</UButton>
      </section>

      <section v-else-if="submittedTitle" class="success-state" aria-live="polite">
        <h2>Event submitted</h2>
        <p><strong>{{ submittedTitle }}</strong> will appear on the events page after it is approved.</p>
        <div class="success-actions">
          <UButton :to="`/events/${submittedEventId}/edit`">
            Edit proposal
          </UButton>
          <UButton
            variant="outline"
            color="neutral"
            @click="submittedTitle = ''; submittedEventId = ''"
          >
            Submit another
          </UButton>
          <UButton to="/" variant="outline" color="neutral">Back to events</UButton>
        </div>
      </section>

      <form v-else class="event-form" @submit.prevent="submitEvent">
        <div class="form-intro">
          <div>
            <h2>Event details</h2>
            <p>Submitting as {{ (user as any)?.name || (user as any)?.email || 'your Hack Club account' }}.</p>
          </div>
        </div>

        <div v-if="errorMessage" class="form-error" role="alert">
          {{ errorMessage }}
        </div>

        <div class="field-grid">
          <label class="field field-wide">
            <span>Title <strong aria-hidden="true">*</strong></span>
            <input v-model="title" required maxlength="120" placeholder="Build a tiny game in Godot" />
          </label>

          <label class="field field-wide">
            <span>Description</span>
            <textarea
              v-model="description"
              rows="5"
              maxlength="4000"
              placeholder="What will happen, and what should attendees bring or know?"
            />
          </label>

          <label class="field">
            <span>Starts <strong aria-hidden="true">*</strong></span>
            <input
              v-model="scheduledStartTime"
              required
              type="datetime-local"
              :min="minimumStartTime"
            />
            <small>Your local time</small>
          </label>

          <label class="field">
            <span>Duration (in minutes) <strong aria-hidden="true">*</strong></span>
            <input
              v-model="estimatedDuration"
              required
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
            />
          </label>

          <label class="field field-wide">
            <span>Location</span>
            <input v-model="eventLink" type="url" placeholder="https://…" />
            <small>Leave blank to use the community channel huddle.</small>
          </label>

          <fieldset class="field field-wide tag-field">
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
        </div>

        <div class="form-footer">
          <p>Proposals are reviewed by the events team before they go live.</p>
          <UButton type="submit" size="lg" :loading="submitting">
            Submit event
          </UButton>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.form-hero {
  background: var(--sheet);
  border-bottom: 1px solid var(--border);
  padding: var(--spacing-4) var(--spacing-3);
}
.hero-inner {
  max-width: var(--size-copy-plus);
}
.form-hero .title {
  margin: 0;
  color: var(--text);
}
.form-hero .subtitle {
  max-width: var(--size-copy);
  margin-bottom: 0;
  color: var(--muted);
}
.form-container {
  max-width: var(--size-copy-plus);
  padding-top: var(--spacing-4);
  padding-bottom: var(--spacing-5);
}
.event-form,
.login-gate,
.success-state {
  border: 1px solid var(--border);
  border-radius: var(--radii-default);
  background: var(--background);
}
.event-form {
  overflow: hidden;
}
.form-intro,
.field-grid,
.form-footer {
  padding: var(--spacing-4);
}
.form-intro {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--spacing-3);
  border-bottom: 1px solid var(--border);
}
.form-intro h2,
.success-state h2,
.login-gate h2 {
  margin: 0 0 var(--spacing-1);
  font-size: var(--font-4);
}
.form-intro p,
.form-footer p,
.success-state p,
.login-gate p {
  margin: 0;
  color: var(--muted);
}
.form-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: var(--spacing-3) var(--spacing-4) 0;
  padding: var(--spacing-2) var(--spacing-3);
  border-left: 4px solid var(--red);
  background: color-mix(in srgb, var(--red) 8%, var(--background));
  color: var(--red);
}
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
}
.field {
  display: grid;
  align-content: start;
  gap: var(--spacing-1);
  min-width: 0;
}
.field > span,
.tag-field legend {
  color: var(--text);
  font-size: var(--font-2);
  font-weight: var(--font-weight-bold);
}
.field strong {
  color: var(--primary);
}
.field-wide {
  grid-column: 1 / -1;
}
.field input,
.field textarea,
.field select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radii-small);
  padding: 10px 12px;
  background: var(--background);
  color: var(--text);
  font: inherit;
}
.field textarea {
  resize: vertical;
  min-height: 8rem;
}
.field input:focus,
.field textarea:focus,
.field select:focus {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
  border-color: transparent;
}
.field small {
  color: var(--muted);
}
.tag-field {
  margin: 0;
  padding: 0;
  border: 0;
}
.tag-field legend {
  margin-bottom: var(--spacing-2);
}
.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.tag-pill {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--border);
  border-radius: var(--radii-circle);
  background: var(--background);
  color: var(--muted);
  font-size: var(--font-2);
  box-shadow: none;
  cursor: pointer;
  transform: none;
}
.tag-pill:hover,
.tag-pill:focus-visible {
  border-color: var(--primary);
  box-shadow: none;
  color: var(--text);
  outline: none;
  transform: none;
}
.tag-pill:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.tag-pill.selected {
  border-color: var(--primary);
  background: var(--primary);
  color: var(--white);
}
.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
  border-top: 1px solid var(--border);
  background: var(--sheet);
}
.login-gate,
.success-state {
  padding: var(--spacing-5) var(--spacing-4);
  text-align: center;
}
.login-gate p,
.success-state p {
  max-width: var(--size-narrow);
  margin: 0 auto var(--spacing-3);
}
.success-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
@media (max-width: 40em) {
  .field-grid {
    grid-template-columns: 1fr;
  }
  .field-wide {
    grid-column: auto;
  }
  .form-intro,
  .form-footer {
    align-items: stretch;
    flex-direction: column;
  }
  .form-footer :deep(button) {
    width: 100%;
  }
}
</style>
