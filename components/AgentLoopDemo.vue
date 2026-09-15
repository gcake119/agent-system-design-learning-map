<script setup lang="ts">
import { ref, computed } from 'vue'
import { loopState, loopNext } from '../data/simulations.mjs'
const current = ref(loopState())
const fail = ref(false)
const maxRounds = ref(3)
const finished = computed(() => ['DONE', 'HUMAN'].includes(current.value.status))
function reset() { current.value = loopState() }
</script>
<template>
  <div class="loop-demo" @keydown.stop>
    <div class="loop-visual">
      <div v-for="(label, i) in ['Observe', 'Reason / Plan', 'Act']" :key="label" :class="['loop-step', { active: current.phase === label }]">
        <small>0{{ i + 1 }}</small><strong>{{ label }}</strong>
      </div>
      <div class="loop-center"><span>第</span><b>{{ current.round }}</b><small>輪 / 上限 {{ maxRounds }}</small></div>
    </div>
    <div class="run-console">
      <label><input v-model="fail" type="checkbox" @change="reset"> 模擬唯讀查詢逾時</label>
      <label>迴圈上限 <select v-model.number="maxRounds" @change="reset"><option :value="1">1</option><option :value="3">3</option><option :value="5">5</option></select></label>
      <div aria-live="polite"><span class="status">{{ current.status }} · 工具呼叫 {{ current.actions }} 次</span>
      <h3>{{ current.phase }}</h3><p>{{ current.detail }}</p></div>
      <div class="demo-actions"><button @click="reset">重設</button><button class="primary" :disabled="finished" @click="current = loopNext(current, fail, maxRounds)">執行下一步</button></div>
    </div>
  </div>
</template>
