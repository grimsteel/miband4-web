<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Idle Alerts</h2>
    <form @submit.prevent="onFormSubmit">
      <dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
        <div class="flex flex-col pb-2">
          <Toggle v-model="idleAlertsConfig.enabled" text="Enabled" />
        </div>
        <div class="flex flex-col py-2" v-show="idleAlertsConfig.enabled">
          <TimeInput v-model="idleAlertsConfig.startTime" text="Start Time" inputId="idle-alerts-start" class="mb-3"/>
          <TimeInput v-model="idleAlertsConfig.endTime" text="End Time" inputId="idle-alerts-end" class="mb-3" />
          <p v-if="timeAsNumber(idleAlertsConfig.startTime) >= timeAsNumber(idleAlertsConfig.endTime) " class="text-sm text-red-600 dark:text-red-500" data-test="invalid-time-range">The start time must be before the end time.</p>
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
  import { ref, watch } from "vue";
  import Toggle from "../Toggle.vue";
  import type { IdleAlertsConfig, Time } from "../../types";
  import TimeInput from "../TimeInput.vue";

  const props = defineProps<{
    idleAlerts?: IdleAlertsConfig;
    loading: boolean;
  }>();

  const defaultIdleAlerts = { enabled: false, startTime: { hour: 9, minute: 0 }, endTime: { hour: 17, minute: 0 } };

  const idleAlertsConfig = ref(props.idleAlerts ?? defaultIdleAlerts);

  watch(
    () => props.idleAlerts,
    iA => idleAlertsConfig.value = iA ?? defaultIdleAlerts
  );

  const emit = defineEmits<{
    (e: "save", idleAlerts: IdleAlertsConfig): void
  }>();

  function onFormSubmit() {
    if (idleAlertsConfig.value === undefined || timeAsNumber(idleAlertsConfig.value.startTime) >= timeAsNumber(idleAlertsConfig.value.endTime)) return;
    emit("save", idleAlertsConfig.value);
  }

  function timeAsNumber(time: Time) {
    return time.hour * 60 + time.minute; // this is in minutes
  }
</script>