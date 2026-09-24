<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import App from './App.vue';
import TokenProfilerDeck from './decks/token-profiler/TokenProfilerDeck.vue';
const isDeck = ref(location.hash === '#/deck/token-profiler');
function sync() { isDeck.value = location.hash === '#/deck/token-profiler'; }
onMounted(() => window.addEventListener('hashchange', sync));
onUnmounted(() => window.removeEventListener('hashchange', sync));
</script>
<template><TokenProfilerDeck v-if="isDeck" /><App v-else /></template>
