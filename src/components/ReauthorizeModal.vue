<template>
  <div tabindex="-1" role="dialog" aria-modal="true" class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full justify-center items-center flex">
    <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
      <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <div class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Reauthorize Band</h3>
          <button @click="clearAndClose(false)" type="button" data-test="close"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <IconClose class="w-5 h-5" />
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <div>
          <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400 mb-3">Web Bluetooth permissions aren't persisted, so you'll need to reauthorize this band. Right now, the only way to do this is to select the band again in the Bluetooth Device picker, <span class="font-bold text-gray-600 dark:text-gray-300">so you'll need to make sure to pick the right one.</span></p>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bluetooth Device</label>
          <button data-test="request-device" type="button" @click="showBluetoothDevicePicker" class="flex flex-col items-center justify-center w-full h-10 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600" :class="bandLoadingMsg ? 'cursor-wait' : 'cursor-pointer'">
            <p class="text-md text-gray-500 dark:text-gray-400" :class="bandLoadingMsg ? 'animate-pulse' : ''">
              {{ bandLoadingMsg || "Click to select" }}
            </p>
          </button>
          <p v-if="incorrectBand" class="mt-2 text-sm text-red-600 dark:text-red-500 pb-3 border-b border-gray-400" data-test="incorrect-band">That isn't the correct device. Try again!</p>
          <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400 pt-3">Want to make this process easier? <router-link to="/faq" class="text-blue-600 hover:underline dark:text-blue-500">Enable persistent Web Bluetooth permissions.</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  /**
   * This modal prompts a user to select a Bluetooth device, and then checks if it's the target device. This is used when the user has to reauthorize the band.
   * @emits before-close - Emitted when the modal is closed. The first parameter is a boolean indicating whether the user selected the correct device. The second parameter is the ID of the new bluetooth device
   */

  import IconClose from "./icons/IconClose.vue";
  import { ref } from "vue";
  import { getBandMac, requestDevice } from "../band-connection";

  const props = defineProps<{ targetDevice?: { macAddress: string; deviceId: string; } }>();
  const emit = defineEmits<{
    (e: "before-close", success: boolean, newDevice?: BluetoothDevice): void;
  }>();
  const bandLoadingMsg = ref("");
  const incorrectBand = ref(false);

  function clearAndClose(success: boolean, newDevice?: BluetoothDevice) {
    emit("before-close", success, newDevice);
  }

  async function showBluetoothDevicePicker() {
    if (bandLoadingMsg.value || !props.targetDevice) return;
    bandLoadingMsg.value = "Selecting device...";
    const device = await requestDevice();
    // If by some miracle we still had permission to access the band (the ID will be the same), then we don't need to check the mac address
    if (device?.id === props.targetDevice.deviceId) clearAndClose(true, device);
    else if (device) {
      // This takes a couple seconds, so we'll show a loading message
      const macAddress = await getBandMac(device, {
        onConnecting: () => bandLoadingMsg.value = "Connecting...",
        onGettingService: () => bandLoadingMsg.value = "Getting service...",
        onGettingCharacteristic: () => bandLoadingMsg.value = "Getting characteristic...",
        onReadingValue: () => bandLoadingMsg.value = "Reading value...",
      });
      if (macAddress === props.targetDevice.macAddress) clearAndClose(true, device);
      else incorrectBand.value = true;
    }
    bandLoadingMsg.value = "";
  }
</script>