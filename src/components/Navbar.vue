<template>
  <nav class="px-2 sm:px-4 py-2.5 border-gray-200 bg-orange-100 dark:bg-gray-800 dark:border-gray-900">
    <div class="container flex flex-wrap items-center justify-between mx-auto">
      <RouterLink to="/" class="flex items-center">
        <img src="/icons/icon-192.png" class="h-6 mr-3 sm:h-9" alt="Flowbite Logo" />
        <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-orange-50">Mi Band 4 Web</span>
      </RouterLink>
      <div class="flex md:order-2">
        <button type="button" class="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-3 md:mr-0">
          <IconGithub class="w-4 h-4 mr-2 ml-1" />
          GitHub
        </button>
        <button data-collapse-toggle="navbar-cta" type="button" class="inline-flex items-center p-2 text-sm text-orange-900 rounded-lg md:hidden hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:text-orange-50 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-cta" aria-expanded="false">
          <span class="sr-only">Open main menu</span>
          <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
        </button>
      </div>
      <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
        <ul class="flex flex-col p-4 mt-4 border border-orange-200 rounded-lg bg-orange-50 md:bg-orange-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 dark:bg-gray-800 md:dark:bg-gray-800 dark:border-gray-700">
          <NavbarLink to="/">Home</NavbarLink>
          <NavbarLink to="/about/">About</NavbarLink>
          <li>
            <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Services</a>
          </li>
          <li>
            <a href="#" class="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
  import { onMounted } from 'vue';
  import { initCollapses } from 'flowbite';
  import { RouterLink } from 'vue-router'
  import NavbarLink from './NavbarLink.vue';
import IconGithub from './icons/IconGithub.vue';

  onMounted(() => {
    initCollapses();
  });
</script>