<script setup>
import {computed,ref,watch} from 'vue';
import {experimentControls,experimentDefaults,simulateExperiment} from '../experiment-model.mjs';
import {loadExperiment,saveExperiment} from '../experiment-storage.mjs';
import {lessonContent} from '../lesson-content.mjs';
const props=defineProps({unitId:String,stageId:{type:String,default:'observe'},incidentIndex:{type:Number,default:-1},final:{type:Boolean,default:false},prompt:String});
const context=computed(()=>props.final?'final':props.stageId==='transfer'?'transfer':'teaching');
const modelContext=computed(()=>context.value==='final'?'transfer':context.value);
const experiment=ref({state:{},note:'',selected:'',baseline:null});
const saved=ref(true);
function load(){experiment.value=loadExperiment(props.unitId,context.value);if(props.final)experiment.value.state.incident=props.incidentIndex;saved.value=saveExperiment(props.unitId,context.value,experiment.value);}
watch(()=>[props.unitId,context.value],load,{immediate:true});
watch(()=>props.incidentIndex,i=>{if(props.final)experiment.value.state.incident=i;});
watch(experiment,()=>{saved.value=saveExperiment(props.unitId,context.value,experiment.value);},{deep:true,flush:'sync'});
const content=computed(()=>lessonContent[props.unitId]);
const result=computed(()=>simulateExperiment(props.unitId,experiment.value.state,modelContext.value));
const selected=computed(()=>result.value.nodes.find(n=>n.id===experiment.value.selected)||result.value.nodes[0]);
const controls=computed(()=>experimentControls[props.unitId].filter(c=>(props.stageId!=='observe'||!c.advanced)&&(!props.final||c.key!=='incident')));
const baseline=computed(()=>experiment.value.baseline?simulateExperiment(props.unitId,experiment.value.baseline,modelContext.value):null);
const statusText={ok:'已確認',waiting:'等待／未到達',bad:'輸出異常',attention:'需要比較要求',idle:'本次未使用',unknown:'結果未知'};
function label(id){return result.value.nodes.find(n=>n.id===id)?.label||id;}
function reset(){experiment.value={state:experimentDefaults(props.unitId,modelContext.value),selected:'',note:'',baseline:null};if(props.final)experiment.value.state.incident=props.incidentIndex;}
function remember(){experiment.value.baseline={...experiment.value.state};}
defineExpose({reset});
const copyStatus=ref('');
async function copyEvidence(){try{await navigator.clipboard.writeText(selected.value.evidence.join('\n'));copyStatus.value='已複製';}catch{copyStatus.value='無法自動複製，請選取下方文字複製';}}
</script>

<template>
<section class="experiment" aria-label="系統實驗">
  <div v-if="stageId==='transfer'&&!final" class="transfer-brief">
    <p class="eyebrow">換一個問題</p><h2>{{content.transfer.title}}</h2>
    <p>{{content.transfer.problem}}</p><p class="muted">{{content.transfer.assumptions}}</p>
  </div>
  <div class="experiment-intent"><strong>這一段要觀察</strong><p>{{prompt||'改一個條件，指出哪一段輸出改變，並說明下一份驗證證據。'}}</p></div>
  <div class="experiment-controls">
    <label v-for="c in controls" :key="c.key" :class="{'toggle-control':c.type==='toggle'}">
      <template v-if="c.type==='toggle'"><input type="checkbox" v-model="experiment.state[c.key]">{{c.label}}</template>
      <template v-else><span>{{c.label}}<b v-if="c.type==='range'">{{Number(experiment.state[c.key]).toFixed(c.step<1?1:0)}}</b></span>
        <input v-if="c.type==='range'" type="range" v-model.number="experiment.state[c.key]" :min="c.min" :max="c.max" :step="c.step">
        <select v-else v-model="experiment.state[c.key]"><option v-for="o in c.options" :key="o.value" :value="o.value">{{o.label}}</option></select>
      </template>
    </label>
  </div>
  <p class="assumptions"><strong>教學假設：</strong>{{result.assumptions}}</p>
  <div class="experiment-metrics" aria-live="polite" aria-atomic="true">
    <div v-for="(m,i) in result.metrics" :key="m.label"><span>{{m.label}}</span><strong>{{m.value}}</strong><small v-if="baseline">基準：{{baseline.metrics[i]?.value}}</small></div>
  </div>
  <div class="experiment-surface">
    <div>
      <h2 class="surface-heading">同一個系統，現在發生什麼？</h2>
      <p class="muted">選一個節點，核對它收到的資料、產生的結果與證據。</p>
      <div class="experiment-nodes">
        <button v-for="n in result.nodes" :key="n.id" type="button" :class="['experiment-node','status-'+n.status,{selected:selected.id===n.id}]" :aria-pressed="selected.id===n.id" @click="experiment.selected=n.id">
          <strong>{{n.label}}</strong><span>{{n.output}}</span><small>{{statusText[n.status]}}</small>
        </button>
      </div>
      <h3>本次關係與方向</h3>
      <ol class="experiment-edges"><li v-for="(e,i) in result.edges" :key="i"><span>{{label(e.from)}} → {{label(e.to)}}</span><small>{{e.label}}</small></li></ol>
    </div>
    <aside class="node-inspection" aria-label="選定節點證據">
      <p class="eyebrow">正在查：{{selected.label}}</p>
      <dl><dt>收到</dt><dd>{{selected.input}}</dd><dt>送出</dt><dd>{{selected.output}}</dd></dl>
      <h3>這一層的證據</h3>
      <ul v-if="selected.evidence.length"><li v-for="e in selected.evidence" :key="e">{{e}}</li></ul>
      <p v-else>目前只有模型輸出，還沒有獨立觀察紀錄。請說明下一份需要查什麼，不能直接宣稱根因已確認。</p>
      <template v-if="selected.evidence.length"><button type="button" class="text-button" @click="copyEvidence">複製證據文字</button><span role="status">{{copyStatus}}</span><pre class="evidence-code"><code>{{selected.evidence.join('\n')}}</code></pre></template>
    </aside>
  </div>
  <div class="experiment-tradeoff"><strong>修改後，還需要評估什麼？</strong><p>{{result.tradeoff}}</p></div>
  <div class="experiment-toolbar"><button type="button" @click="remember">保存現在作基準</button><button type="button" @click="reset">重設目前實驗</button><span role="status">{{saved?'實驗保存在此瀏覽器':'瀏覽器無法保存；目前仍可操作，但重新載入將不保留。'}}</span></div>
  <p class="muted small">重設只清除目前案例的設定、基準及筆記；其他章節與造訪位置保留。</p>
  <label class="reflection"><strong>用自己的話說明</strong><span>{{prompt||'提出一個修改、說明收益與代價，以及如何驗證。'}}</span><textarea v-model="experiment.note" maxlength="8000" rows="4" placeholder="我觀察到……；目前證據能支持……；下一步要查……"></textarea></label>
  <p class="muted small">筆記只存在目前瀏覽器，不送到伺服器，也不當作理解程度評分。</p>
</section>
</template>
