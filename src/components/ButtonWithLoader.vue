<template>
  <button :type="type ?? 'button'" @click="handleClick" class="w-max text-white focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 inline-flex items-center" :class="classes || defaultClasses" :disabled="loading">
    <template v-if="loading">
      <IconLoader class="inline w-4 h-4 mr-3 text-white animate-spin" />
      Loading...
    </template>
    <template v-else>
      {{ text ?? "Save" }}
    </template>
  </button>
</template>

<script setup lang="ts">
  import IconLoader from "./icons/IconLoader.vue";
  const props = defineProps<{
    loading: boolean;
    text?: string;
    type?: "submit" | "button";
    classes?: string;
  }>();
  const defaultClasses = "bg-green-700 hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800";
  const emit = defineEmits(["click"]);
  function handleClick() {
    if (!props.loading)
      emit("click");
  }
</script>