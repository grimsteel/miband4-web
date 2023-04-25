<template>
  <button ref="dropdownToggle" class="inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600" type="button">
    <div class="inline-flex items-center">
      <span class="rounded-md mr-2 weather-icon" :class="WeatherIcons[currentIconIndex].icon" style="--intended-icon-dimensions: 16;"></span>
      {{ WeatherIcons[currentIconIndex].name }}
    </div>
  </button>
  <div ref="dropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-64 dark:bg-gray-700">
    <ul class="h-72 overflow-y-auto custom-scrollbar py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="states-button">
      <li v-for="icon, i in WeatherIcons">
        <button @click="onBtnClick(i)" type="button" class="inline-flex w-full px-4 py-2 text-md text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
          <div class="inline-flex items-center">
            <span class="rounded-md mr-2 weather-icon" :class="icon.icon" style="--intended-icon-dimensions: 16;"></span>
            {{ icon.name }}
          </div>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { WeatherIcons } from '../types';
  import { Dropdown } from 'flowbite';
  const currentIconIndex = ref<number>(0);
  const dropdown = ref<HTMLDivElement | null>(null);
  const dropdownToggle = ref<HTMLButtonElement | null>(null);
  const dropdownObj = ref<Dropdown | null>(null);
  onMounted(() => {
    dropdownObj.value = new Dropdown(dropdown.value, dropdownToggle.value);
  });

  function onBtnClick(index: number) {
    currentIconIndex.value = index;
    dropdownObj.value?.hide();
  }
</script>