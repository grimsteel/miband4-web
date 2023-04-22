<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Activity Goal</h5>
    <form @submit.prevent="onFormSubmit">
      <dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
        <div class="flex flex-col pb-2">
          <dt class="mb-1 text-gray-500 dark:text-gray-400">
            <label for="input-goal">Daily Step Goal</label>
          </dt>
          <dd>
            <input type="number" min="0" max="100000" step="1" 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-amber-500"
              placeholder="10000" required v-model="activityGoal" />
          </dd>
        </div>
        <div class="flex flex-col py-2">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="goalNotifications" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
            <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Goal Notifications</span>
          </label>
        </div>
        <div class="flex flex-col pt-2">
          <button type="submit" class="w-max text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 inline-flex items-center" :disabled="!!loading">
            <template v-if="loading">
              <IconLoader class="inline w-4 h-4 mr-3 text-white animate-spin" />
              Loading...
            </template>
            <template v-else>
              Save
            </template>
          </button>
        </div>
      </dl>
    </form>
  </div>
</template>

<script setup lang="ts">
  import IconLoader from "../icons/IconLoader.vue";
  import { ref, watch } from "vue";
  const props = defineProps<{
    activityGoal?: number;
    goalNotifications?: boolean;
    loading: boolean;
  }>();

  const activityGoal = ref(props.activityGoal);
  const goalNotifications = ref(props.goalNotifications);

  watch(
    () => props.activityGoal,
    aG => activityGoal.value = aG
  );

  watch(
    () => props.goalNotifications,
    gN => goalNotifications.value = gN
  );

  const emit = defineEmits<{
    (e: "save", activityGoal: number, goalNotifications: boolean): void
  }>();

  function onFormSubmit() {
    if (!activityGoal.value || goalNotifications.value === undefined) return;
    emit("save", activityGoal.value, goalNotifications.value);
  }
</script>