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
  },
  style: [
    { innerHTML: 'body{opacity:0}', tagPosition: 'head' }
  ]
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
          <a
            href="https://github.com/hackclub/hc-events-v2"
            target="_blank"
            aria-label="GitHub"
            class="icon-link"
          >
            <UIcon name="i-simple-icons-github" />
          </a>
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
.icon-link {
  display: flex;
  align-items: center;
  font-size: 24px;
  color: var(--muted);
  transition: opacity 0.125s ease-in-out;
}
.icon-link:hover {
  opacity: 0.8;
}
</style>
