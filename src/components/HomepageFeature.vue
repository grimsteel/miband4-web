<template>
  <div>
    <div class="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-orange-100 lg:h-12 lg:w-12 dark:bg-orange-900">
      <component :is="icon" class="w-5 h-5 text-orange-600 lg:w-6 lg:h-6 dark:text-orange-300" />
    </div>
    <slot name="tag"></slot>
    <h3 class="mb-2 text-xl font-bold dark:text-white">{{ title }}</h3>
    <p class="text-gray-500 dark:text-gray-400">{{ description }}</p>
  </div>
</template>
<script setup lang="ts">
  defineProps<{
    icon: Object;
    title: string;
    description: string;
  }>();
</script>