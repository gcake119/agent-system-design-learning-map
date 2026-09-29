<script setup>
import {computed,ref,watch} from 'vue';
import {flowScenarioFor} from '../flow-scenarios.mjs';

const props=defineProps({unitId:String,resetKey:{type:Number,default:0}});

const nodeGuides={
  browser:{input:'使用者的點擊、輸入，以及 API 回傳結果',work:'保存目前畫面需要的資料，觸發操作，接收 response 後更新 UI',output:'送出 request，或把新的 state 呈現在畫面上',observe:'click 是否觸發、Network request、response、畫面是否更新'},
  frontend:{input:'使用者事件、表單資料、API response',work:'處理事件與驗證，更新 frontend state，依 state 決定 render',output:'HTTP request，或新的畫面／DOM 狀態',observe:'event handler、request payload、frontend state、render 結果、console error'},
  client:{input:'使用者操作與伺服器回應',work:'呈現使用者看到的狀態與錯誤',output:'下一個 request 或畫面結果',observe:'使用者症狀、Network、console、UI state'},
  network:{input:'要傳送的 request / response bytes',work:'在 client 與 server 之間傳輸資料',output:'送達另一端的 request / response',observe:'RTT、transfer time、timeout、封包是否送達'},
  api:{input:'HTTP method、headers、body',work:'做 routing、validation、auth，將有效 request 交給 backend',output:'backend command 或 HTTP response',observe:'status code、validation error、request log、route 命中'},
  backend:{input:'已通過邊界檢查的 command / query',work:'執行業務規則，呼叫 DB、cache、queue 或外部服務',output:'資料變更、dependency call 或 response data',observe:'application log、trace span、service test、dependency result'},
  db:{input:'query / command / transaction',work:'查詢或更新權威資料',output:'rows、constraint result、commit / rollback',observe:'row 是否存在、query latency、constraint error、transaction result'},
  cache:{input:'cache key、讀寫要求',work:'回傳或保存可重用副本',output:'hit / miss / cached value',observe:'hit rate、版本／freshness、eviction、origin load'},
  queue:{input:'要延後處理的 job / message',work:'保存工作並交給 worker',output:'accepted job、等待中的 backlog',observe:'queue depth、queue age、enqueue 成功、delivery / retry'},
  worker:{input:'queue 送來的 job',work:'在背景執行較久或非同步工作',output:'result、side effect、failure / retry state',observe:'worker log、job state、retry count、artifact 是否產生'},
  result:{input:'worker 完成的輸出',work:'保存或提供完成產物',output:'可供使用者或其他系統讀取的結果',observe:'artifact 是否存在、版本、完成時間'},
  replica:{input:'primary 傳來的資料變更',work:'保存可供讀取的複本',output:'read result',observe:'replication lag、讀到的版本、同步狀態'},
  projection:{input:'event / change stream',work:'把權威資料轉成另一種查詢或顯示格式',output:'衍生 view',observe:'consumer lag、projection version、backlog'},
  external:{input:'系統送出的第三方 request',work:'由外部服務執行自己的工作',output:'第三方 response / side effect',observe:'timeout、status、provider latency、provider id'},
  provider:{input:'系統送出的 provider request',work:'由外部 provider 執行工作',output:'provider response / side effect',observe:'timeout、provider status、trace span、provider id'}
};
const scenario=computed(()=>flowScenarioFor(props.unitId));
const selectedMode=ref(0);
watch(()=>props.unitId,()=>{selectedMode.value=0;});
const mode=computed(()=>scenario.value?.modes[selectedMode.value]||null);
const activeNode=computed(()=>scenario.value?.nodes.find(node=>node.id===mode.value?.active)||null);
function nodeGuide(node){return nodeGuides[node.id]||{input:'上一個節點送進來的資料或事件',work:node.role||'處理目前這一段工作',output:'交給下一個節點的結果',observe:'這一層的 input、output、狀態與錯誤'};}
watch(()=>props.resetKey,()=>{selectedMode.value=0;});
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
          <dl class="flow-node__details">
            <div><dt>收到</dt><dd>{{nodeGuide(node).input}}</dd></div>
            <div><dt>處理</dt><dd>{{nodeGuide(node).work}}</dd></div>
            <div><dt>送出</dt><dd>{{nodeGuide(node).output}}</dd></div>
            <div><dt>可觀察</dt><dd>{{nodeGuide(node).observe}}</dd></div>
          </dl>
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
        <p class="flow-panel__help">這裡是「現在量到什麼／系統現在是什麼狀態」。先看它是否和正常 flow 的預期一致，再決定要不要往下一層查。</p>
        <p v-if="activeNode" class="flow-panel__focus"><strong>現在在查：</strong>{{activeNode.label}} 的 input / output 是否正常。</p>
        <ul>
          <li v-for="item in mode?.metrics||[]" :key="item">{{item}}</li>
        </ul>
      </div>
      <div class="flow-panel">
        <span>EVIDENCE</span>
        <p class="flow-panel__help">Evidence 是用來支持或排除 hypothesis 的觀察結果。每一項只能證明它實際觀察到的範圍，不要直接把 first bad node 當成 root cause。</p>
        <p class="flow-panel__focus"><strong>目前能支持：</strong>{{mode?.takeaway}}</p>
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
