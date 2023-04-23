<template>
  <label class="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" :checked="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)" class="sr-only peer">
    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-600"></div>
    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{{ text }}</span>
  </label>
</template>

<script setup lang="ts">
  defineProps<{
    modelValue: boolean;
    text: string;
  }>();
  defineEmits<{
    (e: "update:modelValue", value: boolean): void
  }>();
</script>