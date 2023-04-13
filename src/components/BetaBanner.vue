<template>
  <div id="beta-banner" tabindex="-1" class="fixed z-50 flex flex-col md:flex-row justify-between w-[calc(100%-2rem)] p-4 -translate-x-1/2 bg-white border border-gray-100 rounded-lg shadow-sm lg:max-w-7xl left-1/2 bottom-6 dark:bg-gray-700 dark:border-gray-600">
    <div class="flex flex-col items-start mb-3 mr-4 md:items-center md:flex-row md:mb-0">
        <span class="flex items-center mb-2 border-gray-200 md:pr-4 md:mr-4 md:border-r md:mb-0 dark:border-gray-600">
            <span class="self-center text-lg font-semibold whitespace-nowrap dark:text-white">This is a beta release</span>
        </span>
        <p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">There are almost certaintly bugs, and many features are incomplete. Star the GitHub Repo to show your support!</p>
    </div>
    <div class="flex items-center flex-shrink-0">
        <a href="https://github.com/grimsteel/miband4-web" class="inline-flex justify-center items-center px-5 py-2 mr-2 text-xs font-medium text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 dark:bg-yellow-500 dark:hover:bg-yellow-600 focus:outline-none dark:focus:ring-yellow-800">
          <IconStar class="w-4 h-4 mr-1" />
          Star
        </a>
        <button data-dismiss-target="#beta-banner" type="button" class="absolute top-2.5 right-2.5 md:relative md:top-auto md:right-auto flex-shrink-0 inline-flex justify-center items-center text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white">
            <svg aria-hidden="true" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
            <span class="sr-only">Close banner</span>
        </button>
    </div>
  </div>
</template>
<script setup>
  import { Dismiss } from 'flowbite';
  import { onMounted } from 'vue';
  import IconStar from './icons/IconStar.vue';

  const emit = defineEmits(["close"]);

  onMounted(() => {
    new Dismiss(document.getElementById("beta-banner"), document.querySelector('[data-dismiss-target="#beta-banner"]'), {
      onHide: () => emit("close")
    });
  });
</script>