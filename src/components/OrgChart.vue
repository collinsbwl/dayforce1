<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  node: Object,
  selectedNode: Object,
  depth: { type: Number, default: 0 }
})

const emit = defineEmits(['select'])

const isOpen = ref(props.depth === 0)
const row = computed(() => props.node.data.data)
const isSelected = computed(() => props.selectedNode === props.node)
const hasChildren = computed(() => !!props.node.children?.length)

const initials = computed(() => {
  const parts = (row.value['Name'] || '').trim().split(/\s+/)
  return parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : (parts[0]?.[0] ?? '?')
})

const avatarColor = computed(() => {
  const palette = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  ]
  const str = row.value['Name'] || ''
  let hash = 0
  for (const ch of str) hash = (hash * 31 + ch.charCodeAt(0)) & 0xfffffff
  return palette[hash % palette.length]
})
</script>

<template>
  <div>
    <!-- Node row — indentation comes from nested containers, not paddingLeft -->
    <div
      :class="[
        'flex items-center gap-2 pr-3 py-1.5 pl-2 cursor-pointer select-none',
        'border-l-2 transition-colors duration-100',
        isSelected
          ? 'bg-indigo-50 border-indigo-500'
          : 'border-transparent hover:bg-gray-50',
      ]"
      @click="emit('select', node)"
    >
      <!-- Chevron or spacer -->
      <button
        v-if="hasChildren"
        class="shrink-0 w-4 h-4 flex items-center justify-center text-gray-400
               hover:text-gray-600 rounded transition-transform duration-150"
        :class="{ 'rotate-90': isOpen }"
        @click.stop="isOpen = !isOpen"
      >
        <svg viewBox="0 0 6 10" class="w-2 h-2" fill="none"
             stroke="currentColor" stroke-width="1.5"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 1l4 4-4 4"/>
        </svg>
      </button>
      <div v-else class="shrink-0 w-4" />

      <!-- Avatar with initials -->
      <div
        class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center
               text-white text-xs font-semibold uppercase"
        :style="{ backgroundColor: avatarColor }"
      >
        {{ initials }}
      </div>

      <!-- Name + job title -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate leading-tight">
          {{ row['Name'] }}
        </p>
        <p class="text-xs text-gray-400 truncate leading-tight">
          {{ row['Job Title'] }}
        </p>
      </div>

      <!-- Descendant count -->
      <span v-if="node.descendantCount > 0" class="shrink-0 text-xs text-gray-400 tabular-nums">
        {{ node.descendantCount }}
      </span>
    </div>

    <!--
      Children container:
        border-l  → the vertical guide line
        pl-3      → space between the line and child rows (12px)
        ml-5      → indents this whole group from the parent row (20px)

      Each child wrapper:
        The absolute div is the horizontal elbow:
          -left-3  → starts at x = -12px (back at the border-l)
          w-3      → 12px wide, ends exactly where pl-3 content begins
          top-[18px] → vertical center of a ~36px row
    -->
    <div
      v-if="isOpen && hasChildren"
      class="relative ml-5 border-l border-gray-200 pl-3"
    >
      <div
        v-for="child in node.children"
        :key="child.data.id"
        class="relative"
      >
        <!-- Horizontal elbow connector -->
        <div
          class="absolute -left-3 top-4.5 w-3 h-px bg-gray-200 pointer-events-none"
        />
        <OrgChart
          :node="child"
          :selected-node="selectedNode"
          :depth="depth + 1"
          @select="emit('select', $event)"
        />
      </div>
    </div>
  </div>
</template>
