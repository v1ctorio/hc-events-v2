<script setup lang="ts">
import AppLogo from './AppLogo.vue';

</script>

<template>
<nav class="py-3">
<div class="container">
    <AppLogo/>
</div>

</nav>
</template>

<style>
nav {
    background-color: var(--sheet);
    color: var(--nav);
}
.container {
    display: flex;
    align-items: center;
}
.container, a {
    font-size: 1;
    color: var(--primary);
    text-decoration: 'none';
    margin-right: 3, 4;
}
</style>