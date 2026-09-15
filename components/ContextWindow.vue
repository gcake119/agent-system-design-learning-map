<script setup lang="ts">
import { computed, ref } from 'vue'
import { contextMetrics } from '../data/simulations.mjs'

const items = ref([
  { name: '目前需求', size: 12, relevance: 100, stale: false, on: true },
  { name: '任務狀態', size: 18, relevance: 95, stale: false, on: true },
  { name: '最新工具結果', size: 16, relevance: 90, stale: false, on: true },
  { name: '相關文件', size: 22, relevance: 80, stale: false, on: false },
  { name: '舊對話摘要', size: 20, relevance: 45, stale: true, on: false },
  { name: '無關歷史紀錄', size: 24, relevance: 10, stale: true, on: false },
])
const selected = computed(() => items.value.filter(i => i.on))
const metrics = computed(() => contextMetrics(items.value))
const used = computed(() => metrics.value.used)
const relevant = computed(() => metrics.value.relevant)
const stale = computed(() => metrics.value.stale)
</script>

<template>
  <div class="context-sim" @keydown.stop>
    <div class="context-list"><h3>可用資訊</h3><label v-for="item in items" :key="item.name"><input v-model="item.on" type="checkbox"><span>{{ item.name }}</span><small>{{ item.size }}%</small></label></div>
    <div class="window-meter">
      <div class="meter-title"><span>Context Window</span><strong>{{ used }}%</strong></div>
      <div class="meter"><i :style="{ width: `${Math.min(used, 100)}%` }"></i></div>
      <div class="context-blocks"><span v-for="item in selected" :key="item.name" :class="{ stale: item.stale }" :style="{ flex: item.size }">{{ item.name }}</span></div>
      <div class="context-metrics"><div><b>{{ relevant }}%</b><span>相關性</span></div><div><b>{{ stale }}%</b><span>過時內容</span></div><div><b>{{ Math.max(0, 100-used) }}%</b><span>剩餘容量</span></div></div>
      <p class="sim-note" aria-live="polite">{{ used > 100 ? '超出容量 ' + (used - 100) + '%：請移除或壓縮資訊。' : '教學模擬：相關性為容量加權分數，過時內容為已選資料占比。' }}</p>
    </div>
  </div>
</template>
