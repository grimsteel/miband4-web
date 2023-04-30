<template>
  <div class="mb-10 target:border-2 target:border-gray-400 target:dark:border-gray-600 target:rounded-md target:p-3 target:shadow-lg group" :id="id">
    <h3 class="flex items-center mb-4 text-lg font-medium text-gray-900 dark:text-white">{{ title }}</h3>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
    id: string;
  }>();
</script>