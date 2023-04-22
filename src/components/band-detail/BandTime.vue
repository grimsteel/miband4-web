<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Band Time</h5>
    <dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div class="flex flex-col pb-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Current Band Time</dt>
        <dd class="text-lg font-semibold">
          <span v-if="time">{{ time.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col pt-2">
        <button @click="$emit('sync')" type="button" class="w-max text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 inline-flex items-center" :disabled="!!loading">
          <template v-if="loading">
            <IconLoader class="inline w-4 h-4 mr-3 text-white animate-spin" />
            Loading...
          </template>
          <template v-else>
            Sync to System Time
          </template>
        </button>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
  import IconLoader from "../icons/IconLoader.vue";
  import LoaderPlaceholder from "./LoaderPlaceholder.vue";
  defineProps<{
    time?: Date;
    loading: boolean;
  }>();
  defineEmits(["sync"]);
</script>