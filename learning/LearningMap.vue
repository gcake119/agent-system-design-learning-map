<script setup>
import {computed,ref,onMounted,onUnmounted,nextTick} from 'vue';
import {course,units,unitById,stageById} from './course.mjs';
import {parseRoute,courseRoute,finalIncident} from './interaction.mjs';
import {finalTransfer} from './final-transfer.mjs';
import {loadProgress,recordStage,saveProgress,visitedStages} from './progress.mjs';
import LessonLab from './components/LessonLab.vue';
import FinalIntegratedSimulator from './components/FinalIntegratedSimulator.vue';

const routeState=ref(parseRoute(location.hash)||{view:'map'});
const pageHeading=ref(null);
const progress=ref(loadProgress());

const unit=computed(()=>routeState.value.view==='unit'?unitById(routeState.value.unit):null);
const stage=computed(()=>unit.value?.stages.length?stageById(unit.value,routeState.value.stage):null);
const stageIndex=computed(()=>stage.value?unit.value.stages.findIndex(s=>s.id===stage.value.id):-1);
const previousStage=computed(()=>stage.value&&stageIndex.value>0?unit.value.stages[stageIndex.value-1]:null);
const nextStage=computed(()=>stage.value?unit.value.stages[stageIndex.value+1]:null);
const incident=computed(()=>routeState.value.view==='final'?finalIncident(routeState.value.incident):null);
const incidentIndex=computed(()=>incident.value?finalTransfer.incidents.findIndex(x=>x.id===incident.value.id):-1);
const nextIncident=computed(()=>incident.value?finalTransfer.incidents[incidentIndex.value+1]:null);

const resume=computed(()=>{
  const last=progress.value.last;
  if(!last)return null;
  const lastUnit=unitById(last.unitId);
  const lastStage=lastUnit?.stages.find(s=>s.id===last.stageId);
  return lastUnit&&lastStage?{unit:lastUnit,stage:lastStage}:null;
});

function recordCurrent(){
  if(routeState.value.view!=='unit'||!unit.value||!stage.value)return;
  progress.value=recordStage(progress.value,unit.value.id,stage.value.id);
  saveProgress(progress.value);
}

function progressLabel(u){
  const count=visitedStages(progress.value,u.id).length;
  if(!count)return '尚未造訪';
  if(count>=u.stages.length)return '瀏覽紀錄：已看過全部小節';
  return `瀏覽紀錄：已看過 ${count} / ${u.stages.length} 小節`;
}

function sync(){
  routeState.value=parseRoute(location.hash)||{view:'map'};
  recordCurrent();
  window.scrollTo({top:0,behavior:'instant'});
  nextTick(()=>pageHeading.value?.focus());
}

onMounted(()=>{
  recordCurrent();
  window.addEventListener('hashchange',sync);
});
onUnmounted(()=>window.removeEventListener('hashchange',sync));
</script>

<template>
<div class="v2-shell">
  <header class="v2-header">
    <a :href="courseRoute()" class="v2-brand"><b>System Design</b></a>
    <a :href="courseRoute()" class="v2-map-link">課程地圖</a>
  </header>

  <main>
    <section v-if="routeState.view==='map'" class="v2-home">
      <h1 ref="pageHeading" tabindex="-1">{{course.subtitle}}</h1>
      <p class="v2-lead">{{course.intro}}</p>

      <div class="learning-progress-note">
        <strong>學習進度會保存在這個瀏覽器。</strong>
        <span>這裡只記錄你看過哪些小節與上次位置，不把瀏覽進度當成「已經學會」。</span>
      </div>

      <a
        v-if="resume"
        class="v2-primary"
        :href="courseRoute(resume.unit.id,resume.stage.id)"
      >繼續上次：Unit {{resume.unit.number}} · {{resume.stage.title}} →</a>
      <a
        v-else
        class="v2-primary"
        :href="courseRoute(units[0].id,units[0].stages[0].id)"
      >開始第一章 →</a>

      <div class="v2-unit-grid">
        <a
          v-for="u in units"
          :key="u.id"
          :href="u.stages.length?courseRoute(u.id,u.stages[0].id):courseRoute(u.id)"
          :class="['v2-unit-card',{'is-pending':!u.stages.length}]"
        >
          <span>{{String(u.number).padStart(2,'0')}}</span>
          <h2>{{u.title}}</h2>
          <p>{{u.summary}}</p>
          <small>{{u.stages.length?progressLabel(u):'製作中'}}</small>
        </a>

        <a class="v2-unit-card v2-final-card" href="#/final">
          <span>FINAL</span>
          <h2>沒有章節提示</h2>
          <p>把八章的推理帶進案件追蹤＋批次文件處理。</p>
          <small>整合 Transfer</small>
        </a>
      </div>
    </section>

    <section v-else-if="routeState.view==='final'&&incident" class="v2-lesson">
      <nav class="v2-breadcrumb">
        <a :href="courseRoute()">八個問題</a><span>／</span><span>Final Transfer</span><span>／</span>
        <span>{{incidentIndex+1}} / {{finalTransfer.incidents.length}}</span>
      </nav>
      <p class="v2-kicker">沒有章節提示</p>
      <h1 ref="pageHeading" tabindex="-1">{{incident.title}}</h1>
      <p class="v2-lead">{{finalTransfer.intro}}</p>
      <FinalIntegratedSimulator :incident-id="incident.id" />
      <div class="v2-actions">
        <a v-if="nextIncident" class="v2-primary" :href="courseRoute('final',nextIncident.id)">注入下一個事故 →</a>
        <a v-else class="v2-primary" :href="courseRoute()">完成第一輪 →</a>
      </div>
    </section>

    <section v-else-if="routeState.view==='notfound'" class="v2-empty">
      <h1 ref="pageHeading" tabindex="-1">找不到這一頁</h1>
      <p class="v2-lead">請從八個問題重新選擇。</p>
      <a class="v2-primary" :href="courseRoute()">回到八個問題 →</a>
    </section>

    <section v-else-if="unit&&!stage" class="v2-empty">
      <p class="v2-kicker">UNIT {{unit.number}}</p>
      <h1>{{unit.title}}</h1>
      <p class="v2-lead">{{unit.summary}}</p>
      <p class="v2-note">這個單元正在製作中。</p>
      <a class="v2-secondary" :href="courseRoute()">← 回八個問題</a>
    </section>

    <article v-else-if="stage" class="v2-lesson">
      <nav class="v2-breadcrumb">
        <a :href="courseRoute()">八個問題</a><span>／</span><span>Unit {{unit.number}}</span><span>／</span>
        <span>{{stageIndex+1}} / {{unit.stages.length}}</span>
      </nav>

      <p class="v2-kicker">{{stage.eyebrow}}</p>
      <h1 ref="pageHeading" tabindex="-1">{{stage.title}}</h1>
      <p class="v2-lead">{{stage.intro}}</p>

      <LessonLab :unit-id="unit.id" :stage-id="stage.id" />

      <div class="v2-actions">
        <a
          v-if="previousStage"
          class="v2-secondary"
          :href="courseRoute(unit.id,previousStage.id)"
        >← 回上一小節：{{previousStage.title}}</a>
        <a
          v-else
          class="v2-secondary"
          :href="courseRoute()"
        >← 回課程地圖</a>

        <a
          v-if="nextStage"
          class="v2-primary"
          :href="courseRoute(unit.id,nextStage.id)"
        >繼續：{{nextStage.title}} →</a>
        <a v-else class="v2-primary" :href="courseRoute()">完成本章 →</a>
      </div>
    </article>
  </main>

  <footer>所有案例與數字都是教學用合成情境；先理解機制，再把它帶回自己的系統。</footer>
</div>
</template>
