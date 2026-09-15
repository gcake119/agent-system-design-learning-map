<script setup lang="ts">
import { computed, ref } from 'vue'
const questions = [
  { q: '回傳 JSON 是否符合既定 schema？', answer: 'rule', why: '格式與欄位可以由程式明確驗證。' },
  { q: '摘要是否忠實保留訪談重點？', answer: 'judge', why: '忠實度涉及語意理解，需要模型或人工判斷。' },
  { q: 'Agent 是否在寫入前取得必要權限？', answer: 'rule', why: '權限檢查應該留下可確定的系統紀錄。' },
]
const index = ref(0)
const choice = ref<string | null>(null)
const current = computed(() => questions[index.value])
function next(){ index.value=(index.value+1)%questions.length; choice.value=null }
</script>

<template>
  <div class="eval-quiz">
    <div class="quiz-count">0{{ index+1 }} / 03</div><h3>{{ current.q }}</h3>
    <div class="quiz-options"><button :class="{ selected: choice==='rule' }" @click="choice='rule'">Deterministic validator</button><button :class="{ selected: choice==='judge' }" @click="choice='judge'">Model judge / Human</button></div>
    <div v-if="choice" :class="['quiz-feedback', { correct: choice===current.answer }]"><strong>{{ choice===current.answer ? '判斷正確' : '再想一下' }}</strong><span>{{ current.why }}</span><button @click="next">下一題</button></div>
  </div>
</template>
