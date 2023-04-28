<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Lift Wrist to View Info</h5>
    <form @submit.prevent="onFormSubmit">
      <dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
        <div class="flex flex-col pb-2">
          <Toggle v-model="liftWrist.enabled" text="Enabled" />
        </div>
        <div class="flex flex-col py-2" v-show="liftWrist.enabled">
          <TimeInput v-model="liftWrist.startTime" text="Start Time" inputId="idle-alerts-start" class="mb-3"/>
          <TimeInput v-model="liftWrist.endTime" text="End Time" inputId="idle-alerts-end" class="mb-3" />
          <p class="font-normal text-gray-700 dark:text-gray-400 text-sm max-w-md">Set both times to 12:00 AM to enable this feature for the whole day.</p>
        </div>
        <div class="flex flex-col py-2" v-show="liftWrist.enabled">
          <h3 class="mb-4 font-semibold text-gray-900 dark:text-white">Response Speed</h3>
          <div class="flex">
            <div class="flex items-center mr-4">
              <input id="lift-wrist-response-speed-normal" v-model="liftWrist.responseSpeed" type="radio" value="normal" name="lift-wrist-response-speed" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="lift-wrist-response-speed-normal" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Normal</label>
            </div>
            <div class="flex items-center mr-4">
              <input id="lift-wrist-response-speed-sensitive" v-model="liftWrist.responseSpeed" type="radio" value="sensitive" name="lift-wrist-response-speed" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="lift-wrist-response-speed-sensitive" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Sensitive</label>
            </div>
          </div>
        </div>
        <div class="flex flex-col pt-2">
          <ButtonWithLoader type="submit" :loading="loading" />
        </div>
      </dl>
    </form>
  </div>
</template>

<script setup lang="ts">
  import ButtonWithLoader from "../ButtonWithLoader.vue";
  import { ref, watch, toRaw } from "vue";
  import Toggle from "../Toggle.vue";
  import type { Band, Time } from "../../types";
  import TimeInput from "../TimeInput.vue";

  const props = defineProps<{
    liftWrist: Band["liftWrist"];
    loading: boolean;
  }>();

  const defaultLiftWrist = { enabled: false, startTime: { hour: 0, minute: 0 }, endTime: { hour: 0, minute: 0 }, responseSpeed: "normal" as "normal" };

  const liftWrist = ref(toRaw(props.liftWrist) ?? defaultLiftWrist);

  watch(
    () => props.liftWrist,
    lW => liftWrist.value = structuredClone(toRaw(lW) ?? defaultLiftWrist)
  );

  const emit = defineEmits<{
    (e: "save", liftWrist: Exclude<Band["liftWrist"], undefined>): void
  }>();

  function onFormSubmit() {
    emit("save", liftWrist.value);
  }

  function timeAsNumber(time: Time) {
    return time.hour * 60 + time.minute; // this is in minutes
  }
</script>