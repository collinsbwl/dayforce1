<script setup>
import { computed } from 'vue'

const props = defineProps({ node: Object })

const row = computed(() => props.node.data.data)

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

const performanceBadge = computed(() => {
  const p = row.value['Performance'] || ''
  if (p.includes('Outstanding'))       return { label: p, cls: 'bg-green-100 text-green-700' }
  if (p.includes('High Performer'))    return { label: p, cls: 'bg-blue-100 text-blue-700' }
  if (p.includes('Exceeds'))           return { label: p, cls: 'bg-teal-100 text-teal-700' }
  if (p.includes('Needs Improvement')) return { label: p, cls: 'bg-red-100 text-red-700' }
  if (p.includes('At Risk'))           return { label: p, cls: 'bg-orange-100 text-orange-700' }
  return { label: p, cls: 'bg-gray-100 text-gray-500' }
})

function fmtCurrency(val) {
  if (val == null || val === 0) return '—'
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(1)}K`
  return `$${Math.round(val).toLocaleString()}`
}

const metrics = computed(() => [
  {
    label: 'Own Salary',
    value: fmtCurrency(props.node.salary),
    sub: 'this person only',
  },
  {
    label: 'Descendants',
    value: props.node.descendantCount.toLocaleString(),
    sub: `${props.node.nonLeafDescendants} managers`,
  },
  {
    label: 'Total Cost',
    value: fmtCurrency(props.node.totalCost),
    sub: 'all descendants',
  },
  {
    label: 'IC Cost',
    value: fmtCurrency(props.node.icCost),
    sub: 'individual contributors',
  },
  {
    label: 'Mgmt Cost',
    value: fmtCurrency(props.node.mgmtCost),
    sub: 'manager descendants',
  },
  {
    label: 'Mgmt Ratio',
    value: props.node.mgmtCostRatio != null
      ? props.node.mgmtCostRatio.toFixed(2)
      : '—',
    sub: 'mgmt cost ÷ IC cost',
  },
])
</script>

<template>
  <div class="p-8 max-w-lg">

    <!-- Header -->
    <div class="flex items-start gap-4 mb-6">
      <div
        class="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center
               text-white text-lg font-bold uppercase tracking-wide"
        :style="{ backgroundColor: avatarColor }"
      >
        {{ initials }}
      </div>

      <div class="min-w-0 flex-1 pt-0.5">
        <h2 class="text-lg font-semibold text-gray-900 leading-snug">
          {{ row['Name'] }}
        </h2>
        <p class="text-sm text-gray-500 mt-0.5 leading-snug">{{ row['Job Title'] }}</p>

        <span
          v-if="row['Performance']"
          :class="['inline-block mt-2 text-xs font-medium px-2.5 py-0.5 rounded-full',
                   performanceBadge.cls]"
        >
          {{ performanceBadge.label }}
        </span>
      </div>
    </div>

    <!-- Meta -->
    <div class="flex flex-col gap-1.5 text-xs text-gray-500 mb-6 pb-6 border-b border-gray-100">
      <div v-if="row['Department']" class="flex items-center gap-2">
        <span class="w-3.5 text-gray-300">◈</span>
        <span>{{ row['Department'] }}</span>
      </div>
      <div v-if="row['Location']" class="flex items-center gap-2">
        <span class="w-3.5 text-gray-300">◉</span>
        <span>{{ row['Location'] }}</span>
      </div>
      <div v-if="row['Entity']" class="flex items-center gap-2">
        <span class="w-3.5 text-gray-300">◻</span>
        <span>{{ row['Entity'] }}</span>
      </div>
    </div>

    <!-- Metrics grid -->
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="m in metrics"
        :key="m.label"
        class="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
      >
        <p class="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">
          {{ m.label }}
        </p>
        <p class="text-2xl font-semibold text-gray-900 tabular-nums leading-none">
          {{ m.value }}
        </p>
        <p class="text-[11px] text-gray-400 mt-1">{{ m.sub }}</p>
      </div>
    </div>

  </div>
</template>
