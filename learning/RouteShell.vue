<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import App from './App.vue';
import TokenProfilerDeck from './decks/token-profiler/TokenProfilerDeck.vue';
import LearningMapV2 from './v2/LearningMapV2.vue';
import './v2/v2.css';
const isDeck = ref(location.hash === '#/deck/token-profiler');
const isV2 = ref(location.hash.startsWith('#/v2'));
function sync() { isDeck.value = location.hash === '#/deck/token-profiler'; isV2.value = location.hash.startsWith('#/v2'); }
onMounted(() => window.addEventListener('hashchange', sync));
onUnmounted(() => window.removeEventListener('hashchange', sync));
</script>
<template><TokenProfilerDeck v-if="isDeck" /><LearningMapV2 v-else-if="isV2" /><App v-else /></template>
