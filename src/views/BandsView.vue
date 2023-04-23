<template>
  <main class="grow">
    <section class="flex h-full bg-gray-50 dark:bg-gray-900">
      <div class="w-full max-w-screen-xl px-4 mx-auto lg:px-12">
        <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg my-3">
          <div class="flex-row items-center justify-between p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4">
            <div>
              <h5 class="mr-3 font-semibold dark:text-white">My Bands</h5>
              <p class="text-gray-500 dark:text-gray-400">Sorted in descending order of creation</p>
            </div>
            <button @click="addNewBand" type="button" class="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-br hover:bg-gradient-to-tr focus:ring-4 focus:ring-rose-300 focus:outline-none dark:focus:ring-rose-800 from-red-500 to-rose-600">
              <IconAdd class="h-3.5 w-3.5 mr-2 ml-1" />
              Add Band
            </button>
          </div>
        </div>
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" class="px-6 py-3">Nickname</th>
                <th scope="col" class="px-6 py-3">MAC</th>
                <th scope="col" class="px-6 py-3">Date Added</th>
                <th scope="col" class="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody v-if="bandsStore.bands.length > 0">
              <BandListBand v-for="band in bandsStore.sortBandsByCreated('DESC')" :key="band.id"
                :nickname="band.nickname" :date-added="band.dateAdded" :mac-address="band.macAddress"
                @open="showBandDetail(band)" @edit="{ currentBand = band; currentModal = 'edit' }" @delete="{ currentBand = band; currentModal = 'delete' }" />
            </tbody>
            <tbody v-else>
              <tr class="bg-gray-100 dark:bg-gray-800">
                <td colspan="4" class="px-6 py-4 font-medium text-gray-700 whitespace-nowrap dark:text-gray-400">You haven't added any bands yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
    <TheNotSupportedModal @before-close="currentModal = null" v-if="currentModal === 'not-supported'" />
    <TheAddBandModal @before-close="onAddBandModalClose" v-if="currentModal === 'add'" />
    <EditBandModal @before-close="onEditBandModalClose" v-if="currentModal === 'edit'" :band="currentBand" />
    <DeleteBandModal @before-close="onDeleteModalClose" v-if="currentModal === 'delete'" :band="currentBand" />
    <div class="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40" v-if="currentModal"></div>
  </main>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, onMounted, ref, watch } from "vue";
  import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
  import BandListBand from "../components/BandListBand.vue";
  import IconAdd from "../components/icons/IconAdd.vue";
  import { useBandsStore } from "../pinia-stores";
  import type { Band, UnsavedBand } from "../types";

  const bandsStore = useBandsStore();
  
  const currentModal = ref<"not-supported" | "add" | "edit" | "delete" | null>(null);
  const currentBand = ref<Band>();
  const route = useRoute();
  const router = useRouter();

  const DeleteBandModal = defineAsyncComponent(() => import("../components/DeleteBandModal.vue"));
  const EditBandModal = defineAsyncComponent(() => import("../components/EditBandModal.vue"));
  const TheAddBandModal = defineAsyncComponent(() => import("../components/TheAddBandModal.vue"));
  const TheNotSupportedModal = defineAsyncComponent(() => import("../components/TheNotSupportedModal.vue"));

  onMounted(() => {
    if (route.redirectedFrom?.name === "add-band") addNewBand().then(() => router.replace({ path: "/bands" }));
  });

  onBeforeRouteLeave(() => {
    currentModal.value = null;
  });

  watch(currentModal, (value) => {
    if (value) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
  });

  async function addNewBand() {
    const { webBluetoothSupported } = await import("../band-connection");
    if (await webBluetoothSupported()) currentModal.value = "add";
    else currentModal.value = "not-supported";
  }

  async function showBandDetail(band: Band) {
    router.push({ name: "band-detail", params: { id: band.id } });
  }

  async function onAddBandModalClose(band?: UnsavedBand, device?: BluetoothDevice) {
    if (band && device) {
      await bandsStore.addBand(band);
      bandsStore.addAuthorizedDevice(device);
    }
    currentModal.value = null;
  }

  async function onEditBandModalClose(newBand?: Pick<Band, "nickname" | "authKey">) {
    if (currentBand.value && newBand)
      await bandsStore.updateBandForId(currentBand.value.id, newBand);
    currentModal.value = null;
    currentBand.value = undefined;
  }

  async function onDeleteModalClose(shouldDelete: boolean) {
    if (shouldDelete && currentBand.value) {
      await bandsStore.removeBand(currentBand.value.id);
      bandsStore.removeAuthorizedDevice(currentBand.value.deviceId);
    }
    currentModal.value = null;
    currentBand.value = undefined;
  }
</script>