<script setup>
import {computed,ref,watch} from 'vue';
import {flowScenarioFor} from '../flow-scenarios.mjs';

const props=defineProps({unitId:String});
const scenario=computed(()=>flowScenarioFor(props.unitId));
const selectedMode=ref(0);
watch(()=>props.unitId,()=>{selectedMode.value=0;});
const mode=computed(()=>scenario.value?.modes[selectedMode.value]||null);
function nodeClass(node){
  if(!mode.value)return '';
  if(node.id===mode.value.active)return mode.value.status==='bad'?'is-bad':mode.value.status==='ok'?'is-ok':'is-active';
  return '';
}
</script>

<template>
<section v-if="scenario" class="flow-investigation">
  <header class="flow-investigation__header">
    <div>
      <span class="flow-investigation__eyebrow">SYSTEM FLOW LAB</span>
      <h2>{{scenario.title}}</h2>
      <p>{{scenario.question}}</p>
    </div>
  </header>

  <div class="flow-investigation__modes" aria-label="情境切換">
    <button
      v-for="(item,index) in scenario.modes"
      :key="item.id"
      type="button"
      :class="{selected:selectedMode===index}"
      :aria-pressed="selectedMode===index"
      @click="selectedMode=index"
    >{{item.label}}</button>
  </div>

  <div class="flow-investigation__surface">
    <div class="flow-investigation__graph" aria-label="system flow">
      <template v-for="(node,index) in scenario.nodes" :key="node.id">
        <div :class="['flow-node',nodeClass(node)]">
          <strong>{{node.label}}</strong>
          <span>{{node.role}}</span>
          <small v-if="mode?.active===node.id">
            {{mode.status==='bad'?'FIRST VISIBLE ABNORMALITY':mode.status==='ok'?'CONFIRMED STATE':'CURRENT STEP'}}
          </small>
        </div>
        <div v-if="index<scenario.nodes.length-1" class="flow-edge" aria-hidden="true">→</div>
      </template>
    </div>

    <aside class="flow-investigation__evidence">
      <div class="flow-panel">
        <span>METRICS / STATE</span>
        <ul>
          <li v-for="item in mode?.metrics||[]" :key="item">{{item}}</li>
        </ul>
      </div>
      <div class="flow-panel">
        <span>EVIDENCE</span>
        <ul>
          <li v-for="item in mode?.evidence||[]" :key="item">{{item}}</li>
        </ul>
      </div>
    </aside>
  </div>

  <div class="flow-investigation__takeaway">
    <span>現在可以推論</span>
    <p>{{mode?.takeaway}}</p>
  </div>

  <details class="flow-investigation__framework">
    <summary>用全課共同框架檢查這個情境</summary>
    <ol>
      <li>使用者看到什麼現象？</li>
      <li>正常 flow 是什麼？</li>
      <li>哪一層第一次出現異常？</li>
      <li>這一層 input 正常嗎？</li>
      <li>這一層 output 正常嗎？</li>
      <li>有什麼 evidence？</li>
      <li>direct cause 是什麼？</li>
      <li>root cause 可能是什麼？</li>
      <li>可以在哪一層修？</li>
      <li>修正會帶來什麼 trade-off？</li>
      <li>如何驗證真的修好了？</li>
    </ol>
  </details>
</section>
</template>
