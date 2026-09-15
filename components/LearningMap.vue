<script setup lang="ts">
import { useNav } from '@slidev/client'
import { topics } from '../data/topics.mjs'
import { useProgress } from '../composables/progress'
defineProps<{ active?: string }>()
const { go } = useNav()
const { viewed, unlocked } = useProgress()
</script>
<template>
  <div class="learning-map" @keydown.stop>
    <svg class="map-connectors" viewBox="0 0 888 330" preserveAspectRatio="none" aria-hidden="true">
      <path d="M350 100 L275 45 M538 100 L613 45 M554 165 H703 M538 235 L613 290 M350 235 L275 290 M334 165 H185" />
    </svg>
    <button class="loop-core" @click="go(3)" aria-label="Agent Loop：前往章節">
      <small>Observe / Reason / Act</small><strong>Agent Loop</strong><span>任務如何持續執行</span>
    </button>
    <button v-for="(topic, i) in topics.slice(1)" :key="topic.id" class="map-topic" :class="'topic-' + i"
      :disabled="topic.id === 'multi' && !unlocked" :aria-label="topic.title + '：' + (topic.id === 'multi' && !unlocked ? '需先瀏覽五個基礎章節' : '前往章節')" @click="go(topic.slide)">
      <b>{{ topic.title }}</b><small>{{ topic.detail }}</small>
      <i>{{ topic.id === 'multi' && !unlocked ? '先瀏覽五個基礎章節' : viewed.includes(topic.id) ? '已瀏覽 ✓' : '進入章節' }}</i>
    </button>
    <p class="map-help">點選主題自由探索。「已瀏覽」僅記錄閱讀進度，不代表通過評量。</p>
  </div>
</template>
