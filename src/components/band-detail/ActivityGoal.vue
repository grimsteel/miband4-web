<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Activity Goal</h2>
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
          <Toggle v-model="goalNotifications" text="Goal Notifications" />
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
  const props = defineProps<{
    activityGoal?: number;
    goalNotifications?: boolean;
    loading: boolean;
  }>();

  const defaultActivityGoal = 10000;
  const defaultGoalNotifications = true;

  const activityGoal = ref(props.activityGoal ?? defaultActivityGoal);
  const goalNotifications = ref(props.goalNotifications ?? defaultGoalNotifications);

  watch(
    () => props.activityGoal,
    aG => activityGoal.value = aG ?? defaultActivityGoal
  );

  watch(
    () => props.goalNotifications,
    gN => goalNotifications.value = gN ?? defaultGoalNotifications
  );

  const emit = defineEmits<{
    (e: "save", activityGoal: number, goalNotifications: boolean): void
  }>();

  function onFormSubmit() {
    emit("save", activityGoal.value, goalNotifications.value);
  }
</script>