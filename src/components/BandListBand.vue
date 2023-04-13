<template>
  <tr class="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
      {{ nickname }}
    </th>
    <td class="px-6 py-4">
      {{ macAddress }}
    </td>
    <td class="px-6 py-4">
      {{ dateAdded.toLocaleDateString() }}
    </td>
    <td class="px-6 py-4 divide-x">
      <button class="font-medium text-blue-600 dark:text-blue-500 hover:underline pr-2">Open</button>
      <button class="font-medium text-amber-600 dark:text-amber-500 hover:underline px-2">Edit</button>
      <button class="font-medium text-rose-600 dark:text-rose-500 hover:underline pl-2">Delete</button>
    </td>
  </tr>
</template>
<script setup lang="ts">
  defineProps<{
    nickname: string;
    dateAdded: Date;
    macAddress: string;
  }>()
</script>