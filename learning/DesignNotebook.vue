<script setup>
import { computed, ref } from 'vue';
import SystemDiagram from './SystemDiagram.vue';
import { designBriefs } from './deep-content.mjs';
import { NOTEBOOK_KEY, parseNotebook, exportNotebook } from './notebook.mjs';
import { WORKBENCH_KEY,workbenches,defaultDesign,readDesigns,simulateDesign,designMarkdown } from './design-workbench.mjs';
const props=defineProps({unit:String});
const ids=Object.keys(workbenches),selected=ref(props.unit||ids[0]),saved=ref({}),legacy=ref({}),status=ref(''),storageFailed=ref(false),motion=ref(true);
try{saved.value=readDesigns(localStorage.getItem(WORKBENCH_KEY));legacy.value=parseNotebook(localStorage.getItem(NOTEBOOK_KEY));}catch{storageFailed.value=true;}
const clone=d=>({...d,choices:[...d.choices]});
const drafts=ref(Object.fromEntries(ids.map(id=>[id,clone(saved.value[id]||defaultDesign())])));
const steps=ref(Object.fromEntries(ids.map(id=>[id,0]))),histories=ref(Object.fromEntries(ids.map(id=>[id,[]]))),playback=ref(0);
const id=computed(()=>props.unit||selected.value),config=computed(()=>workbenches[id.value]),draft=computed(()=>drafts.value[id.value]),simulation=computed(()=>simulateDesign(id.value,draft.value)),step=computed(()=>steps.value[id.value]);
const current=computed(()=>simulation.value.frames[step.value-1]),next=computed(()=>simulation.value.frames[step.value]);
const adopted=computed(()=>JSON.stringify(saved.value[id.value])===JSON.stringify(draft.value));
const oldNote=computed(()=>legacy.value[id.value]);
const hasOld=computed(()=>oldNote.value&&[oldNote.value.approach,...oldNote.value.fields,oldNote.value.rationale,oldNote.value.tradeoff,oldNote.value.revisit].some(t=>t.trim()));
function snapshot(){histories.value[id.value].push({design:clone(draft.value),step:step.value});}
function choose(index,value){if(draft.value.choices[index]===value)return;snapshot();draft.value.choices[index]=value;steps.value[id.value]=0;playback.value++;status.value='設定已改變，重新演練可觀察新的結果。';}
function scenario(value){if(draft.value.scenario===value)return;snapshot();draft.value.scenario=value;steps.value[id.value]=0;playback.value++;status.value='情境已改變，設計選擇保持不變。';}
function act(){if(!next.value)return;snapshot();steps.value[id.value]++;playback.value++;status.value='';}
function undo(){const previous=histories.value[id.value].pop();if(!previous)return;drafts.value[id.value]=previous.design;steps.value[id.value]=previous.step;playback.value++;status.value='已還原上一步的設定與演練進度。';}
function adopt(){if(next.value)return;try{const all=readDesigns(localStorage.getItem(WORKBENCH_KEY));all[id.value]=clone(draft.value);localStorage.setItem(WORKBENCH_KEY,JSON.stringify({version:2,entries:all}));saved.value=all;storageFailed.value=false;status.value='已採用並保存這個設計，重新開啟仍可繼續調整。';}catch{storageFailed.value=true;status.value='無法保存到瀏覽器，請下載目前演練草稿。';}}
function download(currentDraft=false){let all={...saved.value};try{all={...all,...readDesigns(localStorage.getItem(WORKBENCH_KEY))};}catch{}if(currentDraft)all[id.value]=clone(draft.value);let text=designMarkdown(all);if(Object.values(legacy.value).some(e=>[e.approach,...e.fields,e.rationale,e.tradeoff,e.revisit].some(t=>t.trim())))text+='\n\n# 保留的舊版文字筆記\n\n'+exportNotebook(legacy.value);const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='agent-system-design.md';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status.value='已發出下載請求；'+(currentDraft?'包含目前尚未保存的演練草稿。':'內容為已採用的設計與保留的舊筆記。');}
</script>
<template>
 <section class="notebook design-workbench" aria-label="我的系統設計" :class="{'motion-off':!motion}">
  <template v-if="!unit"><h1>動手組成你的案件助手</h1><p>選擇設計、執行案例、觀察結果，再採用方案。七個單元的操作會自動整理成設計草稿。</p>
   <nav class="design-unit-nav" aria-label="選擇設計單元"><button v-for="key in ids" :key="key" :aria-pressed="id===key" @click="selected=key;status=''">{{designBriefs[key].title}}<small>{{ saved[key]?'已採用':'尚未採用' }}</small></button></nav>
  </template>
  <h2>{{designBriefs[id].title}} · 設計工作台</h2>
  <p>每次只改一項選擇，觀察結果如何改變。以下為教學模擬，不會操作真實資料。</p>
  <div class="design-settings">
   <fieldset v-for="(control,index) in config.controls" :key="id+'-'+index"><legend>{{control.label}}</legend><div class="animation-modes"><button v-for="(option,n) in control.options" :key="option" :aria-pressed="draft.choices[index]===n" @click="choose(index,n)">{{option}}</button></div></fieldset>
  </div>
  <fieldset><legend>用哪種情境試驗？</legend><div class="animation-modes"><button v-for="(condition,n) in config.scenario" :key="condition" :aria-pressed="draft.scenario===n" @click="scenario(n)">{{condition}}</button></div></fieldset>
  <label class="workbench-motion"><input type="checkbox" v-model="motion" />播放動態效果</label>
  <p class="quiet">已執行 {{step}} / {{simulation.frames.length}} 個動作。設定變更會重設演練；回退可還原設定與進度。</p>
  <div class="animation-stage" :key="id+'-'+playback">
   <SystemDiagram :unit="id" :labels="config.nodes" :parallel="!!current?.parallel" :states="current?.states || []" :focus="current ? Math.min(step-1,config.nodes.length-1) : -1" :animate="!!current && motion" :title="designBriefs[id].title + ' · 我的配置'" />
   <section v-if="current?.capacity!==undefined" class="context-window" aria-label="設計的資訊容量"><h3>目前資訊：{{current.capacity}} / 10 教學單位</h3><div class="capacity-track"><span :style="{width:current.capacity*10+'%'}"></span></div><p>{{current.states[1]}}</p></section>
   <section v-if="current?.records!==undefined" class="database-records" aria-label="設計的寫入效果"><h3>資料庫：{{current.records}} 筆提醒</h3><div v-for="n in current.records" :key="n" class="record" :class="{duplicate:n>1}">提醒 #{{n}} · {{n>1?'重複效果':'案件 #1024'}}</div></section>
   <section v-if="id==='evidence' && current" class="trace-list" aria-label="設計的驗收紀錄"><details v-for="(frame,n) in simulation.frames.slice(0,step)" :key="n"><summary>{{n+1}} · {{frame.action}} · 展開證據</summary><p>{{frame.trace}}</p><p>{{frame.explanation}}</p></details></section>
   <section v-if="current?.timeline" class="workbench-timeline" aria-label="設計的執行時間軸"><p v-if="current.failed">信箱查詢缺少案件編號，未完成；不能以短時間宣稱優化成功。</p><template v-else><p>相同 0–6 秒刻度 · 總計 {{current.parallel?4:6}} 秒</p><div v-for="bar in [{label:'案件',start:0,duration:3},{label:'信箱',start:current.parallel?0:3,duration:2},{label:'驗證',start:current.parallel?3:5,duration:1}]" :key="bar.label"><p>{{bar.label}}：{{bar.start}}–{{bar.start+bar.duration}} 秒</p><div class="timeline-track"><span class="timeline-bar" :style="{marginLeft:bar.start/6*100+'%',width:bar.duration/6*100+'%','--delay':bar.start+'s','--duration':bar.duration+'s'}"></span></div></div></template></section>
   <section v-if="current?.packet" class="handoff-packet" aria-label="設計的交接包"><h3>交接內容</h3><ul><li v-for="item in current.packet" :key="item">{{item}}</li></ul></section>
  </div>
  <p class="animation-explanation" role="status">{{current?.explanation||'先選設定，再按下動作按鈕。你不需要先寫出整份設計。'}}</p>
  <div class="animation-actions"><button class="primary" :disabled="!histories[id].length" @click="undo">← 回到上一步</button><button v-if="next" class="primary" @click="act">{{next.action}} →</button><button v-if="current" class="primary" @click="playback++">重播這次變化</button></div>
  <section v-if="!next" class="design-result" aria-label="操作產生的設計草稿"><h3>這次操作產生的設計草稿</h3><p><strong>方案：</strong>{{simulation.summary}}</p><p><strong>試驗條件：</strong>{{simulation.scenario}}</p><p><strong>觀察結果：</strong>{{simulation.result}}</p><p><strong>接受的代價：</strong>{{simulation.tradeoff}}</p><p><strong>重新評估條件：</strong>{{simulation.revisit}}</p><p v-if="simulation.risk" class="design-caution">此配置有待改善的風險。可以回到設定比較，也可保存為待改進草稿。</p><p class="quiet">這份草稿只記錄你操作過的案例，不代表所有情境都已通過驗證。</p>
   <details><summary>補充自己的想法（選填）</summary><label>我的補充<textarea v-model="draft.note" maxlength="2000" rows="3"></textarea></label></details>
   <button class="primary" @click="adopt">{{simulation.risk?'採用為待改進草稿':'採用這個設計'}}</button><button v-if="storageFailed" class="primary" @click="download(true)">下載目前演練草稿</button>
  </section>
  <p v-if="saved[id]" class="quiet">{{adopted?'目前設定與已保存方案相同。':'目前操作尚未採用；已保存的方案仍保留。'}}</p>
  <details v-if="saved[id]" class="evidence-panel"><summary>查看已採用的設計</summary><p>{{simulateDesign(id,saved[id]).summary}}</p><p>演練條件：{{simulateDesign(id,saved[id]).scenario}}</p><p>觀察結果：{{simulateDesign(id,saved[id]).result}}</p><p>代價：{{simulateDesign(id,saved[id]).tradeoff}}</p><p v-if="saved[id].note">補充：{{saved[id].note}}</p></details>
  <details v-if="hasOld" class="evidence-panel"><summary>查看保留的舊版文字筆記</summary><p>{{oldNote.approach}}</p><p v-for="(field,n) in oldNote.fields" :key="n">{{designBriefs[id].fields[n]}}：{{field}}</p><p>理由：{{oldNote.rationale}}</p><p>代價：{{oldNote.tradeoff}}</p><p>重新評估：{{oldNote.revisit}}</p></details>
  <div class="action-row"><button class="primary" @click="download(false)">下載已採用的整份設計</button><a v-if="unit" class="text-link" href="#/design">檢視七個單元的設計 →</a></div>
  <p v-if="status" role="status">{{status}}</p><p class="quiet">採用後保存在此瀏覽器，不會上傳。回退不會刪除已採用設計；尚未採用的操作離開頁面後會重設。</p>
 </section>
</template>
