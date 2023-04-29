<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Band Time</h2>
    <dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div class="flex flex-col pb-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Current Band Time</dt>
        <dd class="text-lg font-semibold">
          <span v-if="time">{{ time.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col pt-2">
        <ButtonWithLoader @click="$emit('sync')" :loading="loading" text="Sync to System Time" />
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
  import ButtonWithLoader from "../ButtonWithLoader.vue";
  import LoaderPlaceholder from "../LoaderPlaceholder.vue";
  defineProps<{
    time?: Date;
    loading: boolean;
  }>();
  defineEmits(["sync"]);
</script>