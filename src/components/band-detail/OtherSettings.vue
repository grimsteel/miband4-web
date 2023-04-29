<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Other Settings</h2>
    <form @submit.prevent="onFormSubmit">
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Distance Unit</h3>
      <div class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700 mb-3">
        <div class="flex items-center pb-2">
          <input v-model="distanceUnit" id="radio-distance-unit-miles" type="radio" value="miles" name="radio-distance-unit" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
          <label for="radio-distance-unit-miles" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Miles</label>
        </div>
        <div class="flex items-center py-2">
          <input v-model="distanceUnit" id="radio-distance-unit-km" type="radio" value="km" name="radio-distance-unit" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
          <label for="radio-distance-unit-km" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">KM</label>
        </div>
      </div>
      <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Band Location</h3>
      <div class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700 mb-3">
        <div class="flex items-center pb-2">
          <input v-model="bandLocation" id="radio-location-left" type="radio" value="left" name="radio-location" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
          <label for="radio-location-left" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Left Wrist</label>
        </div>
        <div class="flex items-center py-2">
          <input v-model="bandLocation" id="radio-location-right" type="radio" value="right" name="radio-location" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
          <label for="radio-location-right" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Right Wrist</label>
        </div>
      </div>
      <div>
        <ButtonWithLoader type="submit" :loading="loading" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import ButtonWithLoader from "../ButtonWithLoader.vue";
  import { ref, watch } from "vue";

  const props = defineProps<{
    distanceUnit?: "miles" | "km";
    bandLocation?: "left" | "right";
    loading: boolean;
  }>();

  const defaultDistanceUnit = "miles";
  const defaultBandLocation = "left";

  const distanceUnit = ref(props.distanceUnit ?? defaultDistanceUnit);
  const bandLocation = ref(props.bandLocation ?? defaultBandLocation);

  watch(
    () => props.distanceUnit,
    dU => distanceUnit.value = dU ?? defaultDistanceUnit
  );

  watch(
    () => props.bandLocation,
    bL => bandLocation.value = bL ?? defaultBandLocation
  );

  const emit = defineEmits<{
    (e: "save", distanceUnit: "miles" | "km", bandLocation: "left" | "right"): void
  }>();

  function onFormSubmit() {
    emit("save", distanceUnit.value, bandLocation.value);
  }
</script>