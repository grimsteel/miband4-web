<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Status</h2>
    <dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div class="flex flex-col pb-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Steps</dt>
        <dd class="text-lg font-semibold">
          <span v-if="steps !== undefined">{{ steps }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Distance ({{ distanceUnit === "km" ? "KM" : "Miles" }})</dt>
        <dd class="text-lg font-semibold">
          <span v-if="convertedDistance !== undefined">{{ convertedDistance }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col pt-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Calories Burned (kcal)</dt>
        <dd class="text-lg font-semibold">
          <span v-if="calories !== undefined">{{ calories }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import LoaderPlaceholder from "../LoaderPlaceholder.vue";
  const props = defineProps<{
    steps?: number;
    meters?: number;
    calories?: number;
    distanceUnit?: "km" | "miles";
  }>();

  const convertedDistance = computed(() => {
    if (props.meters === undefined) return undefined;
    else if (props.distanceUnit === "km") return (props.meters / 1000).toFixed(2);
    else return (props.meters / 1609).toFixed(2);
  });
</script>