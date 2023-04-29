<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Night Mode</h2>
    <form @submit.prevent="onFormSubmit">
      <div class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
        <div class="flex items-center pb-2">
          <input v-model="nightMode.state" id="radio-night-mode-off" type="radio" value="off" name="radio-night-mode" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
          <label for="radio-night-mode-off" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Off</label>
        </div>
        <div class="flex items-center py-2">
          <input v-model="nightMode.state" id="radio-night-mode-sunrise-sunset" type="radio" value="sunrise-sunset" name="radio-night-mode" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
          <label for="radio-night-mode-sunrise-sunset" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Sunrise - Sunset</label>
        </div>
        <div class="flex py-2">
          <div class="flex items-center h-5">
            <input v-model="nightMode.state" id="radio-night-mode-scheduled" type="radio" value="scheduled" name="radio-night-mode" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
          </div>
          <div class="ml-2 text-sm">
            <label for="radio-night-mode-scheduled" class="text-sm font-medium text-gray-900 dark:text-gray-300">Scheduled</label>
            <div v-show="nightMode.state === 'scheduled'" class="mt-3">
              <TimeInput v-model="nightMode.startTime" text="Start Time" inputId="night-mode-start" class="mb-3"/>
              <TimeInput v-model="nightMode.endTime" text="End Time" inputId="night-mode-end" />
            </div>
          </div>
        </div>
        <div class="pt-2">
          <ButtonWithLoader type="submit" :loading="loading" />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import ButtonWithLoader from "../ButtonWithLoader.vue";
  import { ref, watch, toRaw } from "vue";
  import type { Band } from "../../types";
  import TimeInput from "../TimeInput.vue";

  const props = defineProps<{
    nightMode: Band["nightMode"];
    loading: boolean;
  }>();

  const defaultNightMode = {
    state: "off" as const,
    startTime: { hour: 20, minute: 0 },
    endTime: { hour: 8, minute: 0 },
  };

  const nightMode = ref(toRaw(props.nightMode) ?? defaultNightMode);

  watch(
    () => props.nightMode,
    nM => nightMode.value = structuredClone(toRaw(nM) ?? defaultNightMode)
  );

  const emit = defineEmits<{
    (e: "save", liftWrist: Exclude<Band["nightMode"], undefined>): void
  }>();

  function onFormSubmit() {
    emit("save", nightMode.value);
  }
</script>