<script setup lang="ts">
import { ref } from 'vue'
const open = ref(2)
const spans = [
  { name: 'User request', time: '0 ms', detail: '查詢 Case #1024 並建議下一步' },
  { name: 'Context retrieval', time: '320 ms', detail: '命中 case-policy.md、case-status.json' },
  { name: 'Model', time: '1.2 s', detail: 'decision: case.lookup · input 1,842 tokens' },
  { name: 'Tool · case.lookup', time: '430 ms', detail: 'status: pending · success: true' },
  { name: 'Model', time: '1.1 s', detail: '產生建議並引用工具結果' },
  { name: 'Final response', time: '18 ms', detail: '3,068 ms，四捨五入為 3.07 s · 模擬費用 $0.018' },
]
</script>

<template>
  <div class="trace-viewer" @keydown.stop>
    <div class="trace-summary"><span>Run #0042</span><b>3.07 s</b><b>$0.018</b><b>2,936 tokens</b></div>
    <div class="trace-spans"><button v-for="(span, i) in spans" :key="i" :aria-expanded="open === i" :class="{ open: open === i }" @click="open = open === i ? -1 : i"><i></i><strong>{{ span.name }}</strong><small>{{ span.time }}</small><p v-if="open === i">{{ span.detail }}</p></button></div>
    <p class="sim-note">模擬 trace，非真實執行。記錄可見決策與工具事件，正式紀錄須遮蔽敏感資料。</p>
  </div>
</template>
