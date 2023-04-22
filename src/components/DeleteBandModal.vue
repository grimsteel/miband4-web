
<template>
  <div ref="modalRoot" tabindex="-1" aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
    <div class="relative p-4 w-full max-w-md h-full md:h-auto">
      <div class="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <button type="button" @click="$emit('before-close', false)"
          class="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
          <IconClose class="w-5 h-5" />
          <span class="sr-only">Close modal</span>
        </button>
        <svg class="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" aria-hidden="true" fill="currentColor"
          viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"></path>
        </svg>
        <p class="mb-4 text-gray-500 dark:text-gray-300">Are you sure you want to delete {{ band?.nickname || "this band" }}?</p>
        <div class="flex justify-center items-center space-x-4">
          <button @click="$emit('before-close', false)" type="button"
            class="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
            No, cancel
          </button>
          <button @click="$emit('before-close', true)" type="button"
            class="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
            Yes, I'm sure
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Modal } from 'flowbite';
  import IconClose from './icons/IconClose.vue';
  import { onMounted, ref, watch } from 'vue';

  defineEmits<{
    (e: 'before-close', shouldDelete: boolean): void;
  }>();
  const props = defineProps<{
    show: boolean;
    band?: { nickname: string; id: number; deviceId: string; }
  }>();

  const modalRoot = ref<HTMLElement>();
  const modal = ref<Modal>();

  onMounted(() => {
    modal.value = new Modal(modalRoot.value, {});
  });

  watch(
    () => props.show,
    (show) => {
      if (show) modal.value?.show();
      else modal.value?.hide();
    }
  );
</script>