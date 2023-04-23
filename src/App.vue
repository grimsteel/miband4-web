<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import Navbar from './components/Navbar.vue'
</script>

<template>
  <header>
    <Navbar />
  </header>

  <RouterView v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>