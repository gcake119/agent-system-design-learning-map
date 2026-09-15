import { ref, computed } from 'vue'
import { foundations } from '../data/topics.mjs'
const viewed = ref<string[]>([])
let loaded = false
export function useProgress() {
  const unlocked = computed(() => foundations.every(id => viewed.value.includes(id)))
  function load() {
    if (loaded || typeof window === 'undefined') return
    loaded = true
    try {
      const value = JSON.parse(localStorage.getItem('agent-learning-viewed-v1') || '[]')
      if (Array.isArray(value)) viewed.value = value.filter(v => typeof v === 'string')
    } catch { /* Storage is optional. */ }
  }
  function mark(id: string) {
    if (!viewed.value.includes(id)) viewed.value.push(id)
    try { localStorage.setItem('agent-learning-viewed-v1', JSON.stringify(viewed.value)) } catch { /* Session still works. */ }
  }
  return { viewed, unlocked, load, mark }
}
