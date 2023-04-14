<template>
  <li>
    <router-link v-bind="$props" custom v-slot="{ isActive, href, navigate }">
      <a
        class="block py-2 pl-3 pr-4 rounded md:p-0"
        v-bind="$attrs"
        :href="href"
        @click="navigate"
        :class="isActive ?
          'text-white bg-gradient-to-tr from-orange-400 to-pink-500 md:bg-clip-text md:font-bold md:text-transparent hover:saturate-150 transition-[filter]' :
          'text-gray-700 hover:bg-gray-100 md:hover:bg-transparent md:hover:text-orange-700 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'">
        <slot />
      </a>
    </router-link>
  </li>
</template>
<script setup lang="ts">
  // @ts-nocheck
  import { RouterLink } from 'vue-router';
  
  defineProps(RouterLink.props)
</script>