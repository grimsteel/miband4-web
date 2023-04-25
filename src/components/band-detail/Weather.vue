<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">Weather</h5>
    <div class="max-w-md font-medium text-gray-900 dark:text-white mb-2 divide-y divide-gray-200 dark:divide-gray-600">
      <p class="mb-1 font-semibold"></p>
      <p class="text-gray-500 dark:text-gray-400"></p>
      <WeatherIconDropdown />
    </div>
    <div>
      <ButtonWithLoader type="button" :loading="false" text="Save" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import WeatherIconDropdown from '../WeatherIconDropdown.vue';
  import ButtonWithLoader from '../ButtonWithLoader.vue';
</script>