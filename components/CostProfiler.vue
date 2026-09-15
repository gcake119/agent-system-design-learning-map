<script setup lang="ts">
import { computed, ref } from 'vue'
const toggles = ref({ context: false, tools: false, rules: false, routing: false })
const metrics = computed(() => {
  let calls=12, tools=8, tokens=48, time=14.2, cost=.41
  if(toggles.value.context){ tokens-=16; time-=1.5; cost-=.09 }
  if(toggles.value.tools){ tools-=4; calls-=2; time-=3.1; cost-=.04 }
  if(toggles.value.rules){ calls-=3; time-=2.0; cost-=.10 }
  if(toggles.value.routing){ cost-=.08; time-=1.0 }
  return { calls, tools, tokens, time: Math.max(4.5,time).toFixed(1), cost: Math.max(.06,cost).toFixed(2) }
})
const options = [
  ['context','移除無關 context'], ['tools','合併工具查詢'], ['rules','用規則取代模型'], ['routing','簡單任務改用小模型']
] as const
</script>

<template>
  <div class="profiler">
    <div class="profiler-options"><label v-for="o in options" :key="o[0]"><input v-model="toggles[o[0]]" type="checkbox"><span>{{ o[1] }}</span></label></div>
    <div class="profiler-metrics"><div><strong>{{ metrics.calls }}</strong><span>model calls</span></div><div><strong>{{ metrics.tools }}</strong><span>tool calls</span></div><div><strong>{{ metrics.tokens }}k</strong><span>input tokens</span></div><div><strong>{{ metrics.time }}s</strong><span>latency</span></div><div class="cost"><strong>${{ metrics.cost }}</strong><span>estimated cost</span></div></div>
  </div>
</template>
