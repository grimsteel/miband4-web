<template>
  <main class="grow bg-gray-50 dark:bg-gray-900">
    <section class="flex h-full flex-col py-8 px-4 mx-2 max-w-screen-xl">
      <h2 class="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">{{ currentBand?.nickname || "Loading band..." }}</h2>
      <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
        <DeviceInfo v-bind="deviceInfo" />
        <Status v-bind="status" />
        <BatteryInfo v-bind="batteryInfo" />
      </div>
    </section>
    <TheNotSupportedModal @before-close="showNotSupportedModal = false" :show="showNotSupportedModal" />
    <ReauthorizeModal @before-close="onReauthorizeComplete" :show="showReauthorizeModal" :target-device="currentBand" />
  </main>
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import TheNotSupportedModal from "../components/TheNotSupportedModal.vue";
  import { useBandsStore, type Band } from "../idb-store";
  import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
  import { BluetoothDeviceWrapper, authKeyStringToKey, authenticate, getBatteryLevel, getDeviceInfo, getSteps, webBluetoothSupported } from "../band-connection";
  import ReauthorizeModal from "../components/ReauthorizeModal.vue";
  import DeviceInfo from "../components/band-detail/DeviceInfo.vue";
  import Status from "../components/band-detail/Status.vue";
  import BatteryInfo from "../components/band-detail/BatteryInfo.vue";

  const bandsStore = useBandsStore();
  
  const showNotSupportedModal = ref(false);
  const showReauthorizeModal = ref(false);
  const currentBand = ref<Band>();
  const currentDevice = ref<BluetoothDeviceWrapper>();
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

  onMounted(async () => {
    const bandId = route.params.id;
    if (!bandId || typeof bandId !== "string") return bandNotFound();
    const parsedId = parseInt(bandId);
    if (isNaN(parsedId)) return bandNotFound();
    const band = await bandsStore.getBand(parsedId);
    if (!band) return bandNotFound();

    if (!webBluetoothSupported) {
      showNotSupportedModal.value = true;
      return;
    }

    currentBand.value = band;
    const authorizedDevice = await bandsStore.getAuthorizedDeviceById(band.deviceId);
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