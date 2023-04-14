<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import Navbar from './components/Navbar.vue'
</script>

<template>
  <header>
    <Navbar />
  </header>

  <RouterView v-slot="{ Component, route }">
    <transition name="fade">
      <component :is="Component" :key="route.path" />
    </transition>
  </RouterView>
</template>