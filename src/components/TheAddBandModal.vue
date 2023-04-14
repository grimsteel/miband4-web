<template>
  <div id="modal-add-band" tabindex="-1" aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full">
    <div class="relative p-4 w-full max-w-2xl h-full md:h-auto">
      <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <div class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Band</h3>
          <button @click="$emit('before-close')" type="button"
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
                placeholder="32 hex characters" required
                v-model="authKey" minlength="32" maxlength="32" />
              <p id="auth-key-help" class="mt-2 text-sm text-gray-500 dark:text-gray-400">Find out how to get your band's auth key <a href="https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Huami-Server-Pairing" target="_blank" class="font-medium text-blue-600 hover:underline dark:text-blue-500">here</a>.</p>
            </div>
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bluetooth Device</label>
              <button type="button" @click="showBluetoothDevicePicker" class="flex flex-col items-center justify-center w-full h-10 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <p class="text-md text-gray-500 dark:text-gray-400">
                  {{ bluetoothDevice ? `${bluetoothDevice?.name} selected` : "Click to select" }}
                  <span v-if="bluetoothDevice" class="ml-1 hidden md:inline">({{ bluetoothDevice.id }})</span>
                </p>
              </button>
              <p v-if="!bluetoothDevice && hasBeenSubmitted" class="mt-2 text-sm text-red-600 dark:text-red-500">Please select a device.</p>
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
  import { requestDevice } from "../band-connection";

  const props = defineProps<{ show: boolean }>();
  defineEmits(["before-close"]);
  const modal = ref<Modal>();
  const nickname = ref("");
  const authKey = ref("");
  const hasBeenSubmitted = ref(false);
  const bluetoothDevice = ref<BluetoothDevice>();

  onMounted(() => {
    modal.value = new Modal(document.getElementById("modal-add-band"), {});
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
    const device = await requestDevice();
    if (device) bluetoothDevice.value = device;
    else bluetoothDevice.value = undefined;
  }

  function resetForm() {
    hasBeenSubmitted.value = false;
    bluetoothDevice.value = undefined;
    nickname.value = "";
    authKey.value = "";
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    hasBeenSubmitted.value = true;
    if (bluetoothDevice.value) {

    }
  }
</script>