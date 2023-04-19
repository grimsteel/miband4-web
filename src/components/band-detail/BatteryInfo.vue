<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Battery</h5>    
    <dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div class="flex flex-col pb-2">
        <dt class="mb-1">
          <div class="flex justify-between">
            <span class="text-base font-medium text-gray-500 dark:text-gray-400">Battery Level</span>
            <span class="text-sm font-medium" v-if="batteryLevel">{{ batteryLevel }}%</span>
          </div>
        </dt>
        <dd class="text-lg font-semibold">
          <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700" v-if="batteryLevel">
            <div class="h-2 rounded-full" :class="sliderBackground" :style="`width: ${ batteryLevel }%`"></div>
          </div>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Last Charged</dt>
        <dd class="text-lg font-semibold">
          <span v-if="lastCharge">{{ lastCharge.toLocaleString() }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Last Shutdown</dt>
        <dd class="text-lg font-semibold">
          <span v-if="lastOff">{{ lastOff.toLocaleString() }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col pt-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Last Charge Level</dt>
        <dd class="text-lg font-semibold">
          <span v-if="lastLevel">{{ lastLevel }}%</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import LoaderPlaceholder from "./LoaderPlaceholder.vue";
  const props = defineProps<{
    batteryLevel?: number;
    lastOff?: Date;
    lastLevel?: number;
    lastCharge?: Date;
  }>();

  const sliderBackground = computed(() => {
    if (!props.batteryLevel || props.batteryLevel < 33) return "bg-rose-600";
    else if (props.batteryLevel < 67) return "bg-amber-600";
    else return "bg-green-600";
  })
</script>