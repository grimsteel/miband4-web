<template>
  <div tabindex="-1" role="dialog" aria-modal="true" class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center flex">
    <div class="relative w-full max-w-2xl max-h-full">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Oh no!</h3>
            <button @click="$emit('before-close')" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
              <IconClose class="w-5 h-5" fill="currentColor" />
              <span class="sr-only">Close modal</span>
            </button>
        </div>
        <div class="p-6 space-y-6">
          <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Your browser doesn't support the Web Bluetooth API! You'll need to use a browser that does. <a href="https://github.com/WebBluetoothCG/web-bluetooth/blob/main/implementation-status.md" target="_blank" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">More Info: browser implementation status</a>.</p>
        </div>
        <div class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
          <button @click="$emit('before-close')" type="button" class="text-white bg-amber-500 hover:bg-amber-600 focus:ring-4 focus:outline-none focus:ring-amber-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-amber-600 dark:hover:bg-amber-600 dark:focus:ring-amber-800">Okay</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import IconClose from "./icons/IconClose.vue";
  defineEmits(["before-close"]);
</script>