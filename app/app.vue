<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Hack Club Events'
const description = 'AMAs, show & tells, & weekly fun in the Hack Club community.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <Header />

    <UMain>
      <NuxtPage />
    </UMain>

    <footer class="site-footer">
      <div class="container footer-container">
        <p class="footer-text">
          Built with ❤️ by <a href="https://hackclub.com">Hack Club</a>
        </p>
        <div class="footer-links">
          <UButton
            to="https://github.com/hackclub/hc-events-v2"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </footer>
  </UApp>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  padding: var(--spacing-4) 0;
}
.footer-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.footer-text {
  font-size: var(--font-1);
  color: var(--muted);
  margin: 0;
}
</style>
