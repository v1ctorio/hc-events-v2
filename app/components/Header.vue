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
        v-if="loggedIn"
        to="/new"
        size="sm"
        icon="i-lucide-plus"
        class="create-event"
      >
        Create event
      </UButton>
      <a
        href="https://github.com/hackclub/hc-events-v2"
        target="_blank"
        aria-label="View source on GitHub"
        class="icon-link"
      >
        <UIcon name="i-simple-icons-github" />
      </a>
      <template v-if="loggedIn">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          @click="clear"
          style="box-shadow: none; transform: none; border-radius: var(--radii-default);"
        >
          Sign Out
        </UButton>
        <img
          :src="`https://cachet.dunkirk.sh/users/${(user as any)?.slack_id}/r`"
          alt="Your avatar"
          class="nav-avatar"
        />
      </template>
      <a href="/auth/hackclub" v-else>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          style="box-shadow: none; transform: none; border-radius: var(--radii-default);"
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
.create-event {
  border-radius: var(--radii-default);
  box-shadow: none;
}
@media (max-width: 32em) {
  .create-event :deep(.truncate) {
    display: none;
  }
}
.icon-link {
  display: flex;
  align-items: center;
  font-size: 24px;
  color: var(--primary);
  transition: opacity 0.125s ease-in-out;
}
.icon-link:hover {
  opacity: 0.8;
}
</style>
