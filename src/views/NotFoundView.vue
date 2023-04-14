<template>
  <main class="grow">
    <section class="bg-white dark:bg-gray-900 h-full flex items-center">
        <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div class="mx-auto max-w-screen-sm text-center">
                <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-amber-500">404</h1>
                <p class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">Page not found</p>
                <RouterLink to="/" class="inline-flex text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-amber-900 my-4">Back to Homepage</RouterLink>
            </div>   
        </div>
    </section>
  </main>
</template>
<script setup lang="ts">
  import { RouterLink } from 'vue-router'
</script>