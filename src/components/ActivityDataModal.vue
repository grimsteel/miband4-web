<template>
  <div tabindex="-1" role="dialog" aria-modal="true"
    class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center flex">
    <div class="relative p-4 w-full max-w-7xl max-h-full">
      <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <div class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Activity Data</h3>
          <button @click="$emit('before-close')" type="button" data-test="close"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <IconClose class="w-5 h-5" />
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <div>
          <div class="space-y-2">
            <h6 class="text-base font-medium text-black dark:text-white">Filter by date:</h6>
            <div class="flex items-end space-x-3">
              <div>
                <label for="activity-data-filter-from" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">From</label>
                <input ref="startDateEl" v-model="startDateElValue" id="activity-data-filter-from" type="date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
              </div>
              <div>
                <label for="activity-data-filter-to" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">To</label>
                <input ref="endDateEl" v-model="endDateElValue" id="activity-data-filter-to" type="date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required>
              </div>
              <div>
                <ButtonWithLoader :loading="false" text="Go" @click="saveDateFilter" class="border border-green-500" v-show="pickedStartDate && pickedEndDate && pickedStartDate <= pickedEndDate" />
              </div>
            </div>
          </div>
          <Line id="activity-data-chart" :options="chartOptions" :data="chartData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ButtonWithLoader from "./ButtonWithLoader.vue";
  import IconClose from "./icons/IconClose.vue";
  import { computed, ref, watch, type Ref, onMounted, onBeforeUnmount } from "vue";
  import { Line } from "vue-chartjs";
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, type ChartOptions, type ChartData, type Point, PointElement } from 'chart.js';

  ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

  const props = defineProps<{
    startDate?: Date;
    endDate?: Date;
    aggregatedByDay?: boolean;
    activityData: {
      timestamp: Date;
      totalSteps: number;
      averageHeartRate: number;
    }[];
  }>();
  const emit = defineEmits<{
    (e: "before-close"): void;
    (e: "date-filter", startDate: Date, endDate: Date): void;
  }>();
  const startDateEl = ref<HTMLInputElement | null>(null);
  const endDateEl = ref<HTMLInputElement | null>(null);
  const startDateElValue = ref<string>();
  const endDateElValue = ref<string>();
  const colorScheme = ref<"light" | "dark">(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  const scaleColorConfig = computed(() => ({
    grid: {
      color: colorScheme.value === "dark" ? "#374151" : "#e5e7eb",
    },
    ticks: {
      color: colorScheme.value === "dark" ? "#d1d5db" : "#4b5563",
    },
  }));

  const chartOptions = computed<ChartOptions<"line">>(() => ({
    responsive: true,
    color: colorScheme.value === "dark" ? "#d1d5db" : "#4b5563",
    scales: {
      x: scaleColorConfig.value,
      y: {
        ...scaleColorConfig.value,
        type: "linear",
        min: 0,
        position: "left"
      },
      y1: {
        ...scaleColorConfig.value,
        type: "linear",
        min: 0,
        max: 255,
        position: "right",
        grid: {
          drawOnChartArea: false,
        }
      }
    },
  }));

  const dateStringOptions = computed<Intl.DateTimeFormatOptions>(() => (props.aggregatedByDay ? { year: "numeric", month: "short", day: "numeric" }  : { year: "numeric", month: "short", day: "numeric", hour: "numeric" }));

  const chartData = computed<ChartData<"line", (number | Point | null)[], unknown>>(() => {
    return {
      labels: props.activityData.map(({ timestamp }) => timestamp.toLocaleString(undefined, dateStringOptions.value)),
      datasets: [
        {
          data: props.activityData.map(({ totalSteps }) => totalSteps),
          label: "Total Steps",
          backgroundColor: "#f59e0b80",
          borderColor: "#f59e0b",
          yAxisID: "y"
        },
        {
          data: props.activityData.map(({ averageHeartRate }) => averageHeartRate),
          label: "Average Heart Rate",
          backgroundColor: "#ef444480",
          borderColor: "#ef4444",
          yAxisID: "y1"
        },
      ],
    };
  });

  function dateToISODateString(date: Date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  }

  function getComputedDateInput(dateElRef: Ref<string | undefined>) {
    return computed<Date | undefined>({
      get() {
        const startDateString = dateElRef.value;
        return startDateString ? new Date(Date.parse(`${startDateString}T00:00:00`)) : undefined;
      },
      set(newDate: Date | undefined) {
        if (dateElRef.value && newDate)
          dateElRef.value = dateToISODateString(newDate);
      }
    });
  }

  const pickedStartDate = getComputedDateInput(startDateElValue);
  const pickedEndDate = getComputedDateInput(endDateElValue);

  function saveDateFilter() {
    if (startDateEl.value?.reportValidity() && endDateEl.value?.reportValidity()) {
      emit("date-filter", pickedStartDate.value!, pickedEndDate.value!);
    }
  }

  function onPrefersColorSchemeChange(ev: MediaQueryListEvent) {
    colorScheme.value = ev.matches ? "dark" : "light";
  }

  watch([() => props.startDate, () => props.endDate], () => {
    pickedStartDate.value = props.startDate;
    pickedEndDate.value = props.endDate;
  });
  
  onMounted(() => {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onPrefersColorSchemeChange);
  });

  onBeforeUnmount(() => {
    window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", onPrefersColorSchemeChange);
  });
</script>