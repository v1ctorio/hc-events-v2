<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
</script>

<template>
<nav>
  <div class="container nav-container">
    <NuxtLink to="/" class="flag-link" aria-label="Hack Club homepage">
      <img
        src="https://assets.hackclub.com/flag-orpheus-top.svg"
        alt="Hack Club flag"
        class="flag"
      />
    </NuxtLink>

    <div class="nav-right">
      <UButton
        to="https://github.com/hackclub/hc-events-v2"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="View source on GitHub"
        color="neutral"
        variant="ghost"
        size="sm"
      />
      <template v-if="loggedIn">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          @click="clear"
        >
          Sign Out
        </UButton>
        <img
          :src="`https://cachet.dunkirk.sh/users/${(user as any)?.slack_id}/r`"
          alt="Your avatar"
          class="nav-avatar"
        />
      </template>
      <a href="/auth/hackclub">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
        >
          Log in
        </UButton>
      </a>
    </div>
  </div>
</nav>
</template>

<style scoped>
nav {
  background-color: var(--sheet);
  padding: var(--spacing-3) 0;
}
.nav-container {
  display: flex;
  align-items: center;
}
.flag-link {
  line-height: 0;
  margin-top: calc(-1 * var(--spacing-3));
}
.flag {
  width: 96px;
}
@media (min-width: 32em) {
  .flag { width: 128px; }
}
.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.nav-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
</style>