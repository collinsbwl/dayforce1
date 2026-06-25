<script setup>
defineProps(['node'])
</script>

<template>
  <div class="p-6 text-sm text-gray-500">
    {{ node?.data?.data?.['Name'] ?? '—' }}
  </div>
</template>
