<template>
  <section class="flex grow bg-gray-50 dark:bg-gray-900">
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
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">Nickname</th>
              <th scope="col" class="px-6 py-3">MAC</th>
              <th scope="col" class="px-6 py-3">Date Added</th>
              <th scope="col" class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody v-if="bandStore.bands.length > 0">
            <BandListBand v-for="band in bandStore.bands" :key="band.id" :nickname="band.nickname" :date-added="band.dateAdded" :mac-address="band.macAddress" />
          </tbody>
          <tbody v-else>
            <tr class="bg-gray-100 dark:bg-gray-800">
              <td colspan="4" class="px-6 py-4 font-medium text-gray-700 whitespace-nowrap dark:text-gray-500">You haven't added any bands yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <TheNotSupportedModal @before-close="showNotSupportedModal = false" :show="showNotSupportedModal" />
  <TheAddBandModal @before-close="showAddBandModal = false" :show="showAddBandModal" />
</template>

<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import BandListBand from "../components/BandListBand.vue";
  import TheNotSupportedModal from "../components/TheNotSupportedModal.vue";
  import IconAdd from "../components/icons/IconAdd.vue";
  import { useBandsStore } from "../idb-store";
  import { useRoute, useRouter } from "vue-router";
  import TheAddBandModal from "../components/TheAddBandModal.vue";
  import { webBluetoothSupported } from "../band-connection";

  const bandStore = useBandsStore();
  
  const showNotSupportedModal = ref(false);
  const showAddBandModal = ref(false);
  const route = useRoute();
  const router = useRouter();

  async function addNewBand() {
    if (await webBluetoothSupported()) showAddBandModal.value = true;
    else showNotSupportedModal.value = true;
  }
  onMounted(() => {
    if (route.redirectedFrom?.name === "add-band") addNewBand().then(() => router.replace({ path: "/bands" }));
  });
</script>