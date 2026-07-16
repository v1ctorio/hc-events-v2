<script setup lang="ts">
const props = defineProps<{ slackId: string }>()
const { displayName } = useCachetUser(props.slackId)
</script>

<template>
  <span>
    {{ slackId }}<template v-if="displayName && displayName !== slackId"> ({{ displayName }})</template>
  </span>
</template>
