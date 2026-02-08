<script setup lang="ts">
const {loggedIn, user, clear} = useUserSession()
</script>



<template>
  <div v-if="loggedIn">
    <h1>Welcome {{ JSON.stringify(user) }}!</h1>
    <button @click="clear()">
      Logout
    </button>
  </div>
  <div v-else>
    <h1>Not logged in</h1>
    <a href="/auth/hackclub">Login with Hack Club</a>
  </div>
</template>
