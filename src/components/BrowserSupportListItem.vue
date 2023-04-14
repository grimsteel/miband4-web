<template>
  <li class="py-3 sm:py-4">
    <div class="flex items-center space-x-3">
        <p class="text-sm font-semibold text-gray-900 truncate dark:text-white flex-1 min-w-0">{{ browser }}</p>
        <span class="inline-flex items-center text-xs font-medium mr-2 py-0.5 rounded-full" :class="`${isSupported ? greenClasses : redClasses} ${showOnlyDot ? 'px-0.5' : 'px-2.5'}`">
          <span class="w-2 h-2 rounded-full" :class="`${isSupported ? greenDotClasses : redDotClasses}  ${showOnlyDot ? '' : 'mr-1'}`"></span>
          {{ sinceVersion ?? "Not Supported" }}
        </span>
    </div>
  </li>
</template>
<script setup lang="ts">
  import { computed } from '@vue/reactivity';
  const props = defineProps<{
    browser: string;
    sinceVersion?: string;
  }>();

  const greenClasses = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
  const redClasses = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  const greenDotClasses = "bg-green-500";
  const redDotClasses = "bg-red-500";

  const isSupported = computed(() => props.sinceVersion !== undefined);
  const showOnlyDot = computed(() => props.sinceVersion === "");
</script>