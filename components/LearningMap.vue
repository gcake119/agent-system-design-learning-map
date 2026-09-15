<script setup lang="ts">
defineProps<{ active?: string }>()
const topics = [
  ['context', 'Context', '每一步要看什麼'],
  ['reliability', 'Reliability', '失敗時怎麼辦'],
  ['observability', 'Observability', '如何看見過程'],
  ['evaluation', 'Evaluation', '怎麼證明做對'],
  ['optimization', 'Optimization', '如何更快更省'],
  ['multi', 'Multi-Agent', '何時需要分工'],
]
</script>

<template>
  <div class="learning-map" :class="`active-${active}`">
    <div class="loop-core"><small>Observe · Reason · Act</small><strong>Agent Loop</strong><span>任務如何持續執行</span></div>
    <div v-for="(topic, i) in topics" :key="topic[0]" class="map-topic" :class="[`topic-${i}`, { locked: topic[0] === 'multi' }]">
      <b>{{ topic[1] }}</b><small>{{ topic[2] }}</small><i v-if="topic[0] === 'multi'">LOCKED</i>
    </div>
  </div>
</template>
