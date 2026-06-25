<script setup>
import { ref, onMounted } from 'vue'
import { buildTree } from './orgTree.js'
import OrgChart from './components/OrgChart.vue'
import NodeDetail from './components/NodeDetail.vue'

const root = ref(null)
const selectedNode = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/Giga_Corp_(40k)_-_Sheet1_(2)%20(1).csv')
    if (!res.ok) throw new Error(`Failed to load CSV: ${res.status}`)
    const text = await res.text()
    root.value = buildTree(text)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="h-screen flex overflow-hidden bg-gray-50">

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <p class="text-sm text-gray-400">Loading org chart…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <p class="text-sm text-red-500">{{ error }}</p>
    </div>

    <!-- Two-panel layout -->
    <template v-else-if="root">

      <!-- Left: tree -->
      <aside class="w-96 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-100">
          <h1 class="text-sm font-semibold text-gray-900 tracking-tight">Org Chart</h1>
          <p class="text-xs text-gray-400 mt-0.5">{{ root.descendantCount + 1 }} employees</p>
        </div>
        <div class="flex-1 overflow-y-auto py-1">
          <OrgChart
            :node="root"
            :selected-node="selectedNode"
            :depth="0"
            @select="selectedNode = $event"
          />
        </div>
      </aside>

      <!-- Right: detail -->
      <main class="flex-1 overflow-y-auto">
        <NodeDetail v-if="selectedNode" :node="selectedNode" />
        <div v-else class="h-full flex items-center justify-center">
          <p class="text-sm text-gray-400">Select an employee to see details</p>
        </div>
      </main>

    </template>
  </div>
</template>
