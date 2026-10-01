<script setup>
import {computed,ref,onMounted,onUnmounted,nextTick} from 'vue';
import {course,units,unitById,stageById} from './course.mjs';
import {parseRoute,courseRoute,finalIncident} from './interaction.mjs';
import {finalTransfer} from './final-transfer.mjs';
import {lessonContent} from './lesson-content.mjs';
import {loadProgress,recordStage,saveProgress,visitedStages} from './progress.mjs';
import LessonLab from './components/LessonLab.vue';
import FinalIntegratedSimulator from './components/FinalIntegratedSimulator.vue';
const routeState=ref(parseRoute(location.hash)||(location.hash?{view:'notfound'}:{view:'map'}));
const finalLab=ref(null);
const pageHeading=ref(null),progress=ref(loadProgress());
const unit=computed(()=>routeState.value.view==='unit'?unitById(routeState.value.unit):null);
const stage=computed(()=>unit.value?stageById(unit.value,routeState.value.stage):null);
const stageIndex=computed(()=>stage.value?unit.value.stages.findIndex(s=>s.id===stage.value.id):-1);
const previousStage=computed(()=>unit.value?.stages[stageIndex.value-1]);
const nextStage=computed(()=>unit.value?.stages[stageIndex.value+1]);
const nextUnit=computed(()=>unit.value?units[unit.value.number]:null);
const content=computed(()=>unit.value?lessonContent[unit.value.id]:null);
const incident=computed(()=>routeState.value.view==='final'?finalIncident(routeState.value.incident):null);
const incidentIndex=computed(()=>incident.value?finalTransfer.incidents.findIndex(i=>i.id===incident.value.id):-1);
const previousIncident=computed(()=>finalTransfer.incidents[incidentIndex.value-1]);
const nextIncident=computed(()=>finalTransfer.incidents[incidentIndex.value+1]);
const resume=computed(()=>{
 const last=progress.value.last;if(!last)return null;
 if(last.unitId==='final'){const i=finalTransfer.incidents.find(i=>i.id===last.stageId);return i?{href:courseRoute('final',i.id),title:i.title}:null;}
 const u=units.find(u=>u.id===last.unitId),s=u?.stages.find(s=>s.id===last.stageId);
 return s?{href:courseRoute(u.id,s.id),title:`第 ${u.number} 章・${s.title}`}:null;
});
function recordCurrent(){
 if(unit.value&&stage.value)progress.value=recordStage(progress.value,unit.value.id,stage.value.id);
 else if(incident.value)progress.value=recordStage(progress.value,'final',incident.value.id);
 saveProgress(progress.value);
}
function sync(){routeState.value=parseRoute(location.hash)||{view:'notfound'};recordCurrent();window.scrollTo({top:0,behavior:'instant'});nextTick(()=>pageHeading.value?.focus());}
onMounted(()=>{recordCurrent();window.addEventListener('hashchange',sync);});
onUnmounted(()=>window.removeEventListener('hashchange',sync));
function progressLabel(u){const n=visitedStages(progress.value,u.id).filter(id=>u.stages.some(s=>s.id===id)).length;return n?`已造訪 ${n}／${u.stages.length} 小節`:'尚未造訪';}
const readingNames={INTERACT:'觀察與操作',READ:'必要機制閱讀',TRANSFER:'換題應用'};
</script>
<template>
<div class="course-shell">
<a class="skip-link" href="#course-main" @click.prevent="pageHeading?.focus()">跳到主要教材</a>
<header class="course-header"><a :href="courseRoute()" class="course-brand">System Design <span>路徑・證據・設計</span></a><a :href="courseRoute()">課程首頁</a></header>
<div class="course-layout">
 <nav class="chapter-nav" aria-label="章節導航">
  <p class="eyebrow">本課八個問題</p>
  <ol><li v-for="u in units" :key="u.id"><a :href="courseRoute(u.id)" :aria-current="unit?.id===u.id?'page':undefined"><span>{{String(u.number).padStart(2,'0')}}</span>{{u.title}}</a>
   <ul v-if="unit?.id===u.id"><li v-for="s in u.stages" :key="s.id"><a :href="courseRoute(u.id,s.id)" :aria-current="stage?.id===s.id?'step':undefined">{{readingNames[s.mode]}}</a></li></ul>
  </li></ol>
  <a class="final-link" href="#/final" :aria-current="incident?'page':undefined">最後整合練習</a>
  <p class="muted small">所有章節均可直接進入。造訪紀錄不代表已學會。</p>
 </nav>
 <main id="course-main">
  <section v-if="routeState.view==='map'" class="course-home">
   <p class="eyebrow">可操作的系統設計課程</p><h1 ref="pageHeading" tabindex="-1">{{course.subtitle}}</h1><p class="lead">{{course.intro}}</p>
   <a class="primary-button" :href="resume?.href||courseRoute('flow')">{{resume?'繼續上次：'+resume.title:'從第一章開始'}} →</a>
   <section class="course-scope"><h2>這次要學什麼？</h2>
    <dl><dt>現在學</dt><dd>請求與資料路徑、異常定位、等待、讀取副本、工作交接、資料版本、證據與設計取捨。</dd><dt>已有經驗，只做銜接</dt><dd>以自然語言提出需求、使用 AI 協助工作。前後端、測試與 CI 的差異仍會補足說明。</dd><dt>之後再學</dt><dd>完整交易隔離與競態保護、重試／冪等工程、共識、分割、多區域、資料遷移與部署策略。</dd><dt>這次不學</dt><dd>模型訓練、RAG／MCP／多 Agent 編排、雲端認證、面試評分或真實 provider 操作。</dd></dl>
   </section>
   <h2>選一個問題開始</h2><div class="unit-list"><a v-for="u in units" :key="u.id" :href="courseRoute(u.id)"><span>{{String(u.number).padStart(2,'0')}}</span><div><h3>{{u.title}}</h3><p>{{u.summary}}</p><small>{{progressLabel(u)}}</small></div><b aria-hidden="true">→</b></a></div>
   <p class="muted">目前假設你已接觸 AI 協作，但不假設已理解 HTTP、快取或佇列。每章都有必要閱讀；如果前置內容已熟悉，可直接回到實驗。</p>
  </section>
  <section v-else-if="routeState.view==='notfound'"><h1 ref="pageHeading" tabindex="-1">找不到這一頁</h1><p>請用左側章節導航選擇可用的教材。</p><a class="primary-button" href="#/">回課程首頁</a></section>
  <article v-else-if="incident" class="course-lesson">
   <p class="eyebrow">最後整合練習・{{incidentIndex+1}}／{{finalTransfer.incidents.length}}</p><h1 ref="pageHeading" tabindex="-1">{{incident.title}}</h1><p class="lead">{{incident.question}}</p><p>{{finalTransfer.intro}}</p>
   <FinalIntegratedSimulator ref="finalLab" :incident-id="incident.id" />
   <button class="text-button" type="button" @click="finalLab?.restart()">重開整合練習</button>
   <nav class="lesson-actions" aria-label="整合練習導覽"><a :href="previousIncident?courseRoute('final',previousIncident.id):courseRoute('redesign','transfer')">← {{previousIncident?'上一個現象':'回第八章'}}</a><a class="primary-button" :href="nextIncident?courseRoute('final',nextIncident.id):courseRoute()">{{nextIncident?'下一個現象':'回課程首頁'}} →</a></nav>
  </article>
  <article v-else-if="stage" class="course-lesson">
   <p class="eyebrow">第 {{unit.number}} 章・{{stageIndex+1}}／{{unit.stages.length}}・{{readingNames[stage.mode]}}</p><h1 ref="pageHeading" tabindex="-1">{{stage.title}}</h1><p class="lead">{{stage.intro}}</p>
   <p class="prerequisite"><strong>先備銜接：</strong>{{content.prerequisite}}</p>
   <section v-if="stage.mode==='READ'" class="required-reading" aria-label="必要機制閱讀"><p class="eyebrow">必讀・再回同一個實驗</p><section v-for="r in content.reading" :key="r.title"><h2>{{r.title}}</h2><p>{{r.text}}</p></section><h3>適用邊界</h3><ul><li v-for="b in content.boundaries" :key="b">{{b}}</li></ul><p><strong>帶走的原則：</strong>{{content.principle}}</p></section>
   <LessonLab :unit-id="unit.id" :stage-id="stage.id" :prompt="stage.prompt" />
   <section class="source-links"><h2>來源與限制</h2><p>案例與數字是合成教學假設；來源支持機制，不是這些數字的 benchmark。</p><ul><li v-for="s in content.sources" :key="s.url"><a :href="s.url" target="_blank" rel="noopener noreferrer">{{s.title}}</a><span>・{{s.section}}</span></li></ul></section>
   <nav class="lesson-actions" aria-label="小節導覽"><a :href="previousStage?courseRoute(unit.id,previousStage.id):courseRoute()">← {{previousStage?'上一小節':'課程首頁'}}</a><a class="primary-button" :href="nextStage?courseRoute(unit.id,nextStage.id):nextUnit?courseRoute(nextUnit.id):courseRoute('final')">{{nextStage?'下一小節：'+readingNames[nextStage.mode]:nextUnit?'下一章：'+nextUnit.title:'進入最後整合練習'}} →</a></nav>
  </article>
 </main>
</div>
<footer class="course-footer">合成案例・不連接真實 API・Technical QA 與真人學習驗收分開。</footer>
</div>
</template>
