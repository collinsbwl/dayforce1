<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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

// Resizable divider
const leftWidth = ref(384) // matches w-96
const isResizing = ref(false)

function startResize() {
  isResizing.value = true
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopResize)
}

function onMouseMove(e) {
  leftWidth.value = Math.min(Math.max(e.clientX, 220), 720)
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<template>
  <div
    class="h-screen flex overflow-hidden bg-gray-50"
    :class="{ 'select-none cursor-col-resize': isResizing }"
  >

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
      <aside
        class="flex-shrink-0 bg-white flex flex-col overflow-hidden"
        :style="{ width: leftWidth + 'px' }"
      >
        <div class="px-4 py-3 border-b border-gray-100">
          <h1 class="text-sm font-semibold text-gray-900 tracking-tight">Org Chart</h1>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ (root.descendantCount + 1).toLocaleString() }} employees
          </p>
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

      <!-- Drag handle -->
      <div
        class="w-1 flex-shrink-0 bg-gray-200 hover:bg-indigo-400 transition-colors duration-150
               cursor-col-resize relative group"
        @mousedown.prevent="startResize"
      >
        <!-- Dots hint -->
        <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center
                    justify-center gap-[3px] opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="w-[3px] h-[3px] rounded-full bg-white" />
          <div class="w-[3px] h-[3px] rounded-full bg-white" />
          <div class="w-[3px] h-[3px] rounded-full bg-white" />
        </div>
      </div>

      <!-- Right: detail -->
      <main class="flex-1 overflow-y-auto min-w-0">
        <NodeDetail v-if="selectedNode" :node="selectedNode" />
        <div v-else class="h-full flex flex-col items-center justify-center gap-2 text-center px-8">
          <p class="text-sm font-medium text-gray-400">No employee selected</p>
          <p class="text-xs text-gray-300">Click any row in the tree to see cost breakdowns and team details</p>
        </div>
      </main>

    </template>
  </div>
</template>
