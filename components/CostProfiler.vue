<script setup lang="ts">
import { computed, ref } from 'vue'
import { profile } from '../data/simulations.mjs'
const toggles = ref({ context: false, tools: false, rules: false, routing: false })
const metrics = computed(() => profile(toggles.value))
const options = [
  ['context','移除無關 context'], ['tools','合併工具查詢'], ['rules','用規則取代模型'], ['routing','簡單任務改用小模型']
] as const
</script>

<template>
  <div class="profiler" @keydown.stop>
    <div class="profiler-options"><label v-for="o in options" :key="o[0]"><input v-model="toggles[o[0]]" type="checkbox"><span>{{ o[1] }}</span></label></div>
    <div class="profiler-metrics"><div><strong>{{ metrics.calls }}</strong><span>model calls</span></div><div><strong>{{ metrics.tools }}</strong><span>tool calls</span></div><div><strong>{{ metrics.tokens }}k</strong><span>input tokens</span></div><div><strong>{{ metrics.time }}s</strong><span>latency</span></div><div class="cost"><strong>${{ metrics.cost }}</strong><span>estimated cost</span></div></div>
    <p class="sim-note">教學假設，非實測或報價。固定減量僅用來比較策略，品質仍須另行評估。</p>
  </div>
</template>
