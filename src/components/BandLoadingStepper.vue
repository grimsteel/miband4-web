<template>
  <ul class="space-y-4 w-72">
    <li v-for="item, i in states">
      <div
        class="w-full p-4 border rounded-lg dark:bg-gray-800"
        role="alert"
        :class="{
          'text-green-700 border-green-300 bg-green-50 dark:border-green-800 dark:text-green-400': i < currentStateIndex,
          'text-blue-700 border-blue-300 bg-blue-100 dark:border-blue-800 dark:text-blue-400': i === currentStateIndex,
          'text-gray-900 border-gray-300 bg-gray-100 dark:border-gray-700 dark:text-gray-400': i > currentStateIndex
        }" >
        <div class="flex items-center justify-between">
          <h3 class="font-medium">{{ item.text }}</h3>
          <IconCheck class="w-5 h-5" v-if="i < currentStateIndex" />
          <IconLoader class="w-5 h-5 animate-spin text-blue-600" v-else-if="i === currentStateIndex" />
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import IconCheck from "./icons/IconCheck.vue";
  import IconLoader from "./icons/IconLoader.vue";
  import type { BandLoadingStates } from "../types";

  const props = defineProps<{
    currentState: BandLoadingStates
  }>();

  const states = [
    {
      id: "reauthorizing",
      text: "Reauthorizing"
    },
    {
      id: "searching",
      text: "Searching for Device"
    },
    {
      id: "connecting",
      text: "Connecting"
    },
    {
      id: "getting-service",
      text: "Getting Service"
    },
    {
      id: "authenticating",
      text: "Authenticating"
    }
  ];

  const currentStateIndex = computed(() => states.findIndex(({ id }) => props.currentState === id));
</script>