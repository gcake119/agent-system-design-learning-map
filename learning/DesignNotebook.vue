<script setup>
import {computed,ref,watch} from 'vue';
import SystemLab from './SystemLab.vue';
import {LAB_KEY,readLabs} from './system-lab.mjs';
import {designRoute,nextUnit} from './navigation.mjs';
import {designBriefs} from './deep-content.mjs';
import {NOTEBOOK_KEY,parseNotebook,exportNotebook} from './notebook.mjs';
import {WORKBENCH_KEY,readDesigns,designMarkdown} from './design-workbench.mjs';
import {PRACTICE_KEY,practices,readPractices,practiceMarkdown} from './practice.mjs';
const props=defineProps({unit:String,startUnit:String});
const ids=Object.keys(practices),selected=ref(props.unit||props.startUnit||ids[0]),saved=ref({}),status=ref(''),oldNotes=ref({}),oldDesigns=ref({}),labSaved=ref({});
function refreshLabSaved(){try{labSaved.value=readLabs(localStorage.getItem(LAB_KEY));}catch{}}
refreshLabSaved();
try{saved.value=readPractices(localStorage.getItem(PRACTICE_KEY));oldNotes.value=parseNotebook(localStorage.getItem(NOTEBOOK_KEY));oldDesigns.value=readDesigns(localStorage.getItem(WORKBENCH_KEY));}catch{}
watch(()=>props.startUnit,value=>{if(ids.includes(value))selected.value=value;});
const id=computed(()=>props.unit||selected.value),continuation=computed(()=>nextUnit(id.value));
function selectUnit(key){selected.value=key;status.value='';window.history.replaceState(null,'',designRoute(key));}
function download(){let text=practiceMarkdown(saved.value);if(Object.keys(oldDesigns.value).length)text+='\n\n# 保留的舊版設計\n\n'+designMarkdown(oldDesigns.value);if(Object.keys(oldNotes.value).length)text+='\n\n# 保留的舊版筆記\n\n'+exportNotebook(oldNotes.value);const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='agent-previous-notes.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
</script>
<template>
 <section class="notebook case-practice" aria-label="案件設計練習">
  <template v-if="!unit"><h1>操作系統，看見設計如何影響結果</h1><p>調整節點與資料路徑，執行案件，再比較修改前後的差異。</p><nav class="design-unit-nav" aria-label="選擇練習單元"><button v-for="key in ids" :key="key" :aria-pressed="id===key" @click="selectUnit(key)">{{designBriefs[key].title}}<small>{{labSaved[key]?'已保存實驗':'尚未保存'}}</small></button></nav></template>
  <SystemLab :unit="id" @saved="refreshLabSaved"/>
  <details v-if="Object.keys(saved).length" class="evidence-panel"><summary>保留的舊版案件練習</summary><pre>{{practiceMarkdown(saved)}}</pre></details>
  <details v-if="oldDesigns[id]||oldNotes[id]" class="evidence-panel"><summary>保留的舊版設計與筆記</summary><p>原本的內容保留在此瀏覽器，下載時會一併附上。</p><pre v-if="oldDesigns[id]">{{designMarkdown({[id]:oldDesigns[id]})}}</pre><pre v-if="oldNotes[id]">{{exportNotebook({[id]:oldNotes[id]})}}</pre></details>
  <div class="action-row"><button class="primary" @click="download(false)">下載舊版筆記與處理規則</button><a v-if="unit" class="text-link" :href="designRoute(id)">查看七個單元的練習 →</a></div><p class="quiet">案例均為教學模擬，不會修改真實資料。保存後留在此瀏覽器；回退不會刪除已保存規則。</p>
  <section class="unit-continuation" aria-label="繼續學習"><template v-if="continuation"><p class="eyebrow">接下來的學習主題</p><h2>單元 {{continuation.number}} · {{continuation.title}}</h2><p>{{continuation.conclusion}}</p><p class="quiet">可先保存這次練習，也可以直接繼續學習。</p><a class="primary" :href="continuation.href">繼續單元 {{continuation.number}}：{{continuation.title}} →</a></template><template v-else><h2>已到最後一個單元</h2><a class="primary" href="#/map">返回章節地圖 →</a></template></section>
 </section>
</template>
