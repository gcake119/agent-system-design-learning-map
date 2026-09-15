<script setup lang="ts">
defineProps<{ chapter: string; title: string; subtitle?: string }>()
</script>

<template>
  <header class="slide-header">
    <div class="chapter"><b>{{ chapter }}</b><span>{{ title }}</span></div>
    <h2>{{ title }}</h2>
    <p v-if="subtitle">{{ subtitle }}</p>
  </header>
</template>
