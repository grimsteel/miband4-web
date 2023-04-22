<template>
  <div ref="modalRoot" tabindex="-1" aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
    <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
      <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <div class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Band</h3>
          <button @click="$emit('before-close')" type="button" data-test="close"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <IconClose class="w-5 h-5" />
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <form id="create-form" @submit="handleSubmit">
          <div class="space-y-4 mb-4">
            <div>
              <label for="nickname" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nickname</label>
              <input type="text" id="nickname"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-600 focus:border-amber-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500"
                required v-model="nickname" />
            </div>
            <div>
              <label for="auth-key" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Auth Key</label>
              <input type="password" id="auth-key"
                aria-describedby="auth-key-help"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-600 focus:border-amber-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500"
                placeholder="32 hex characters" required autocomplete="off"
                v-model="authKey" minlength="32" maxlength="32" />
              <p id="auth-key-help" class="mt-2 text-sm text-gray-500 dark:text-gray-400"><a href="https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Huami-Server-Pairing" target="_blank" class="font-medium text-blue-600 hover:underline dark:text-blue-500">Find out how to get your band's auth key.</a></p>
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bluetooth Device</label>
              <button type="button" @click="showBluetoothDevicePicker" class="flex flex-col items-center justify-center w-full h-10 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600" :class="bandLoading ? 'cursor-wait' : 'cursor-pointer'" data-test="request-device">
                <p v-if="bandLoading" class="animate-pulse w-full max-w-sm">
                  <span class="sr-only">Loading...</span>
                  <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-800 w-full"></div>
                </p>
                <p class="text-md text-gray-500 dark:text-gray-400" v-else>
                  {{ selectedBand ? `${selectedBand.device.name} selected` : "Click to select" }}
                  <span v-if="selectedBand" class="ml-1 hidden md:inline">({{ selectedBand.macAddress }})</span>
                </p>
              </button>
              <p v-if="!selectedBand && hasBeenSubmitted" class="mt-2 text-sm text-red-600 dark:text-red-500" data-test="error-not-selected">Please select a device.</p>
              <p v-if="bandWithMacExists" class="mt-2 text-sm text-red-600 dark:text-red-500" data-test="error-exists">A band with that mac address already exists.</p>
            </div>
          </div>
          <button type="submit"
            class="text-white inline-flex items-center bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
            <IconAdd class="w-5 h-5 mr-2" />
            Add new band
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Modal } from "flowbite";
  import IconClose from "./icons/IconClose.vue";
  import { onMounted, ref, watch } from "vue";
  import IconAdd from './icons/IconAdd.vue';
  import { getBandMac, requestDevice } from "../band-connection";
  import { getBandForMac } from "../local-db";
  import type { UnsavedBand } from "../types";

  const props = defineProps<{ show: boolean }>();
  const emit = defineEmits<{
    (e: 'before-close', newBand?: UnsavedBand, device?: BluetoothDevice): void
  }>();
  const modalRoot = ref<HTMLDivElement>();
  const modal = ref<Modal>();
  const nickname = ref("");
  const authKey = ref("");
  const hasBeenSubmitted = ref(false);
  const selectedBand = ref<{ device: BluetoothDevice; macAddress: string; }>();
  const bandLoading = ref(false);
  const bandWithMacExists = ref(false);

  onMounted(() => {
    modal.value = new Modal(modalRoot.value, {});
  });

  watch(
    () => props.show,
    (show) => {
      if (show) {
        modal.value?.show();
        hasBeenSubmitted.value = false;
      } else modal.value?.hide();
    }
  );

  async function showBluetoothDevicePicker() {
    if (bandLoading.value) return;
    bandLoading.value = true;
    const device = await requestDevice();
    if (device) {
      const macAddress = await getBandMac(device);
      if (!macAddress) selectedBand.value = undefined;
      else {
        bandWithMacExists.value = Boolean(await getBandForMac(macAddress));
        selectedBand.value = { device, macAddress };
      }
    } else selectedBand.value = undefined;
    bandLoading.value = false;
  }

  function resetForm() {
    hasBeenSubmitted.value = false;
    selectedBand.value = undefined;
    bandLoading.value = false;
    bandWithMacExists.value = false;
    nickname.value = "";
    authKey.value = "";
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (bandLoading.value || bandWithMacExists.value) return;
    hasBeenSubmitted.value = true;
    if (selectedBand.value) {
      const newBand = {
        nickname: nickname.value,
        authKey: authKey.value,
        macAddress: selectedBand.value.macAddress,
        deviceId: selectedBand.value.device.id,
      };
      const device = selectedBand.value.device;
      resetForm();
      emit("before-close", newBand, device);
    }
  }
</script>