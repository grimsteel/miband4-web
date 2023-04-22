<template>
  <main class="grow bg-gray-50 dark:bg-gray-900">
    <section class="flex h-full flex-col py-8 px-4 mx-2 max-w-full">
      <h1 class="mb-6 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">{{ currentBand?.nickname || "Loading band..." }}</h1>
      <h2 class="text-2xl tracking-tight font-bold text-gray-900 dark:text-white">Fitness</h2>
      <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-12 md:space-y-0">
        <Status v-bind="status" />
        <ActivityData :latest-activity-timestamp="currentBand?.latestActivityTimestamp" :loading="activityDataLoadingStatus" @fetch-data="syncActivityData" />
        <HeartRate />
        <ActivityGoal v-bind="activityGoal" @save="saveActivityGoal" />
      </div>
      <h2 class="text-2xl tracking-tight font-bold text-gray-900 dark:text-white">Utilities</h2>
      <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <h2 class="text-2xl tracking-tight font-bold text-gray-900 dark:text-white">System</h2>
      <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-12 md:space-y-0">
        <DeviceInfo v-bind="deviceInfo" />
        <BatteryInfo v-bind="batteryInfo" />
        <BandTime v-bind="bandTime" @sync="syncBandTime" />
      </div>
    </section>
    <TheNotSupportedModal @before-close="showNotSupportedModal = false" :show="showNotSupportedModal" />
    <ReauthorizeModal @before-close="onReauthorizeComplete" :show="showReauthorizeModal" :target-device="currentBand" />
    <div ref="saveToastRoot" id="save-toast" class="fixed right-4 bottom-2 hidden items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
      <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
        <IconCheck class="w-5 h-5" />
        <span class="sr-only">Check icon</span>
      </div>
      <div class="ml-3 text-sm font-normal">Saved successfully</div>
      <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#save-toast" aria-label="Close">
          <span class="sr-only">Close</span>
          <IconClose class="w-5 h-5" />
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import TheNotSupportedModal from "../components/TheNotSupportedModal.vue";
  import { useBandsStore } from "../pinia-stores";
  import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
  import { BluetoothDeviceWrapper, authKeyStringToKey, authenticate, getActivityData, getBatteryLevel, getCurrentTime, getDeviceInfo, getSteps, setActivityGoal, setCurrentTime, setGoalNotifications, webBluetoothSupported } from "../band-connection";
  import ReauthorizeModal from "../components/ReauthorizeModal.vue";
  import DeviceInfo from "../components/band-detail/DeviceInfo.vue";
  import Status from "../components/band-detail/Status.vue";
  import BatteryInfo from "../components/band-detail/BatteryInfo.vue";
  import type { Band } from "../types";
  import { addActivityData, getBand } from "../local-db";
  import ActivityData from "../components/band-detail/ActivityData.vue";
  import HeartRate from "../components/band-detail/HeartRate.vue";
  import ActivityGoal from "../components/band-detail/ActivityGoal.vue";
  import BandTime from "../components/band-detail/BandTime.vue";
  import IconCheck from "../components/icons/IconCheck.vue";
  import IconClose from "../components/icons/IconClose.vue";
  import { initDismisses } from "flowbite";

  const bandsStore = useBandsStore();
  const oneDay = 1000 * 60 * 60 * 24;
  
  const showNotSupportedModal = ref(false);
  const showReauthorizeModal = ref(false);
  const currentBand = ref<Band>();
  const currentDevice = ref<BluetoothDeviceWrapper>();
  const saveToastRoot = ref<HTMLElement>();
  const deviceInfo = ref<{
    macAddress: string;
    firmwareVersion: string;
    hardwareRevision: string;
    vendorId: number;
    productId: number;
    productVersion: number;
  }>();
  const status = ref<{
    steps: number;
    meters: number;
    calories: number;
  }>();
  const batteryInfo = ref<{
    batteryLevel: number;
    lastOff: Date;
    lastLevel: number;
    lastCharge: Date;
  }>();
  const activityGoal = ref<{
    activityGoal?: number;
    goalNotifications?: boolean;
    loading: boolean;
  }>({ loading: false });
  const bandTime = ref<{
    time?: Date;
    loading: boolean;
  }>({ loading: false });
  const activityDataLoadingStatus = ref<number>();
  const route = useRoute();
  const router = useRouter();
  const bandNotFound = () => {
    const currentPathname = window.location.pathname;
    router.replace({ name: "not-found" }).then(() => {
      history.replaceState({}, "", currentPathname);
    });
  }

  async function showDetails() {
    if (!currentBand.value || !currentDevice.value) return;
    const authKey = await authKeyStringToKey(currentBand.value.authKey);
    await authenticate(currentDevice.value!, authKey);
    deviceInfo.value = await getDeviceInfo(currentDevice.value);
    status.value = await getSteps(currentDevice.value);
    batteryInfo.value = await getBatteryLevel(currentDevice.value);
    bandTime.value.time = await getCurrentTime(currentDevice.value);
  }

  async function onReauthorizeComplete(success: boolean, newDevice?: BluetoothDevice) {
    showReauthorizeModal.value = false;
    if (!currentBand.value) return;
    if (success && newDevice) {
      await bandsStore.removeAuthorizedDevice(currentBand.value.deviceId);
      bandsStore.addAuthorizedDevice(newDevice);
      await bandsStore.updateBandForId(currentBand.value.id, { deviceId: newDevice.id });
      currentDevice.value = new BluetoothDeviceWrapper(newDevice);
      await showDetails();
    }
  }

  function showToast() {
    if (!saveToastRoot.value) return;
    const toast = saveToastRoot.value;
    toast.classList.remove("hidden");
    toast.classList.add("flex");
    setTimeout(() => {
      toast.classList.remove("flex");
      toast.classList.add("hidden");
    }, 3000);
  }

  async function syncActivityData() {
    await refreshBand();
    if (!currentBand.value || !currentDevice.value) return;
    const band = currentBand.value;

    const fetchFrom = band.latestActivityTimestamp ?
      new Date(band.latestActivityTimestamp.getFullYear(), band.latestActivityTimestamp.getMonth(), band.latestActivityTimestamp.getDate()) : // fetch from the beginning of the day of the latest activity
      new Date(Date.now() - oneDay * 7 * 8); // the band stores approximately 8 weeks of data

    const oneDayAgo = new Date(Date.now() - oneDay);
    const fetchTo = new Date(oneDayAgo.getFullYear(), oneDayAgo.getMonth(), oneDayAgo.getDate(), 23, 59); // fetch until the end of yesterday

    if (fetchFrom <= fetchTo) {
      const totalMs = fetchTo.getTime() - fetchFrom.getTime();
      await getActivityData(currentDevice.value, fetchFrom, fetchTo, {
        onDataReceived(timestamp) {
          const msSinceFetchFrom = timestamp.getTime() - fetchFrom.getTime();
          activityDataLoadingStatus.value = Math.min(Math.max(msSinceFetchFrom / totalMs * 100, 0), 100);
        },
        async onBatchFinished(items) {
          const latestActivityTimestamp = items[items.length - 1].timestamp;
          await bandsStore.updateBandForId(band.id, { latestActivityTimestamp });
          await addActivityData(band.id, items);
          if (currentBand.value) currentBand.value.latestActivityTimestamp = latestActivityTimestamp;
        }
      });
      activityDataLoadingStatus.value = undefined;
    }
  }

  async function saveActivityGoal(steps: number, goalNotifications: boolean) {
    if (!currentBand.value || !currentDevice.value) return;
    activityGoal.value.loading = true;
    await setActivityGoal(currentDevice.value, steps);
    await setGoalNotifications(currentDevice.value, goalNotifications);
    activityGoal.value.loading = false;
    showToast();
  }

  async function syncBandTime() {
    if (!currentBand.value || !currentDevice.value) return;
    bandTime.value.loading = true;
    await setCurrentTime(currentDevice.value, new Date());
    bandTime.value.time = await getCurrentTime(currentDevice.value);
    bandTime.value.loading = false;
    showToast();
  }

  async function refreshBand() {
    const bandId = route.params.id;
    if (!bandId || typeof bandId !== "string") return bandNotFound();
    const parsedId = parseInt(bandId);
    if (isNaN(parsedId)) return bandNotFound();
    const band = await getBand(parsedId);
    if (!band) return bandNotFound();
    currentBand.value = band;
  }

  onMounted(async () => {
    await refreshBand();

    initDismisses();

    if (!webBluetoothSupported) {
      showNotSupportedModal.value = true;
      return;
    }
    
    if (!currentBand.value) return;

    const authorizedDevice = await bandsStore.getAuthorizedDeviceById(currentBand.value.deviceId);
    if (authorizedDevice) {
      currentDevice.value = new BluetoothDeviceWrapper(authorizedDevice);
      await showDetails();
    } else {
      showReauthorizeModal.value = true;
    }
  });

  onBeforeRouteLeave(() => {
    showReauthorizeModal.value = false;
    showNotSupportedModal.value = false;
    if (currentDevice.value?.device.gatt?.connected) currentDevice.value.device.gatt.disconnect();
  });
</script>