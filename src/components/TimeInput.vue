<template>
  <div>
    <label :for="inputId" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{ text }}</label>
    <input type="time" :valueAsNumber="inputValue" @input="inputValue = ($event.target as HTMLInputElement).valueAsNumber" :id="inputId" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { Time } from '../types';

  const props = defineProps<{
    modelValue: Time;
    text: string;
    inputId: string;
  }>();
  const emit = defineEmits<{
    (e: "update:modelValue", value: Time): void
  }>();

  const inputValue = computed({
    get() {
      return (props.modelValue.hour * 60 + props.modelValue.minute) * 60 * 1000;
    },
    set(value: number) {
      const valueAsDate = new Date(value);
      const newTime = {
        hour: valueAsDate.getUTCHours(),
        minute: valueAsDate.getUTCMinutes(),
      };
      emit('update:modelValue', newTime);
    },
  });
</script>