<script setup lang="ts">
import { ref } from 'vue'
const open = ref(2)
const spans = [
  { name: 'User request', time: '0 ms', detail: '查詢 Case #1024 並建議下一步' },
  { name: 'Context retrieval', time: '320 ms', detail: '命中 case-policy.md、case-status.json' },
  { name: 'Model', time: '1.2 s', detail: 'decision: case.lookup · input 1,842 tokens' },
  { name: 'Tool · case.lookup', time: '430 ms', detail: 'status: pending · success: true' },
  { name: 'Model', time: '1.1 s', detail: '產生建議並引用工具結果' },
  { name: 'Final response', time: '18 ms', detail: '總耗時 3.07 s · estimated $0.018' },
]
</script>

<template>
  <div class="trace-viewer">
    <div class="trace-summary"><span>Run #0042</span><b>3.07 s</b><b>$0.018</b><b>2,936 tokens</b></div>
    <div class="trace-spans"><button v-for="(span, i) in spans" :key="span.name" :class="{ open: open === i }" @click="open = open === i ? -1 : i"><i></i><strong>{{ span.name }}</strong><small>{{ span.time }}</small><p v-if="open === i">{{ span.detail }}</p></button></div>
  </div>
</template>
