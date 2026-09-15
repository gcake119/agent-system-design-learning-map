<script setup lang="ts">
import { ref } from 'vue'
const choice = ref<string | null>(null)
const result: Record<string, { tone: string; title: string; body: string }> = {
  retry: { tone: 'danger', title: '可能重複建立', body: '逾時不代表操作失敗。直接重試可能產生第二筆訂單。' },
  check: { tone: 'safe', title: '先釐清目前狀態', body: '查詢是否已有對應訂單，再決定安全重試或沿用既有結果。' },
  human: { tone: 'neutral', title: '安全但成本較高', body: '高風險或狀態仍然模糊時，人工處理是合理的終點。' },
}
</script>

<template>
  <div class="failure-lab">
    <div class="failure-flow"><div>Agent</div><i></i><div>建立訂單</div><i></i><div class="timeout">TIMEOUT</div><i class="dashed"></i><div class="unknown">結果不明</div></div>
    <div class="decision-row"><button :class="{ selected: choice === 'retry' }" @click="choice='retry'">直接重試</button><button :class="{ selected: choice === 'check' }" @click="choice='check'">查詢訂單狀態</button><button :class="{ selected: choice === 'human' }" @click="choice='human'">轉交人工</button></div>
    <div v-if="choice" :class="['decision-result', result[choice].tone]"><strong>{{ result[choice].title }}</strong><span>{{ result[choice].body }}</span></div>
    <div v-else class="decision-result placeholder"><strong>下一步怎麼處理？</strong><span>選一個方案，查看系統風險。</span></div>
  </div>
</template>
