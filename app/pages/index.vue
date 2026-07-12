<script setup lang="ts">

const route = useRoute()

const page = computed(() => Number(route.query.page || 1))
const tags = computed(() => route.query.tags ? String(route.query.tags) : undefined)

const { data, status } = await useFetch('/api/events', {
  query: { page, tags, limit: 30, upcoming: true },
  watch: [page, tags],
})

const events = computed(() => data.value?.events ?? [])
const pagination = computed(() => data.value?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: 30 })

// Group events by month
const grouped = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const ev of events.value) {
    const d = new Date(ev.ScheduledStartTime)
    const key = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    ;(groups[key] ??= []).push(ev)
  }
  return groups
})

const navigateToPage = (p: number) => {
  navigateTo({ query: { ...route.query, page: p } })
}
</script>

<template>
  <div>
    <!-- Hero -->
    <header class="hero">
      <div class="container hero-content">
        <h1 class="title hero-title">Hack Club Events</h1>
        <p class="subtitle">
          AMAs, show &amp; tells, &amp; weekly fun in the
          <a href="https://hackclub.com/">Hack Club</a> community.
        </p>
        <p class="caption">All dates/times in your local time.</p>
      </div>
    </header>

    <!-- Events list -->
    <main class="container events-container">
      <div v-if="status === 'pending'" class="loading">
        <UIcon name="i-lucide-loader-2" class="spinner" />
        Loading events…
      </div>

      <template v-else-if="Object.keys(grouped).length">
        <section v-for="(monthEvents, month) in grouped" :key="month" class="month-section">
          <h2 class="month-heading eyebrow">{{ month }}</h2>
          <div class="events-grid">
            <EventCard v-for="ev in monthEvents" :key="ev.EventID" :event="ev" />
          </div>
        </section>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="pagination">
          <UButton
            :disabled="page <= 1"
            variant="outline"
            color="neutral"
            icon="i-lucide-chevron-left"
            @click="navigateToPage(page - 1)"
          />
          <span class="caption">Page {{ page }} of {{ pagination.totalPages }}</span>
          <UButton
            :disabled="page >= pagination.totalPages"
            variant="outline"
            color="neutral"
            icon="i-lucide-chevron-right"
            @click="navigateToPage(page + 1)"
          />
        </div>
      </template>

      <div v-else class="empty">
        <h2>🚧 More events coming soon.</h2>
      </div>
    </main>
  </div>
</template>

<style scoped>
.hero {
  background: var(--sheet);
  text-align: center;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-4);
}
.hero-title {
  color: var(--primary);
  margin-bottom: var(--spacing-2);
}
.events-container {
  padding-top: var(--spacing-4);
  padding-bottom: var(--spacing-5);
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-3);
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  margin-top: var(--spacing-4);
}
.loading, .empty {
  text-align: center;
  padding: var(--spacing-5) 0;
  color: var(--muted);
}
.spinner {
  animation: spin 1s linear infinite;
  font-size: var(--font-4);
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
