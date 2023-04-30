<template>
  <main class="grow bg-gray-50 dark:bg-gray-900">
    <section class="flex h-full flex-col py-8 px-4 mx-2 max-w-full" v-if="currentLoadingState === 'ready'">
      <h1 class="mb-6 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">{{ currentBand?.nickname || "Loading band..." }}</h1>
      <h2 class="text-2xl tracking-tight font-bold text-gray-900 dark:text-white">Fitness</h2>
      <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-12 md:space-y-0 mb-3">
        <Status v-bind="status" :distance-unit="currentBand?.distanceUnit" />
        <ActivityData :latest-activity-timestamp="currentBand?.latestActivityTimestamp" :loading="activityDataLoadingStatus" @fetch-data="syncActivityData" @view-data="currentModal = 'activity-data'" />
        <HeartRate />
        <ActivityGoal :loading="activityGoalLoading" :activity-goal="currentBand?.activityGoal" :goal-notifications="currentBand?.goalNotifications" @save="saveActivityGoal" />
        <IdleAlerts :loading="idleAlertsLoading" :idle-alerts="currentBand?.idleAlerts" @save="saveIdleAlerts" />
      </div>
      <h2 class="text-2xl tracking-tight font-bold text-gray-900 dark:text-white">Utilities</h2>
      <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-12 md:space-y-0">
        <Alarms :alarms="currentBand?.alarms" :loading="alarmsLoading" @save="saveAlarm" />
        <Weather :loading="weatherLoading" @save="saveWeather" />
        <FindMyBand :loading="findMyBandLoading" @find-band="findMyBand" />
        <BandLock :loading="bandLockLoading" :band-lock="currentBand?.bandLock" @save="saveBandLock" />
      </div>
      <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <h2 class="text-2xl tracking-tight font-bold text-gray-900 dark:text-white">System</h2>
      <hr class="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
      <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-12 md:space-y-0">
        <DeviceInfo v-bind="deviceInfo" />
        <BatteryInfo v-bind="batteryInfo" />
        <BandTime v-bind="bandTime" @sync="syncBandTime" />
        <BandDisplay :loading="bandDisplayLoading" :band-display="currentBand?.display" @save="saveDisplayItems" />
        <LiftWrist :loading="liftWristLoading" :lift-wrist="currentBand?.liftWrist" @save="saveLiftWrist" />
        <NightMode :loading="nightModeLoading" :night-mode="currentBand?.nightMode" @save="saveNightMode" />
        <OtherSettings :loading="otherSettingsLoading" :distance-unit="currentBand?.distanceUnit" :band-location="currentBand?.bandLocation" @save="saveOtherSettings" />
      </div>
    </section>
    <section class="flex h-full w-full items-center justify-center" v-else>
      <BandLoadingStepper :current-state="currentLoadingState" :error="currentLoadingError" />
    </section>
    <TheNotSupportedModal @before-close="currentModal = null" v-if="currentModal === 'not-supported'" />
    <ReauthorizeModal @before-close="onReauthorizeComplete" v-if="currentModal === 'reauthorize'" :target-device="currentBand" />
    <IncorrectAuthKeyModal @before-close="onIncorrectAuthModalClose" v-if="currentModal === 'incorrect-auth-key'" />
    <ActivityDataModal @before-close="onActivityDataModalClose" @date-filter="updateDisplayedActivityData"  v-if="currentModal === 'activity-data'" v-bind="activityDataModalData" />
    <div ref="saveToastRoot" id="save-toast" class="fixed right-4 bottom-2 hidden items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
      <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
        <IconCheck class="w-5 h-5" />
        <span class="sr-only">Check icon</span>
      </div>
      <div class="ml-3 text-sm font-normal">Operation completed successfully</div>
      <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#save-toast" aria-label="Close">
          <span class="sr-only">Close</span>
          <IconClose class="w-5 h-5" />
      </button>
    </div>
    <div class="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40" v-if="currentModal"></div>
  </main>
</template>

<script setup lang="ts">
  import { initDismisses } from "flowbite";
  import { defineAsyncComponent, onMounted, ref, toRaw } from "vue";
  import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
  import { BluetoothDeviceWrapper, authKeyStringToKey, authenticate, getActivityData, getBatteryLevel, getCurrentStatus, getCurrentTime, getDeviceInfo, setActivityGoal, setAlarm, setCurrentTime, setGoalNotifications, setIdleAlerts, setWeather, sendAlert, webBluetoothSupported, setBandLock, setBandDisplay, scheduleLiftWrist, setLiftWristResponseSpeed, setNightMode, setDistanceUnit, setBandLocation } from "../band-connection";
  import ReauthorizeModal from "../components/ReauthorizeModal.vue";
  import ActivityData from "../components/band-detail/ActivityData.vue";
  import ActivityGoal from "../components/band-detail/ActivityGoal.vue";
  import BandTime from "../components/band-detail/BandTime.vue";
  import BatteryInfo from "../components/band-detail/BatteryInfo.vue";
  import DeviceInfo from "../components/band-detail/DeviceInfo.vue";
  import HeartRate from "../components/band-detail/HeartRate.vue";
  import IdleAlerts from "../components/band-detail/IdleAlerts.vue";
  import Status from "../components/band-detail/Status.vue";
  import IconCheck from "../components/icons/IconCheck.vue";
  import IconClose from "../components/icons/IconClose.vue";
  import { addActivityData, getBand, queryActivityData } from "../local-db";
  import { useBandsStore } from "../pinia-stores";
  import type { Alarm, Band, IdleAlertsConfig, WeatherData, BandLoadingStates } from "../types";
  import Alarms from "../components/band-detail/Alarms.vue";
  import Weather from "../components/band-detail/Weather.vue";
  import FindMyBand from "../components/band-detail/FindMyBand.vue";
  import BandDisplay from "../components/band-detail/BandDisplay.vue";
  import BandLock from "../components/band-detail/BandLock.vue";
  import LiftWrist from "../components/band-detail/LiftWrist.vue";
  import BandLoadingStepper from "../components/BandLoadingStepper.vue";
  import NightMode from "../components/band-detail/NightMode.vue";
  import OtherSettings from "../components/band-detail/OtherSettings.vue";
  import ActivityDataModal from "../components/ActivityDataModal.vue";

  const bandsStore = useBandsStore();
  const oneDay = 1000 * 60 * 60 * 24;
  
  const currentModal = ref<"not-supported" | "reauthorize" | "incorrect-auth-key" | "activity-data" | null>(null);
  const currentBand = ref<Band>();
  const currentDevice = ref<BluetoothDeviceWrapper>();
  const saveToastRoot = ref<HTMLElement>();
  const authenticated = ref(false);
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
    isCharging: boolean;
  }>();
  const activityGoalLoading = ref(false);
  const bandTime = ref<{
    time?: Date;
    loading: boolean;
  }>({ loading: false });
  const idleAlertsLoading = ref(false);
  const alarmsLoading = ref(true);
  const weatherLoading = ref(false);
  const findMyBandLoading = ref(false);
  const bandDisplayLoading = ref(false);
  const bandLockLoading = ref(false);
  const liftWristLoading = ref(false);
  const nightModeLoading = ref(false);
  const otherSettingsLoading = ref(false);
  const activityDataLoadingStatus = ref<number>();
  const activityDataModalData = ref<{
    startDate?: Date;
    endDate?: Date;
    aggregatedByDay?: boolean;
    activityData: {
      timestamp: Date;
      totalSteps: number;
      averageHeartRate: number;
    }[]
  }>({ activityData: [] });
  const currentLoadingState = ref<BandLoadingStates>("reauthorizing");
  const currentLoadingError = ref<string>();
  const route = useRoute();
  const router = useRouter();
  const bandNotFound = () => {
    const currentPathname = window.location.pathname;
    router.replace({ name: "not-found" }).then(() => {
      history.replaceState({}, "", currentPathname);
    });
  }

  const IncorrectAuthKeyModal = defineAsyncComponent(() => import("../components/IncorrectAuthKeyModal.vue"));
  const TheNotSupportedModal = defineAsyncComponent(() => import("../components/TheNotSupportedModal.vue"));

  async function showDetails() {
    if (!currentBand.value || !currentDevice.value) return;
    const authKey = await authKeyStringToKey(currentBand.value.authKey);
    try {
      await authenticate(currentDevice.value!, authKey, {
        onSearching: () => currentLoadingState.value = "searching",
        onConnecting: () => currentLoadingState.value = "connecting",
        onGettingService: () => currentLoadingState.value = "getting-service",
        onAuthenticating: () => currentLoadingState.value = "authenticating"
      });
      currentLoadingState.value = "ready";
    } catch (err: any) {
      if (err === "Incorrect auth key") currentModal.value = "incorrect-auth-key";
      else if (err.message?.toLowerCase().includes("connection attempt failed")) {
        // In this case, the only thing we can do is forget the device and make the user reauthorize
        // I can't find any documentation on this error (only the chromium source code) but it randomly happens
        await bandsStore.removeAuthorizedDevice(currentBand.value.deviceId);
        currentModal.value = "reauthorize";
        currentLoadingState.value = "reauthorizing";
        currentDevice.value = undefined;
      } else if (err === "Connection timeout" || err.message?.toLowerCase().includes("failed for unknown reason")) {
        // this happens when the browser thinks the device is connected but it's not
        currentLoadingError.value = "We can't connect to the band. Try turning Bluetooth off and on again.";
      }
      throw err;
    }
    deviceInfo.value = await getDeviceInfo(currentDevice.value);
    status.value = await getCurrentStatus(currentDevice.value);
    batteryInfo.value = await getBatteryLevel(currentDevice.value);
    bandTime.value.time = await getCurrentTime(currentDevice.value);
    authenticated.value = true;
    alarmsLoading.value = false;
  }

  async function onReauthorizeComplete(success: boolean, newDevice?: BluetoothDevice) {
    currentModal.value = null;
    if (!currentBand.value) return;
    if (success && newDevice) {
      await bandsStore.removeAuthorizedDevice(currentBand.value.deviceId);
      bandsStore.addAuthorizedDevice(newDevice);
      await updateCurrentBand({ deviceId: newDevice.id });
      currentDevice.value = new BluetoothDeviceWrapper(newDevice);
      await showDetails();
    }
  }

  async function onIncorrectAuthModalClose() {
    currentModal.value = null;
    await router.push({ name: 'bands' });
  }

  function onActivityDataModalClose() {
    currentModal.value = null;
    activityDataModalData.value = { activityData: [] };
  }

  async function refreshBand() {
    const bandId = route.params.id;
    if (!bandId || typeof bandId !== "string") return bandNotFound();
    const parsedId = parseInt(bandId);
    if (isNaN(parsedId)) return bandNotFound();
    const band = await getBand(parsedId);
    if (!band) return bandNotFound();
    currentBand.value = band;
    document.title = `${band.nickname} - Mi Band 4 Web`;
  }

  async function updateCurrentBand(fields: Partial<Band>) {
    if (!currentBand.value) return;
    await bandsStore.updateBandForId(currentBand.value.id, fields);
    await refreshBand();
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

  //#region Action Functions (called when the user clicks a button on one of the band detail items)
  async function syncActivityData() {
    await refreshBand();
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
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
          await updateCurrentBand({ latestActivityTimestamp });
          await addActivityData(band.id, items);
          if (currentBand.value) currentBand.value.latestActivityTimestamp = latestActivityTimestamp;
        }
      });
      activityDataLoadingStatus.value = undefined;
    }
  }
  async function updateDisplayedActivityData(startDate: Date, endDate: Date) {
    if (!currentBand.value) return;
    // if we are querying for more than 3 days, we should aggregate the data by day
    const shouldAggregateByDay = (endDate.getTime() - startDate.getTime()) / oneDay > 5;
    const activityData = await queryActivityData(currentBand.value.id, startDate, endDate, shouldAggregateByDay);
    activityDataModalData.value = { activityData, startDate, endDate, aggregatedByDay: shouldAggregateByDay };
  }
  async function saveActivityGoal(steps: number, goalNotifications: boolean) {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    activityGoalLoading.value = true;
    await setActivityGoal(currentDevice.value, steps);
    await setGoalNotifications(currentDevice.value, goalNotifications);
    await updateCurrentBand({ activityGoal: steps, goalNotifications });
    activityGoalLoading.value = false;
    showToast();
  }

  async function saveIdleAlerts({ enabled, startTime, endTime } : IdleAlertsConfig) {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    idleAlertsLoading.value = true;
    await setIdleAlerts(currentDevice.value, enabled, startTime, endTime);
    await updateCurrentBand({ idleAlerts: { enabled, startTime: toRaw(startTime), endTime: toRaw(endTime) } });
    idleAlertsLoading.value = false;
    showToast();
  }

  async function syncBandTime() {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    bandTime.value.loading = true;
    await setCurrentTime(currentDevice.value, new Date());
    bandTime.value.time = await getCurrentTime(currentDevice.value);
    bandTime.value.loading = false;
    showToast();
  }
  async function saveAlarm(alarm: Alarm) {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    alarmsLoading.value = true;
    await setAlarm(currentDevice.value, alarm);
    await refreshBand();
    const currentAlarms = currentBand.value.alarms?.map(alarm => toRaw(alarm)) || [];
    const newAlarms =
      alarm.days.size > 0 ? ( // if this alarm is not being deleted
        currentAlarms.find(({ id }) => id === alarm.id) ? // and it already exists
        currentAlarms.map(a => a.id === alarm.id ? alarm : a) : // update it
        [...currentAlarms, alarm] // otherwise add it
      ) : currentAlarms.filter(({ id }) => id !== alarm.id); // if this alarm is being deleted, remove it
    currentBand.value.alarms = newAlarms;
    await updateCurrentBand({ alarms: newAlarms });
    alarmsLoading.value = false;
    showToast();
  }
  async function saveWeather(data: WeatherData) {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    weatherLoading.value = true;
    await setWeather(currentDevice.value, data);
    weatherLoading.value = false;
    showToast();
  }
  async function findMyBand() {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    findMyBandLoading.value = true;
    await sendAlert(currentDevice.value);
    findMyBandLoading.value = false;
    showToast();
  }
  async function saveDisplayItems(displayItems: Exclude<Band["display"], undefined>) {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    bandDisplayLoading.value = true;
    const itemsSet = new Set(displayItems.filter(item => item.enabled).map(item => item.item));
    await setBandDisplay(currentDevice.value, itemsSet);
    await updateCurrentBand({ display: toRaw(displayItems) });
    bandDisplayLoading.value = false;
    showToast();
  }
  async function saveBandLock(bandLock: Exclude<Band["bandLock"], undefined>) {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    bandLockLoading.value = true;
    await setBandLock(currentDevice.value, bandLock.enabled, bandLock.pin);
    await updateCurrentBand({ bandLock: toRaw(bandLock) });
    bandLockLoading.value = false;
    showToast();
  }
  async function saveLiftWrist(liftWrist: Exclude<Band["liftWrist"], undefined>) {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    liftWristLoading.value = true;
    await scheduleLiftWrist(currentDevice.value, liftWrist.enabled, liftWrist.startTime, liftWrist.endTime);
    await setLiftWristResponseSpeed(currentDevice.value, liftWrist.responseSpeed);
    await updateCurrentBand({ liftWrist: toRaw(liftWrist) });
    liftWristLoading.value = false;
    showToast();
  }
  async function saveNightMode(nightMode: Exclude<Band["nightMode"], undefined>) {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    nightModeLoading.value = true;
    await setNightMode(currentDevice.value, nightMode.state, nightMode.startTime, nightMode.endTime);
    await updateCurrentBand({ nightMode: toRaw(nightMode) });
    nightModeLoading.value = false;
    showToast();
  }
  async function saveOtherSettings(distanceUnit: "miles" | "km", bandLocation: "left" | "right") {
    if (!currentBand.value || !currentDevice.value || !authenticated.value) return;
    otherSettingsLoading.value = true;
    await setDistanceUnit(currentDevice.value, distanceUnit);
    await setBandLocation(currentDevice.value, bandLocation);
    await updateCurrentBand({ distanceUnit, bandLocation });
    otherSettingsLoading.value = false;
    showToast();
  }
  //#endregion

  onMounted(async () => {
    await refreshBand();

    initDismisses();

    if (!webBluetoothSupported) {
      currentModal.value = "not-supported";
      return;
    }
    
    if (!currentBand.value) return;

    const authorizedDevice = await bandsStore.getAuthorizedDeviceById(currentBand.value.deviceId);
    if (authorizedDevice) {
      currentDevice.value = new BluetoothDeviceWrapper(authorizedDevice);
      await showDetails();
    } else {
      currentModal.value = "reauthorize";
    }
  });

  onBeforeRouteLeave(() => {
    currentModal.value = null;
    currentDevice.value?.disconnect();
  });
</script>