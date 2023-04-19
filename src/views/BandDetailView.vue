<template>
  <main class="grow">
    <section class="flex h-full bg-gray-50 dark:bg-gray-900">
      <div class="py-8 px-4 mx-2 max-w-screen-xl sm:py-16">
        <h2 class="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">{{ currentBand?.nickname || "Loading band..." }}</h2>
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
  import { useRoute, useRouter } from "vue-router";
  import { BluetoothDeviceWrapper, authKeyStringToKey, authenticate, getDeviceInfo, webBluetoothSupported } from "../band-connection";
  import ReauthorizeModal from "../components/ReauthorizeModal.vue";

  const bandsStore = useBandsStore();
  
  const showNotSupportedModal = ref(false);
  const showReauthorizeModal = ref(false);
  const currentBand = ref<Band>();
  const currentDevice = ref<BluetoothDeviceWrapper>();
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
    console.log(await getDeviceInfo(currentDevice.value));
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
</script>