<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Band Lock</h2>
    <form @submit.prevent="onFormSubmit" class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div class="flex flex-col py-2">
        <Toggle v-model="bandLockConfig.enabled" text="Enabled" />
      </div>
      <div class="py-2" v-show="bandLockConfig.enabled">
        <span class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">PIN</span>
        <div class="flex items-center justify-between gap-2">
          <input type="number" step="1" min="1" max="4" v-model="bandLockConfig.pin[0]"  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
          <input type="number" step="1" min="1" max="4" v-model="bandLockConfig.pin[1]"  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
          <input type="number" step="1" min="1" max="4" v-model="bandLockConfig.pin[2]"  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
          <input type="number" step="1" min="1" max="4" v-model="bandLockConfig.pin[3]"  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
        </div>
      </div>
      <div class="flex flex-col pt-2">
        <ButtonWithLoader type="submit" :loading="loading" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import ButtonWithLoader from "../ButtonWithLoader.vue";
  import { ref, watch, toRaw } from "vue";
  import Toggle from "../Toggle.vue";
  import type { Band } from "../../types";

  const props = defineProps<{
    bandLock: Band["bandLock"];
    loading: boolean;
  }>();

  const defaultBandLock = { enabled: false, pin: [1, 1, 1, 1] as [1, 1, 1, 1] };

  const bandLockConfig = ref(structuredClone(toRaw(props.bandLock) ?? defaultBandLock));

  watch(
    () => props.bandLock,
    bL => bandLockConfig.value = structuredClone(toRaw(bL) ?? defaultBandLock)
  );

  const emit = defineEmits<{
    (e: "save", bandLock: Exclude<Band["bandLock"], undefined>): void
  }>();

  function onFormSubmit() {
    emit("save", bandLockConfig.value);
  }
</script>