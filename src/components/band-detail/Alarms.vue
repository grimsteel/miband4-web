<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 h-max">
    <div class="flex items-center justify-between mb-3">
      <h5 class="text-2xl font-bold tracking-tight leading-none text-gray-900 dark:text-white">{{ cardTitle }}</h5>
      <button v-if="currentScreen === 'edit'" @click="showListScreen" type="button" data-test='cancel' class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
        <IconClose class="w-4 h-4" />
        <span class="sr-only">Cancel</span>
      </button>
    </div>
    <template v-if="currentScreen === 'list'">
      <template v-if="!loading">
        <div class="max-w-md font-medium text-gray-900 dark:text-white mb-2 divide-y divide-gray-200 dark:divide-gray-600" v-if="alarms?.length">
          <button data-test="alarm" type="button" class="w-full p-3 rounded-md text-left hover:bg-gray-100 hover:dark:bg-gray-700" v-for="alarm in alarms || []" @click="showEditScreen(alarm)">
            <p class="mb-1 font-semibold" data-test="time">{{ new Date(0, 0, 0, alarm.time.hour, alarm.time.minute).toLocaleTimeString(undefined, { timeStyle: "short" }) }}</p>
            <p class="text-gray-500 dark:text-gray-400" data-test="days">{{ getRepetitionDescriptiveText(alarm) }}</p>
          </button>
        </div>
        <p class="font-normal text-gray-700 dark:text-gray-400 text-sm max-w-md mb-2" v-else>Not seeing your alarms? Alarms on the band are write only, so we can't track modifications made outside of this app.</p>
        <div>
          <ButtonWithLoader type="button" :loading="false" text="Add Alarm" data-test="add-alarm" v-if="!alarms || alarms.length < 0xf" @click="showEditScreen(null)" />
          <ButtonWithLoader type="button" :loading="false" text="Delete" v-if="currentAlarm" classes="bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-900" @click="deleteAlarm" />
        </div>
      </template>
      <LoaderPlaceholder v-else class="mb-2" />
    </template>
    <template v-else-if="currentScreen === 'edit'">
      <TimeInput input-id="alarm-time" v-model="alarmTime" text="Alarm Time" class="mb-3" />
      <div class="mb-4">
        <h3 class="mb-2 text-sm font-medium text-gray-900 dark:text-white">Repeat:</h3>
        <ul class="grid w-full gap-3 grid-cols-2">
          <li v-for="weekday in allWeekdays">
            <input type="checkbox" :id="`weekday-${Weekday[weekday]}`" :value="Weekday[weekday]" class="hidden peer"
              :checked="selectedWeekdays.has(Weekday[weekday]) === true" @input="setSelectedWeekday(Weekday[weekday], ($event.target as HTMLInputElement).checked)">
            <label :for="`weekday-${Weekday[weekday]}`" class="inline-flex items-center justify-between w-full p-2 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-amber-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">                           
              <div class="block font-semibold">{{ weekday }}</div>
            </label>
          </li>
        </ul>
        <p v-if="selectedWeekdays.size < 1" class="text-sm text-red-600 dark:text-red-500 mt-2" data-test="no-weekdays-selected">You must select at least one weekday.</p>
      </div>
      <div class="mb-4 h-6">
        <Toggle v-model="alarmEnabled" text="Enabled" data-test="enabled" />
      </div>
      <div>
        <ButtonWithLoader type="button" :loading="false" text="Save" @click="saveAlarm" data-test="save" />
        <ButtonWithLoader type="button" :loading="false" text="Delete" v-if="currentAlarm" data-text="delete" classes="bg-red-700 hover:bg-red-800 focus:ring-red-300 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-900" @click="deleteAlarm" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import ButtonWithLoader from "../ButtonWithLoader.vue";
  import { Weekday, type Alarm, type Time } from "../../types";
  import { computed, ref, toRaw } from "vue";
  import { getRepetitionDescriptiveText, enumKeys } from "../../utils";
  import TimeInput from "../TimeInput.vue";
  import Toggle from "../Toggle.vue";
  import IconClose from "../icons/IconClose.vue";
  import LoaderPlaceholder from "../LoaderPlaceholder.vue";

  const props = defineProps<{
    alarms?: Alarm[]
    loading: boolean;
  }>();

  const emit = defineEmits<{
    (e: "save", alarm: Alarm): void
  }>();

  const allWeekdays = enumKeys(Weekday).slice(0, 7); // remove "Everyday" from the list

  const defaultTime = { hour: 0, minute: 0 };
  const defaultEnabled = true;
  const defaultWeekdays = new Set([Weekday.Monday, Weekday.Tuesday, Weekday.Wednesday, Weekday.Thursday, Weekday.Friday]);

  const currentScreen = ref<"list" | "edit">("list");
  const currentAlarm = ref<Alarm | null>(null);
  const alarmTime = ref<Time>(defaultTime);
  const alarmEnabled = ref(defaultEnabled);
  const selectedWeekdays = ref<Set<Weekday>>(structuredClone(defaultWeekdays));

  const cardTitle = computed(() => {
    if (currentScreen.value === "list") return "Alarms";
    if (currentScreen.value === "edit" && currentAlarm.value) return "Edit Alarm";
    return "Add Alarm";
  });

  function showEditScreen(alarm: Alarm | null) {
    currentAlarm.value = alarm;
    alarmTime.value = alarm?.time ?? defaultTime;
    alarmEnabled.value = alarm?.enabled ?? defaultEnabled;
    selectedWeekdays.value = structuredClone(toRaw(alarm?.days) ?? defaultWeekdays);
    currentScreen.value = "edit";
  }

  function showListScreen() {
    currentScreen.value = "list";
    currentAlarm.value = null;
  }

  function setSelectedWeekday(weekday: Weekday, selected: boolean) {
    if (selected) selectedWeekdays.value.add(weekday);
    else selectedWeekdays.value.delete(weekday);
  }

  function getNewAlarmId() {
    const ids = props.alarms?.map(alarm => alarm.id) ?? [];
    for (let i = 0; i < 0xf; i++)
      if (!ids.includes(i)) return i;
    return null;
  }

  async function saveAlarm() {
    if (document.querySelector<HTMLInputElement>("#alarm-time")?.reportValidity() && selectedWeekdays.value.size >= 1) {
      const time = toRaw(alarmTime.value);
      const days = selectedWeekdays.value.size === 7 ? new Set([Weekday.Everyday]) : toRaw(selectedWeekdays.value);
      if (currentAlarm.value) {
        const updatedAlarm: Alarm = {
          time,
          enabled: alarmEnabled.value,
          days,
          id: currentAlarm.value.id
        };
        emit("save", updatedAlarm);
      } else {
        const id = getNewAlarmId();
        if (id === null) return;
        const newAlarm: Alarm = {
          time,
          enabled: alarmEnabled.value,
          days,
          id: id
        };
        emit("save", newAlarm);
      }
      showListScreen();
    }
  }

  async function deleteAlarm() {
    if (currentAlarm.value) {
      emit("save", { ...currentAlarm.value, days: new Set() }); // delete the alarm by setting its days to an empty set
      showListScreen();
    }
  }
</script>