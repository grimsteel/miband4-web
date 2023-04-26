<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <div class="flex justify-between">
      <h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Weather</h5>
      <button type="button" @click="expanded = !expanded" class="transition-transform text-gray-800 dark:text-gray-100 hover:text-gray-700 hover:dark:text-gray-200 font-medium rounded-full text-sm p-1.5 text-center inline-flex items-center" :class="{ 'rotate-180': expanded }">
        <IconChevronDown class="w-5 h-5" />
        <span class="sr-only">Expand</span>
      </button>
    </div>
    <form @submit.prevent="saveWeather" class="max-w-md font-medium text-gray-900 dark:text-white mt-3" v-show="expanded">
      <div class="mb-3">
        <label for="input-city" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">City</label>
        <input type="text" id="input-city" v-model="city" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
      </div> 
      <h6 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-2 pb-2 border-b border-gray-200 dark:border-gray-600">Current Weather</h6>
      <div class="mb-3 flex flex-row gap-3">
        <div class="grow-[2]">
          <label for="input-current-temp" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Temperature</label>
          <input type="number" id="input-current-temp" min="-128" max="127" step="1" v-model="currentWeather.temperature" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
        </div>
        <div class="grow">
          <label for="input-aqi" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">AQI</label>
          <input type="number" id="input-aqi" min="0" max="255" step="1" v-model="currentWeather.aqi" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
        </div>
        <div>
          <span class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Icon</span>
          <WeatherIconDropdown v-model="currentWeather.icon" />
        </div>
      </div>
      <div class="mb-2 pb-2 border-b border-gray-200 dark:border-gray-600 flex justify-between">
        <h6 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Forecast</h6>
        <button title="Add Day" type="button" v-if="forecast.length < 7" @click="addForecastItem" class="text-gray-800 dark:text-gray-100 hover:text-gray-700 hover:dark:text-gray-200 font-medium rounded-full text-sm p-1.5 text-center inline-flex items-center">
          <IconAdd class="w-5 h-5" />
          <span class="sr-only">Add Day</span>
        </button>
      </div>
      <div class="divide-y divide-gray-200 dark:divide-gray-600 mb-2">
        <div v-for="day, i in forecast" :class="{ 'mb-3': i !== forecast.length - 1, 'pt-3': i !== 0 }">
          <div class="flex flex-row gap-3 mb-2">
            <div class="grow">
              <label :for="`input-forecast-text-${i}`" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
              <input type="text" :id="`input-forecast-text-${i}`" v-model="day.text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
            </div>
            <button @click="removeForecastItem(i)" v-if="forecast.length > 1" type="button" class="transition-colors text-red-700 border border-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center mt-7 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800 dark:hover:bg-red-500">
              <IconClose class="w-5 h-5" />
              <span class="sr-only">Remove</span>
            </button>
          </div>
          <div class="flex flex-row gap-3">
            <div class="grow">
              <label :for="`input-forecast-low-${i}`" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Low</label>
              <input type="number" :id="`input-forecast-low-${i}`" min="-128" max="127" step="1" v-model="day.low" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
            </div>
            <div class="grow">
              <label :for="`input-forecast-high-${i}`" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">High</label>
              <input type="number" i:id="`input-forecast-high-${i}`" min="-128" max="127" step="1" v-model="day.high" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500" required>
            </div>
            <div>
              <span class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Icon</span>
              <WeatherIconDropdown v-model="day.icon" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <ButtonWithLoader type="submit" :loading="loading" text="Save" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import WeatherIconDropdown from '../WeatherIconDropdown.vue';
  import ButtonWithLoader from '../ButtonWithLoader.vue';
  import IconChevronDown from "../icons/IconChevronDown.vue";
  import IconAdd from "../icons/IconAdd.vue";
  import IconClose from "../icons/IconClose.vue";
  import { ref } from 'vue';
  import type { WeatherData } from '../../types';
  const currentWeather = ref({
    temperature: 0,
    aqi: 0,
    icon: 0x00
  });
  const city = ref('');
  const initialForecastItem = {
    high: 0,
    low: 0,
    icon: 0x00,
    text: ''
  };
  const forecast = ref([structuredClone(initialForecastItem)]);
  const expanded = ref(false);
  defineProps<{
    loading: boolean;
  }>();
  const emit = defineEmits<{
    (e: "save", data: WeatherData): void;
  }>();

  function saveWeather() {
    if (forecast.value.length < 1 || forecast.value.length > 7) return;
    const weatherData: WeatherData = {
      city: city.value,
      airIndex: currentWeather.value.aqi,
      currentTemp: currentWeather.value.temperature,
      currentIcon: currentWeather.value.icon,
      forecast: forecast.value
    };

    emit('save', weatherData);
  }

  function addForecastItem() {
    forecast.value = [...forecast.value, structuredClone(initialForecastItem)]
  }

  function removeForecastItem(index: number) {
    if (forecast.value.length <= 1) return;
    forecast.value = forecast.value.filter((_, i) => i !== index);
  }
</script>