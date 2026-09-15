<script setup lang="ts">
import { computed, ref } from 'vue'

const step = ref(0)
const running = ref(false)
const states = [
  { phase: '等待開始', detail: '任務尚未執行', status: 'READY' },
  { phase: 'Observe', detail: '讀取使用者需求與目前狀態', status: 'CONTEXT LOADED' },
  { phase: 'Reason / Plan', detail: '決定查詢案件狀態', status: 'TOOL SELECTED' },
  { phase: 'Act', detail: '呼叫 case.lookup', status: 'TOOL CALLED' },
  { phase: 'Observe', detail: '取得工具結果：pending', status: 'RESULT RECEIVED' },
  { phase: '完成', detail: '回傳下一步建議', status: 'DONE' },
]
const current = computed(() => states[step.value])
function next() { if (step.value < states.length - 1) step.value += 1 }
function reset() { step.value = 0; running.value = false }
</script>

<template>
  <div class="loop-demo">
    <div class="loop-visual">
      <div v-for="(label, i) in ['Observe', 'Reason / Plan', 'Act']" :key="label" :class="['loop-step', { active: current.phase === label }]">
        <small>0{{ i + 1 }}</small><strong>{{ label }}</strong>
      </div>
      <div class="loop-center"><span>Iteration</span><b>{{ Math.min(step, 4) }}</b><small>/ 5</small></div>
    </div>
    <div class="run-console">
      <span class="status">{{ current.status }}</span>
      <h3>{{ current.phase }}</h3><p>{{ current.detail }}</p>
      <div class="demo-actions"><button @click="reset">重設</button><button class="primary" :disabled="step === states.length - 1" @click="next">執行下一步</button></div>
    </div>
  </div>
</template>
