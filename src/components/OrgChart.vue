<script setup>
defineProps(['node', 'selectedNode', 'depth'])
defineEmits(['select'])
</script>

<template>
  <div class="px-4 py-1 text-sm text-gray-500">
    {{ node?.data?.data?.['Name'] ?? '—' }}
  </div>
</template>
