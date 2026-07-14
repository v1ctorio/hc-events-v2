<script setup lang="ts">
import { EVENT_TAGS } from '#shared/event-tags'

const route = useRoute()

const page = computed(() => Number(route.query.page || 1))
const year = computed(() => route.query.year ? String(route.query.year) : undefined)
const month = computed(() => route.query.month ? String(route.query.month) : undefined)
const tags = computed(() => route.query.tags ? String(route.query.tags) : undefined)

const filterYear = ref(year.value ?? '')
const filterMonth = ref(month.value ?? '')
const filterTags = ref(tags.value ?? '')

watch([year, month, tags], ([nextYear, nextMonth, nextTags]) => {
  filterYear.value = nextYear ?? ''
  filterMonth.value = nextMonth ?? ''
  filterTags.value = nextTags ?? ''
})

const { data, status, error } = await useFetch('/api/events', {
  query: { page, year, month, tags, limit: 30, past: true },
  watch: [page, year, month, tags],
})

const events = computed(() => data.value?.events ?? [])
const pagination = computed(() => data.value?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: 30 })

const grouped = computed(() => {
  const groups: Record<string, typeof events.value> = {}
  for (const event of events.value) {
    const date = new Date(event.ScheduledStartTime)
    const key = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    ;(groups[key] ??= []).push(event)
  }
  return groups
})

const cleanQuery = (query: Record<string, string | number>) => Object.fromEntries(
  Object.entries(query).filter(([, value]) => value !== '')
)

const applyFilters = () => navigateTo({
  query: cleanQuery({
    year: filterYear.value.trim(),
    month: filterYear.value ? filterMonth.value : '',
    tags: filterTags.value.trim(),
  }),
})

const clearFilters = () => { navigateTo('/past') }

const navigateToPage = (nextPage: number) => navigateTo({
  query: { ...route.query, page: nextPage },
})

useSeoMeta({
  title: 'Past Events · Hack Club Events',
  description: 'Browse past Hack Club events, AMAs, workshops, and community sessions.',
})
</script>

<template>
  <div>
    <header class="history-hero">
      <div class="container">
        <h1 class="title">Past Events</h1>
        <p class="caption">Revisit events from the Hack Club community.</p>
      </div>
    </header>

    <main class="container history-container">
      <form class="filters" aria-label="Filter past events" @submit.prevent="applyFilters">
        <label>
          <span>Year</span>
          <input
            v-model="filterYear"
            type="number"
            inputmode="numeric"
            min="2010"
            :max="new Date().getFullYear()"
            placeholder="Any"
          />
        </label>

        <label>
          <span>Month</span>
          <select v-model="filterMonth" :disabled="!filterYear">
            <option value="">Any</option>
            <option v-for="name in 12" :key="name" :value="name">
              {{ new Date(2000, name - 1).toLocaleDateString(undefined, { month: 'long' }) }}
            </option>
          </select>
        </label>

        <label class="tag-filter">
          <span>Tag</span>
          <select v-model="filterTags">
            <option value="">Any</option>
            <option v-for="tag in EVENT_TAGS" :key="tag" :value="tag">
              {{ tag.replaceAll('-', ' ').replace(/\b\w/g, letter => letter.toUpperCase()) }}
            </option>
          </select>
        </label>

        <UButton type="submit" icon="i-lucide-search">Filter</UButton>
        <UButton
          v-if="year || month || tags"
          type="button"
          variant="ghost"
          color="neutral"
          @click="clearFilters"
        >
          Clear
        </UButton>
      </form>

      <div v-if="status === 'pending'" class="state">
        <UIcon name="i-lucide-loader-2" class="spinner" />
        Loading events…
      </div>

      <div v-else-if="error" class="state" role="alert">
        Past events could not be loaded.
      </div>

      <template v-else-if="events.length">
        <section v-for="(monthEvents, monthName) in grouped" :key="monthName" class="month-section">
          <h2 class="month-heading eyebrow">{{ monthName }}</h2>
          <div class="events-grid">
            <EventCard v-for="event in monthEvents" :key="event.EventID" :event="event" />
          </div>
        </section>

        <div v-if="pagination.totalPages > 1" class="pagination">
          <UButton
            :disabled="page <= 1"
            variant="outline"
            color="neutral"
            icon="i-lucide-chevron-left"
            aria-label="Previous page"
            @click="navigateToPage(page - 1)"
          />
          <span class="caption">Page {{ page }} of {{ pagination.totalPages }}</span>
          <UButton
            :disabled="page >= pagination.totalPages"
            variant="outline"
            color="neutral"
            icon="i-lucide-chevron-right"
            aria-label="Next page"
            @click="navigateToPage(page + 1)"
          />
        </div>
      </template>

      <div v-else class="state">
        No past events match those filters.
      </div>
    </main>
  </div>
</template>

<style scoped>
.history-hero {
  background: var(--sheet);
  text-align: center;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-4);
}
.history-hero .title {
  color: var(--primary);
  margin-bottom: var(--spacing-2);
}
.history-hero p {
  margin: 0;
}
.history-container {
  padding-top: var(--spacing-4);
  padding-bottom: var(--spacing-5);
}
.filters {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  background: var(--sheet);
  border: 1px solid var(--border);
  border-radius: var(--radii-default);
}
.filters label {
  display: grid;
  gap: var(--spacing-1);
  color: var(--muted);
  font-size: var(--font-1);
  font-weight: var(--font-weight-bold);
}
.filters input,
.filters select {
  min-height: 40px;
  border: 1px solid var(--border);
  border-radius: var(--radii-small);
  padding: var(--spacing-2);
  background: var(--background);
  color: var(--text);
  font: inherit;
  font-size: var(--font-2);
}
.filters input:focus,
.filters select:focus {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}
.filters input[type='number'] {
  width: 8rem;
}
.tag-filter {
  flex: 1 1 14rem;
}
.month-section {
  margin-bottom: var(--spacing-4);
}
.month-heading {
  font-size: var(--font-3);
  margin-bottom: var(--spacing-3);
}
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-3);
}
.pagination,
.state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
}
.pagination {
  margin-top: var(--spacing-4);
}
.state {
  min-height: 12rem;
  color: var(--muted);
  text-align: center;
}
.spinner {
  animation: spin 1s linear infinite;
  font-size: var(--font-4);
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@media (max-width: 40em) {
  .filters > label,
  .filters input,
  .filters select,
  .filters input[type='number'] {
    width: 100%;
  }
}
</style>
