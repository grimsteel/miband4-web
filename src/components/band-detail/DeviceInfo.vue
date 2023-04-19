<template>
  <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Device Info</h5>
    <dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
      <div class="flex flex-col pb-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">MAC Address</dt>
        <dd class="text-lg font-semibold">
          <span v-if="macAddress">{{ macAddress }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Hardware Revision</dt>
        <dd class="text-lg font-semibold">
          <span v-if="hardwareRevision">{{ hardwareRevision }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Firmware Version</dt>
        <dd class="text-lg font-semibold">
          <span v-if="firmwareVersion">{{ firmwareVersion }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Vendor ID</dt>
        <dd class="text-lg font-semibold">
          <span v-if="vendorId">{{ vendorId }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Product ID</dt>
        <dd class="text-lg font-semibold">
          <span v-if="productId">{{ productId }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
      <div class="flex flex-col pt-2">
        <dt class="mb-1 text-gray-500 dark:text-gray-400">Product Version</dt>
        <dd class="text-lg font-semibold">
          <span v-if="productVersion">{{ productVersion }}</span>
          <LoaderPlaceholder v-else />
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
  import LoaderPlaceholder from "./LoaderPlaceholder.vue";
  defineProps<{
    macAddress?: string;
    firmwareVersion?: string;
    hardwareRevision?: string;
    vendorId?: number;
    productId?: number;
    productVersion?: number;
  }>();
</script>