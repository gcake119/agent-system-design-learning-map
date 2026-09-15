<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useNav } from '@slidev/client'
import { topics } from './data/topics.mjs'
import { useProgress } from './composables/progress'
const { currentSlideNo, total, go, isPrintMode } = useNav()
const { load, mark } = useProgress()
onMounted(() => {
  load()
  watch(currentSlideNo, page => {
    const topic = topics.find(t => t.slide === page)
    if (topic && !isPrintMode.value) mark(topic.id)
  }, { immediate: true })
})
</script>
<template>
  <nav v-if="!isPrintMode" class="deck-footer" aria-label="簡報導覽" @keydown.stop>
    <button @click="go(1)">首頁</button>
    <button @click="go(2)">學習地圖</button>
    <span>{{ currentSlideNo }} / {{ total }}</span>
    <button :disabled="currentSlideNo <= 1" @click="go(currentSlideNo - 1)">上一頁</button>
    <button :disabled="currentSlideNo >= total" @click="go(currentSlideNo + 1)">下一頁</button>
  </nav>
</template>
