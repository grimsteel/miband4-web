<template>
  <div ref="modalRoot" tabindex="-1" aria-hidden="true"
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
        <form id="edit-form" @submit="handleSubmit">
          <div class="space-y-4 mb-4">
            <div>
              <label for="edit-nickname" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nickname</label>
              <input type="text" id="edit-nickname"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-600 focus:border-amber-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500"
                required v-model="nickname" />
            </div>
            <div>
              <label for="edit-auth-key" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Auth Key</label>
              <input type="password" id="edit-auth-key"
                aria-describedby="edit-auth-key-help"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-600 focus:border-amber-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-amber-500 dark:focus:border-amber-500"
                placeholder="32 hex characters" required autocomplete="off"
                v-model="authKey" minlength="32" maxlength="32" />
              <p id="edit-auth-key-help" class="mt-2 text-sm text-gray-500 dark:text-gray-400"><a href="https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Huami-Server-Pairing" target="_blank" class="font-medium text-blue-600 hover:underline dark:text-blue-500">Find out how to get your band's auth key.</a></p>
            </div>
          </div>
          <button type="submit"
            class="text-white inline-flex items-center bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
            <IconCheck class="w-5 h-5 mr-2" />
            Save changes
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
  import IconCheck from "./icons/IconCheck.vue";
  import type { Band } from "../types";

  const props = defineProps<{ show: boolean, band?: { nickname: string; authKey: string, id: number } }>();
  const emit = defineEmits<{
    (e: 'before-close', newBand?: Pick<Band, "nickname" | "authKey">): void
  }>();
  const modalRoot = ref<HTMLDivElement>();
  const modal = ref<Modal>();
  const nickname = ref("");
  const authKey = ref("");

  onMounted(() => {
    modal.value = new Modal(modalRoot.value, {});
  });

  watch(
    () => props.show,
    (show) => {
      if (show) modal.value?.show();
      else modal.value?.hide();
    }
  );

  watch(
    () => props.band,
    (band) => {
      if (band) {
        nickname.value = band.nickname;
        authKey.value = band.authKey;
      }
    }
  );

  function resetForm() {
    nickname.value = "";
    authKey.value = "";
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!props.band) return;
    const updatedBandProps = {
      nickname: nickname.value,
      authKey: authKey.value
    };
    resetForm();
    emit("before-close", updatedBandProps);
  }
</script>