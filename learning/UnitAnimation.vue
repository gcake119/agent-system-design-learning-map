<script setup>
import { computed, ref } from 'vue';
import SystemDiagram from './SystemDiagram.vue';
import { animations, initialAnimation, changeAnimation, timelineRows } from './animations.mjs';
const props=defineProps({unit:{type:String,required:true}});
const config=computed(()=>animations[props.unit]);
const state=ref(initialAnimation()), history=ref([]), playback=ref(0), motion=ref(true);
const mode=computed(()=>config.value.modes[state.value.mode]);
const current=computed(()=>mode.value.frames[state.value.step-1]);
const next=computed(()=>mode.value.frames[state.value.step]);
const traces=computed(()=>mode.value.frames.slice(0,state.value.step).flatMap(f=>f.trace?[f.trace]:[]));
function perform(event) {
  const after=changeAnimation(props.unit,state.value,event);
  if(after===state.value)return;
  history.value.push({...state.value});state.value=after;playback.value++;
}
function undo(){if(history.value.length){state.value=history.value.pop();playback.value++;}}
</script>
<template>
  <section class="unit-animation" aria-label="單元動畫實驗" :class="{'motion-off':!motion}">
    <p class="eyebrow">動手看流程 · {{ state.step }} / {{ mode.frames.length }} 個動作</p>
    <h2>{{ config.title }}</h2>
    <p><strong>看完要能說明：</strong>{{ config.goal }}</p>
    <div class="animation-modes" aria-label="比較條件"><button v-for="(m,i) in config.modes" :key="m.label" :aria-pressed="state.mode===i" @click="perform({type:'mode',mode:i})">{{ m.label }}</button></div>
    <p class="quiet">切換條件會從相同起點開始。此區的「回到上一步」還原動畫操作；離開單元會重設實驗。</p>
    <label class="motion-toggle"><input type="checkbox" v-model="motion" />播放動態效果（系統設定為減少動態時會直接顯示結果）</label>
    <div class="animation-stage" :key="playback">
      <SystemDiagram :unit="unit" :labels="config.nodes" :states="current?.states || []" :focus="current?.focus ?? -1" :from="current?.from ?? -1" :lost="!!current?.lost" :parallel="unit==='optimization' && !!current?.timeline && !current?.dependent" :animate="!!current && motion" :title="config.title" />
      <section v-if="unit==='context'" class="context-window" aria-label="模型當前資訊容量">
        <h3>Context Window · {{ (current?.items || []).reduce((n,item)=>n+item[1],0) }} / 10 教學容量單位</h3>
        <div class="capacity-track"><span v-for="item in current?.items || []" :key="item[0]" :style="{width:item[1]*10+'%'}"></span></div>
        <ul><li v-for="item in current?.items || []" :key="item[0]">{{ item[0] }} · {{ item[1] }} 單位</li></ul>
        <p v-if="!current">按下「{{ next.action }}」，觀察哪些資料進入模型。</p>
      </section>
      <section v-if="unit==='reliability'" class="database-records" aria-label="資料庫實際紀錄">
        <h3>資料庫實際效果：{{ current?.records || 0 }} 筆提醒</h3>
        <div v-for="n in current?.records || 0" :key="n" class="record" :class="{duplicate:n>1}">提醒 #{{ n }} · 案件 #1024 補件 <strong v-if="n>1">重複效果</strong></div>
        <p v-if="!current?.records">尚無紀錄</p>
      </section>
      <section v-if="unit==='evidence'" class="trace-list" aria-label="執行紀錄">
        <h3>這次執行的 trace</h3><p v-if="!traces.length">執行動作後，紀錄會逐步出現。</p>
        <details v-for="(trace,i) in traces" :key="state.mode+'-'+i"><summary>{{ i+1 }} · {{ trace.name }} · 展開證據</summary><dl><dt>輸入</dt><dd>{{ trace.input }}</dd><dt>結果</dt><dd>{{ trace.output }}</dd><dt>來源</dt><dd>{{ trace.source }}</dd></dl></details>
      </section>
      <section v-if="unit==='optimization'" class="timeline-comparison" aria-label="執行時間軸比較">
        <p>時間：0–6 秒。兩條時間軸使用相同刻度；數字為教學假設。</p>
        <template v-if="current"><section v-for="row in timelineRows(current.dependent)" :key="row.label" class="timeline-row"><h3>{{ row.label }} · 總計 {{ row.total }} 秒</h3>
          <div v-for="bar in row.bars" :key="bar.label" class="timeline-track"><span class="timeline-bar" :style="{marginLeft:bar.start/6*100+'%',width:bar.duration/6*100+'%','--delay':bar.start+'s','--duration':bar.duration+'s'}">{{ bar.label }} {{ bar.start }}–{{ bar.start+bar.duration }} 秒</span></div>
        </section></template>
        <p v-else>按下「{{ next.action }}」，同步比較兩條執行流程。</p>
      </section>
      <section v-if="current?.packet" class="handoff-packet" aria-label="交接包"><h3>交接內容</h3><ul><li v-for="item in current.packet" :key="item">{{ item }}</li></ul></section>
    </div>
    <p class="animation-explanation" role="status">{{ current?.explanation || '先選比較條件，再按下動作按鈕。每次只呈現一段變化，完成後停留供你查看。' }}</p>
    <div class="animation-actions">
      <button class="primary" :disabled="!history.length" @click="undo">← 回到上一步</button>
      <button v-if="next" class="primary" @click="perform({type:'act'})">{{ next.action }} →</button>
      <button v-if="current" class="primary" @click="playback++">重播這次變化</button>
    </div>
    <p v-if="!next" class="quiet">此流程已停止。可以切換條件比較，或回到上一步檢查因果。</p>
  </section>
</template>
