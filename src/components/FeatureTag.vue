<template>
  <span class="text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md mb-2" :class="classes">
    <component :is="icon" class="w-3 h-3 mr-1" />
    {{ text }}
  </span>
</template>
<script setup lang="ts">
  defineProps({
    classes: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    icon: {
      type: Object,
      required: true
    }
  })
</script>