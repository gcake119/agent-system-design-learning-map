<script setup>
import {computed,ref,onMounted,onUnmounted} from 'vue';
import {course,units,unitById,stageById} from './course.mjs';
import {parseV2Route,v2Route,choose,finalIncident} from './interaction.mjs';
import {finalTransfer} from './final-transfer.mjs';
import ConcurrencySimulator from './components/ConcurrencySimulator.vue';
import CapacitySimulator from './components/CapacitySimulator.vue';
import QueueSimulator from './components/QueueSimulator.vue';
import FailureSimulator from './components/FailureSimulator.vue';
const routeState=ref(parseV2Route(location.hash)||{view:'map'}),selected=ref(-1),result=ref(null);
const unit=computed(()=>routeState.value.view==='unit'?unitById(routeState.value.unit):null);
const stage=computed(()=>unit.value?.stages.length?stageById(unit.value,routeState.value.stage):null);
const stageIndex=computed(()=>stage.value?unit.value.stages.findIndex(s=>s.id===stage.value.id):-1);
const nextStage=computed(()=>stage.value?unit.value.stages[stageIndex.value+1]:null);
const incident=computed(()=>routeState.value.view==='final'?finalIncident(routeState.value.incident):null);
const incidentIndex=computed(()=>incident.value?finalTransfer.incidents.findIndex(x=>x.id===incident.value.id):-1);
const nextIncident=computed(()=>incident.value?finalTransfer.incidents[incidentIndex.value+1]:null);
function sync(){routeState.value=parseV2Route(location.hash)||{view:'map'};selected.value=-1;result.value=null;window.scrollTo({top:0,behavior:'instant'})}
function select(i){selected.value=i;result.value=choose(stage.value,i)}
function selectIncident(i){selected.value=i;const o=incident.value.options[i];result.value=o?{selected:i,feedback:o.feedback}:null}
function restart(){selected.value=-1;result.value=null}
onMounted(()=>window.addEventListener('hashchange',sync));onUnmounted(()=>window.removeEventListener('hashchange',sync));
</script>
<template><div class="v2-shell"><header class="v2-header"><a :href="v2Route()" class="v2-brand"><b>System Design</b><span>互動式學習地圖</span></a><a :href="v2Route()" class="v2-map-link">八個問題</a></header><main>
<section v-if="routeState.view==='map'" class="v2-home"><p class="v2-kicker">SYSTEM DESIGN · LEARNING MAP</p><h1>{{course.subtitle}}</h1><p class="v2-lead">{{course.intro}}</p><a class="v2-primary" :href="v2Route(units[0].id,units[0].stages[0].id)">開始第一章 →</a><div class="v2-unit-grid"><a v-for="u in units" :key="u.id" :href="u.stages.length?v2Route(u.id,u.stages[0].id):v2Route(u.id)" :class="['v2-unit-card',{'is-pending':!u.stages.length}]"><span>{{String(u.number).padStart(2,'0')}}</span><h2>{{u.title}}</h2><p>{{u.summary}}</p><small>{{u.stages.length?'可開始學習':'製作中'}}</small></a><a class="v2-unit-card v2-final-card" href="#/v2/final"><span>FINAL</span><h2>沒有章節提示</h2><p>把八章的推理帶進案件追蹤＋批次文件處理。</p><small>整合 Transfer</small></a></div></section>
<section v-else-if="routeState.view==='final'&&incident" class="v2-lesson"><nav class="v2-breadcrumb"><a :href="v2Route()">八個問題</a><span>／</span><span>Final Transfer</span><span>／</span><span>{{incidentIndex+1}} / {{finalTransfer.incidents.length}}</span></nav><p class="v2-kicker">沒有章節提示</p><h1>{{incident.title}}</h1><p class="v2-lead">{{finalTransfer.intro}}</p><section class="v2-board"><div class="v2-question"><span>現在先想</span><h2>{{incident.question}}</h2></div><div class="v2-options"><button v-for="(option,i) in incident.options" :key="option.label" :aria-pressed="selected===i" @click="selectIncident(i)"><span>{{option.label}}</span><b>→</b></button></div><div v-if="result" class="v2-result" role="status"><p class="v2-result-label">這份判斷能支持什麼</p><p>{{result.feedback}}</p></div></section><div class="v2-actions"><button v-if="result" class="v2-secondary" @click="restart">重新比較</button><a v-if="result&&nextIncident" class="v2-primary" :href="'#\/v2\/final\/'+nextIncident.id">下一個事故 →</a><a v-else-if="result" class="v2-primary" :href="v2Route()">完成第一輪 →</a></div></section>
<section v-else-if="unit&&!stage" class="v2-empty"><p class="v2-kicker">UNIT {{unit.number}}</p><h1>{{unit.title}}</h1><p class="v2-lead">{{unit.summary}}</p><p class="v2-note">這個單元正在製作中。你可以先從前兩章開始。</p><a class="v2-secondary" :href="v2Route()">← 回八個問題</a></section>
<article v-else-if="stage" class="v2-lesson"><nav class="v2-breadcrumb"><a :href="v2Route()">八個問題</a><span>／</span><span>Unit {{unit.number}}</span><span>／</span><span>{{stageIndex+1}} / {{unit.stages.length}}</span></nav><p class="v2-kicker">{{stage.eyebrow}}</p><h1>{{stage.title}}</h1><p class="v2-lead">{{stage.intro}}</p><ConcurrencySimulator v-if="unit.id==='concurrency' && stage.id==='race'" />
<CapacitySimulator v-else-if="unit.id==='scale' && stage.id==='workload'" />
<QueueSimulator v-else-if="unit.id==='async' && stage.id==='wait'" />
<FailureSimulator v-else-if="unit.id==='failure' && stage.id==='timeout'" />
<section v-else class="v2-board"><div class="v2-question"><span>現在先想</span><h2>{{stage.prompt}}</h2></div><div class="v2-options"><button v-for="(option,i) in stage.options" :key="option.label" :aria-pressed="selected===i" @click="select(i)"><span>{{option.label}}</span><b>→</b></button></div><div v-if="result" class="v2-result" role="status"><p class="v2-result-label">看看這個選擇帶來什麼</p><p>{{result.feedback}}</p><div v-if="result.term" class="v2-term"><strong>{{result.term.name}}</strong><span>{{result.term.plain}}</span></div></div><p v-else class="v2-note">沒有計分。先做一個判斷，再看它會把設計帶到哪裡。</p></section><div class="v2-actions"><button v-if="result" class="v2-secondary" @click="restart">重新比較</button><a v-if="(result || (unit.id==='concurrency'&&stage.id==='race') || (unit.id==='scale'&&stage.id==='workload') || (unit.id==='async'&&stage.id==='wait') || (unit.id==='failure'&&stage.id==='timeout')) && nextStage" class="v2-primary" :href="v2Route(unit.id,nextStage.id)">繼續：{{nextStage.title}} →</a><a v-else-if="result" class="v2-primary" :href="v2Route()">回到八個問題 →</a></div></article>
</main><footer>所有案例與數字都是教學用合成情境；先理解機制，再把它帶回自己的系統。</footer></div></template>