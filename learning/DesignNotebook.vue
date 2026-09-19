<script setup>
import {computed,ref,watch} from 'vue';
import {designRoute,nextUnit} from './navigation.mjs';
import {designBriefs} from './deep-content.mjs';
import {NOTEBOOK_KEY,parseNotebook,exportNotebook} from './notebook.mjs';
import {WORKBENCH_KEY,readDesigns,designMarkdown} from './design-workbench.mjs';
import {PRACTICE_KEY,practices,replayPractice,readPractices,practiceMarkdown} from './practice.mjs';
const props=defineProps({unit:String,startUnit:String});
const ids=Object.keys(practices),selected=ref(props.unit||props.startUnit||ids[0]),saved=ref({}),history=ref(Object.fromEntries(ids.map(id=>[id,[]]))),status=ref(''),motion=ref(true),playback=ref(0),storageFailed=ref(false),oldNotes=ref({}),oldDesigns=ref({});
try{saved.value=readPractices(localStorage.getItem(PRACTICE_KEY));oldNotes.value=parseNotebook(localStorage.getItem(NOTEBOOK_KEY));oldDesigns.value=readDesigns(localStorage.getItem(WORKBENCH_KEY));}catch{storageFailed.value=true;}
watch(()=>props.startUnit,value=>{if(ids.includes(value))selected.value=value;});
const id=computed(()=>props.unit||selected.value),task=computed(()=>practices[id.value]),events=computed(()=>history.value[id.value]),state=computed(()=>replayPractice(id.value,events.value)),scene=computed(()=>task.value.scenes[state.value.scene]),continuation=computed(()=>nextUnit(id.value));
const savedScene=computed(()=>saved.value[id.value]?task.value.scenes[replayPractice(id.value,saved.value[id.value]).scene]:null);
function selectUnit(key){selected.value=key;status.value='';window.history.replaceState(null,'',designRoute(key));}
function perform(type,index){if(events.value.length>=150){status.value='這次操作紀錄已滿，請重新練習。';return;}history.value[id.value]=[...events.value,{type,index}];playback.value++;status.value='';}
function undo(){history.value[id.value]=events.value.slice(0,-1);playback.value++;status.value='已還原剛才的選擇與案件狀態。';}
function restart(){history.value[id.value]=[];playback.value++;status.value='已回到案件起點，保存過的規則仍保留。';}
function save(){if(!scene.value.rule)return;try{const all=readPractices(localStorage.getItem(PRACTICE_KEY));all[id.value]=events.value.map(e=>({...e}));localStorage.setItem(PRACTICE_KEY,JSON.stringify({version:3,entries:all}));saved.value=all;storageFailed.value=false;status.value='已保存這次操作與處理規則。';}catch{storageFailed.value=true;status.value='無法保存，請下載這次處理紀錄。';}}
function download(current=false){let all={...saved.value};try{all={...all,...readPractices(localStorage.getItem(PRACTICE_KEY))};}catch{}if(current&&scene.value.rule)all[id.value]=events.value;let text=practiceMarkdown(all);if(Object.keys(oldDesigns.value).length)text+='\n\n# 保留的舊版設計\n\n'+designMarkdown(oldDesigns.value);if(Object.values(oldNotes.value).some(e=>[e.approach,...e.fields,e.rationale,e.tradeoff,e.revisit].some(t=>t.trim())))text+='\n\n# 保留的舊版筆記\n\n'+exportNotebook(oldNotes.value);const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='agent-case-rules.md';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.value='已發出下載請求，請查看瀏覽器下載項目。';}
</script>
<template>
 <section class="notebook case-practice" aria-label="案件設計練習" :class="{'motion-off':!motion}">
  <template v-if="!unit"><h1>處理一個案件，學會一條設計規則</h1><p>先做眼前的決定，看看會發生什麼。完成後，系統會把你的操作整理成規則。</p><nav class="design-unit-nav" aria-label="選擇練習單元"><button v-for="key in ids" :key="key" :aria-pressed="id===key" @click="selectUnit(key)">{{designBriefs[key].title}}<small>{{saved[key]?'已保存練習':'尚未保存'}}</small></button></nav></template>
  <div class="case-brief"><p class="eyebrow">案件 #1024 · {{designBriefs[id].title}}</p><h2>{{task.title}}</h2><p>{{task.brief}}</p></div>
  <label class="practice-motion"><input type="checkbox" v-model="motion"/>播放操作動畫</label>
  <section class="case-scene" :key="id+'-'+state.scene+'-'+playback" aria-label="目前案件狀態">
   <h3>{{scene.title}}</h3>
   <div class="case-artifacts"><article v-for="(item,n) in scene.cards" :key="item.title" class="case-artifact" :class="'artifact-'+item.status" :style="{'--arrival':n*0.12+'s'}"><div class="paper-corner" aria-hidden="true"></div><p class="artifact-kind">{{item.status==='danger'?'！需要修正':item.status==='success'?'✓ 已確認':item.status==='pending'?'◷ 尚待處理':'案件資料'}}</p><h4>{{item.title}}</h4><p>{{item.body}}</p></article></div>
   <template v-if="scene.pick"><h4>桌上的資料</h4><div class="pick-documents"><button v-for="(item,n) in scene.pick" :key="item.title" :aria-pressed="state.selected.includes(n)" @click="perform('toggle',n)"><strong>{{state.selected.includes(n)?'✓ 已放入':'＋ 放入'}} {{item.title}}</strong><span>{{item.body}}</span></button></div><div class="selected-packet" aria-label="已選的資料包"><h4>你的{{id==='multi'?'交接包':'資料包'}} · {{state.selected.length}} 份</h4><p v-if="!state.selected.length">點選上方文件，把資料放進來。</p><span v-for="n in state.selected" :key="n" class="packet-chip">{{scene.pick[n].title}}</span></div></template>
   <div v-if="scene.timeline" class="workbench-timeline" aria-label="實際執行時間軸"><p>教學假設 · 同一刻度 0–6 秒</p><div v-for="bar in [{label:'查案件',start:0,duration:3},{label:'查信箱',start:scene.timeline==='parallel'?0:3,duration:2},{label:'核對',start:scene.timeline==='parallel'?3:5,duration:1}]" :key="bar.label"><p>{{bar.label}}：{{bar.start}}–{{bar.start+bar.duration}} 秒</p><div class="timeline-track"><span class="timeline-bar" :style="{marginLeft:bar.start/6*100+'%',width:bar.duration/6*100+'%','--delay':bar.start+'s','--duration':bar.duration+'s'}"></span></div></div></div>
  </section>
  <div class="animation-actions"><button class="primary" :disabled="!events.length" @click="undo">← 回到上一步</button><button v-for="(action,n) in scene.actions" :key="action.label" class="primary" @click="perform('act',n)">{{action.label}} →</button><button v-if="events.length" class="primary" @click="playback++">重播這次變化</button></div>
  <section v-if="scene.rule" class="design-result" aria-label="從操作學到的規則"><p class="eyebrow">{{scene.warning?'這次發現的問題':'從剛才的操作整理'}}</p><h3>{{scene.warning?'這個做法需要調整':'可以留下的處理規則'}}</h3><p>{{scene.rule}}</p><p><strong>對應的設計觀念：</strong>{{scene.term}}</p><p v-if="scene.warning">可以回到上一步，試試另一種處理方式。</p><div class="animation-actions"><button class="primary" @click="save">{{scene.warning?'保存這次待改善紀錄':'保存這條處理規則'}}</button><button class="primary" @click="restart">重新處理這個案件</button><button v-if="storageFailed" class="primary" @click="download(true)">下載這次處理紀錄</button></div></section>
  <p v-if="status" role="status">{{status}}</p>
  <details v-if="savedScene" class="evidence-panel"><summary>查看已保存的處理規則</summary><p>{{savedScene.title}}</p><p>{{savedScene.rule}}</p><p>{{savedScene.warning?'此紀錄仍待改善。':'只代表這個教學案例的結果，未驗證真實系統。'}}</p></details>
  <details v-if="oldDesigns[id]||oldNotes[id]" class="evidence-panel"><summary>保留的舊版設計與筆記</summary><p>原本的內容保留在此瀏覽器，下載時會一併附上。</p><pre v-if="oldDesigns[id]">{{designMarkdown({[id]:oldDesigns[id]})}}</pre><pre v-if="oldNotes[id]">{{exportNotebook({[id]:oldNotes[id]})}}</pre></details>
  <div class="action-row"><button class="primary" @click="download(false)">下載已保存的處理規則</button><a v-if="unit" class="text-link" :href="designRoute(id)">查看七個單元的練習 →</a></div><p class="quiet">案例均為教學模擬，不會修改真實資料。保存後留在此瀏覽器；回退不會刪除已保存規則。</p>
  <section class="unit-continuation" aria-label="繼續學習"><template v-if="continuation"><p class="eyebrow">接下來的學習主題</p><h2>單元 {{continuation.number}} · {{continuation.title}}</h2><p>{{continuation.conclusion}}</p><p class="quiet">可先保存這次練習，也可以直接繼續學習。</p><a class="primary" :href="continuation.href">繼續單元 {{continuation.number}}：{{continuation.title}} →</a></template><template v-else><h2>已到最後一個單元</h2><a class="primary" href="#/map">返回章節地圖 →</a></template></section>
 </section>
</template>
