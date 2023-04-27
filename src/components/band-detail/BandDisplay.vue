<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <div class="flex justify-between">
      <h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Band Display</h5>
      <button type="button" @click="expanded = !expanded" class="transition-transform text-gray-800 dark:text-gray-100 hover:text-gray-700 hover:dark:text-gray-200 font-medium rounded-full text-sm p-1.5 text-center inline-flex items-center" :class="{ 'rotate-180': expanded }">
        <IconChevronDown class="w-5 h-5" />
        <span class="sr-only">Expand</span>
      </button>
    </div>
    <div v-show="expanded">
      <ul class="w-full text-sm font-medium text-gray-900 dark:text-white divide-y divide-gray-200 dark:divide-gray-600 mb-3">
        <li class="w-full flex items-center justify-between" v-for="item, i in displayItems">
          <div class="flex items-center pl-3">
            <input :id="`check-display-item-${item.item}`"  v-model="item.enabled" type="checkbox" class="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
            <label :for="`check-display-item-${item.item}`" class="w-full py-3 ml-2 text-sm font-medium" :class="{ 'text-gray-900 dark:text-gray-300': item.enabled, 'text-gray-800 dark:text-gray-400': !item.enabled }">{{ allDisplayItems.get(item.item) }}</label>
          </div>
          <div class="inline-flex rounded-md shadow-sm" role="group">
            <button @click="moveItemDown(i)" v-show="i !== displayItems.length - 1"  type="button" class="p-1.5 text-gray-800 border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-amber-700 focus:z-10 focus:ring-amber-700 focus:text-blue-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-amber-500 dark:focus:text-white" :class="{ 'rounded-r-lg': i === 0 }">
              <IconChevronDown class="w-4 h-4" />
            </button>
            <button @click="moveItemUp(i)" v-show="i !== 0" type="button" class="p-1.5 text-gray-800 border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-amber-700 focus:z-10 focus:ring-amber-700 focus:text-blue-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-amber-500 dark:focus:text-white" :class="{ 'rounded-l-lg': i === displayItems.length - 1 }">
              <IconChevronUp class="w-4 h-4" />
            </button>
          </div>
        </li>
      </ul>
      <div>
        <ButtonWithLoader type="button" :loading="loading" text="Save" @click="save" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type Band, DisplayItem } from "../../types";
  import { ref, toRaw, watch } from "vue";
  import IconChevronDown from "../icons/IconChevronDown.vue";
  import IconChevronUp from "../icons/IconChevronUp.vue";
  import ButtonWithLoader from "../ButtonWithLoader.vue";

  const props = defineProps<{
    loading: boolean;
    bandDisplay: Band["display"];
  }>();
  const emit = defineEmits<{
    (e: "save", displayItems: Exclude<Band["display"], undefined>): void;
  }>();
  const expanded = ref(false);

  const allDisplayItems = new Map([
    [DisplayItem.Status, "Status"],
    [DisplayItem.HeartRate, "Heart Rate"],
    [DisplayItem.Workout, "Workout"],
    [DisplayItem.Weather, "Weather"],
    [DisplayItem.Notifications, "Notifications"],
    [DisplayItem.More, "More"]
  ]);

  const defaultDisplayItems: Band["display"] =
    [...allDisplayItems.keys()].map(key => ({ item: key, enabled: true }));

  const displayItems = ref(structuredClone(toRaw(props.bandDisplay) || defaultDisplayItems));

  watch(
    () => props.bandDisplay,
    () => {
      displayItems.value = structuredClone(toRaw(props.bandDisplay) || defaultDisplayItems);
    }
  );

  function moveItemDown(i: number) {
    const item = displayItems.value[i];
    displayItems.value.splice(i, 1);
    displayItems.value.splice(i + 1, 0, item);
  }

  function moveItemUp(i: number) {
    const item = displayItems.value[i];
    displayItems.value.splice(i, 1);
    displayItems.value.splice(i - 1, 0, item);
  }

  function save() {
    emit("save", displayItems.value);
  }
</script>