<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Heart Rate</h5>
    <FeatureTag classes="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400" text="Coming soon!" :icon="IconClock" />
  </div>
</template>

<script setup lang="ts">
  import IconClock from '../icons/IconClock.vue';
  import FeatureTag from '../FeatureTag.vue';
</script>