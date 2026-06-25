<script setup>
import { ref, watchEffect, onUnmounted } from 'vue'
import { buildTree } from './orgTree.js'
import OrgChart from './components/OrgChart.vue'
import NodeDetail from './components/NodeDetail.vue'

const root = ref(null)
const selectedNode = ref(null)
const error = ref(null)
const fileInput = ref(null)

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  error.value = null
  selectedNode.value = null
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      root.value = buildTree(ev.target.result)
    } catch (err) {
      error.value = err.message
      root.value = null
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

// Resizable divider
const leftWidth = ref(Math.round(window.innerWidth / 2))
const treeContent = ref(null)
let autoExpandDisabled = false

watchEffect((onCleanup) => {
  const el = treeContent.value
  if (!el) return
  const obs = new ResizeObserver(([entry]) => {
    if (autoExpandDisabled) return
    const w = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width
    if (w > leftWidth.value) leftWidth.value = Math.min(Math.ceil(w) + 24, window.innerWidth - 220)
  })
  obs.observe(el)
  onCleanup(() => obs.disconnect())
})

// Tree zoom
const treeZoom = ref(1)

const isResizing = ref(false)

function startResize() {
  isResizing.value = true
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopResize)
}

function onMouseMove(e) {
  const newWidth = Math.min(Math.max(e.clientX, 220), window.innerWidth - 220)
  if (newWidth < leftWidth.value) autoExpandDisabled = true
  leftWidth.value = newWidth
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
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      class="hidden"
      @change="onFileChange"
    />

    <!-- No file loaded yet -->
    <div v-if="!root && !error" class="flex-1 flex flex-col items-center justify-center gap-4">
      <p class="text-sm font-medium text-gray-500">Upload a CSV to get started</p>
      <button
        class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium
               hover:bg-indigo-700 transition-colors"
        @click="fileInput.click()"
      >
        Upload CSV
      </button>
      <p class="text-xs text-gray-400">Expects columns: Employee Id, Name, Manager, Salary, Job Title</p>
    </div>

    <!-- Error (parse failure) -->
    <div v-else-if="error && !root" class="flex-1 flex flex-col items-center justify-center gap-3">
      <p class="text-sm text-red-500">{{ error }}</p>
      <button
        class="text-xs text-indigo-600 hover:underline"
        @click="fileInput.click()"
      >Try another file</button>
    </div>

    <!-- Two-panel layout -->
    <template v-else-if="root">

      <!-- Left: tree -->
      <aside
        class="shrink-0 bg-white flex flex-col overflow-hidden"
        :style="{
          width: leftWidth + 'px',
          transition: isResizing ? 'none' : 'width 0.25s ease',
        }"
      >
        <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <div class="flex-1 min-w-0">
            <h1 class="text-sm font-semibold text-gray-900 tracking-tight">Org Chart</h1>
            <p class="text-xs text-gray-400 mt-0.5">
              {{ (root.descendantCount + 1).toLocaleString() }} employees
            </p>
          </div>

          <!-- Upload button -->
          <button
            class="shrink-0 flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400
                   hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Upload new CSV"
            @click="fileInput.click()"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"
                 stroke="currentColor" stroke-width="1.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 10V3M5 6l3-3 3 3"/>
              <path d="M2 11v1a2 2 0 002 2h8a2 2 0 002-2v-1"/>
            </svg>
            Upload
          </button>

          <!-- Zoom controls -->
          <div class="shrink-0 flex items-center gap-1">
            <button
              class="w-6 h-6 flex items-center justify-center rounded text-gray-400
                     hover:bg-gray-100 hover:text-gray-700 text-base leading-none"
              @click="treeZoom = parseFloat(Math.max(treeZoom - 0.1, 0.4).toFixed(2))"
            >−</button>
            <button
              class="text-xs text-gray-400 hover:text-gray-700 tabular-nums w-9 text-center"
              @click="treeZoom = 1"
            >{{ Math.round(treeZoom * 100) }}%</button>
            <button
              class="w-6 h-6 flex items-center justify-center rounded text-gray-400
                     hover:bg-gray-100 hover:text-gray-700 text-base leading-none"
              @click="treeZoom = parseFloat(Math.min(treeZoom + 0.1, 2).toFixed(2))"
            >+</button>
          </div>
        </div>

        <div class="flex-1 overflow-auto py-1">
          <div ref="treeContent" :style="{ zoom: treeZoom }">
            <OrgChart
              :node="root"
              :selected-node="selectedNode"
              :depth="0"
              @select="selectedNode = $event"
            />
          </div>
        </div>
      </aside>

      <!-- Drag handle -->
      <div
        class="w-1 shrink-0 bg-gray-200 hover:bg-indigo-400 transition-colors duration-150
               cursor-col-resize relative group"
        @mousedown.prevent="startResize"
      >
        <div class="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col items-center
                    justify-center gap-0.75 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="w-0.75 h-0.75 rounded-full bg-white" />
          <div class="w-0.75 h-0.75 rounded-full bg-white" />
          <div class="w-0.75 h-0.75 rounded-full bg-white" />
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
