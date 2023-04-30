<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Activity Data</h2>
    <FeatureTag classes="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-400" text="Buggy" :icon="IconWarning" />
    <dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div class="flex flex-col pb-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Latest Timestamp</dt>
        <dd class="font-semibold">
          <template v-if="latestActivityTimestamp">{{ latestActivityTimestamp.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) }}</template>
          <template v-else>N/A (Never fetched)</template>
        </dd>
      </div>
      <div class="flex flex-row gap-2 py-2">
        <ButtonWithLoader text="Fetch Data" :loading="!!loading" @click="$emit('fetch-data')" classes="bg-amber-500 hover:bg-amber-600 focus:ring-amber-200 dark:bg-amber-600 dark:hover:bg-amber-700 dark:focus:ring-amber-800" />
        <ButtonWithLoader text="View Data" :loading="false" @click="$emit('view-data')" />
      </div>
      <div class="flex flex-col py-2" v-if="loading">
        <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div class="h-2 rounded-full bg-amber-400" :style="`width: ${ loading }%`"></div>
        </div>
      </div>
      <div class="flex flex-col pt-2">
        <p class="font-normal text-gray-700 dark:text-gray-400 text-sm">The band may randomly disconnect while fetching data. <router-link to="/faq/#stuck-fetching" class="text-blue-600 hover:underline dark:text-blue-500">Learn More</router-link>.</p>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
  import FeatureTag from "../FeatureTag.vue";
  import IconWarning from "../icons/IconWarning.vue";
  import ButtonWithLoader from "../ButtonWithLoader.vue";

  defineProps<{
    latestActivityTimestamp?: Date;
    loading?: number; // percentage
  }>();
  defineEmits(["fetch-data", "view-data"]);
</script>