<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Find My Band</h5>
    <p class="font-normal text-gray-700 dark:text-gray-400 text-sm mb-2">Makes the band vibrate</p>
    <div class="flex flex-col pt-2">
      <ButtonWithLoader type="submit" :loading="loading" text="Find Band" @click="$emit('find-band')"/>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ButtonWithLoader from "../ButtonWithLoader.vue";

  defineProps<{
    loading: boolean;
  }>();
  defineEmits<{
    (e: "find-band"): void
  }>();
</script>