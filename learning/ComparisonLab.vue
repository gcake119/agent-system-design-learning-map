<script setup>
import { ref } from 'vue';
import SystemDiagram from './SystemDiagram.vue';
defineProps({ scene:Object, choice:Number, variant:Number });
defineEmits(['variant']);
const prediction = ref('');
</script>
<template>
  <section class="comparison-lab" aria-label="設計比較實驗">
    <details class="evidence-panel"><summary>查看判斷依據</summary><ul><li v-for="item in scene.evidence" :key="item">{{ item }}</li></ul></details>
    <label class="prediction">先預測：哪一步會不同？為什麼？<textarea v-model="prediction" rows="2" placeholder="可先口頭說明，也可以寫下預測。這裡不計分。"></textarea></label>
    <div v-if="scene.variants" class="condition-controls" aria-label="條件變更">
      <span>改變一項條件：</span>
      <button :aria-pressed="variant === 0" @click="$emit('variant',0)">原始情境</button>
      <button :aria-pressed="variant === 1" @click="$emit('variant',1)">{{ scene.variants[1].label }}</button>
    </div>
    <p v-if="choice < 0" class="quiet">先選下方方案觀察結果，再切換另一方案比較；兩種做法的適用條件不一定相同。</p>
    <div v-else class="trajectory-comparison">
      <section v-for="(option,i) in scene.choices" :key="variant + '-' + i" :class="{ selected:choice===i }">
        <h3>{{ option.label }} <small v-if="choice===i">目前選擇</small></h3>
        <SystemDiagram unit="comparison" :labels="['採用依據','執行方式','結果與代價']" :states="option.cards" :focus="2" :animate="choice===i" :title="option.label" />
        <p>{{ option.feedback }}</p>
      </section>
    </div>
  </section>
</template>
