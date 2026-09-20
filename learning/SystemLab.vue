<script setup>
import {computed,ref,watch,onBeforeUnmount} from 'vue';
import {LAB_KEY,labs,cleanConfig,simulate,frameAt,readLabs,labMarkdown} from './system-lab.mjs';
const props=defineProps({unit:{type:String,required:true}}),emit=defineEmits(['saved']);
const lab=computed(()=>labs[props.unit]);
const config=ref(cleanConfig(props.unit)),cursor=ref(0),selected=ref(lab.value.focus),motion=ref(true),auto=ref(false),moving=ref(false),notice=ref(''),mode=ref('repair'),past=ref([]),previous=ref(null),saved=ref({});let timer;
try{saved.value=readLabs(localStorage.getItem(LAB_KEY));}catch{}
const run=computed(()=>simulate(props.unit,config.value)),states=computed(()=>frameAt(props.unit,run.value,cursor.value)),done=computed(()=>cursor.value===run.value.events.length),active=computed(()=>run.value.events[cursor.value]),nodeOptions=computed(()=>lab.value.options.filter(o=>o.node===selected.value));
const packet=computed(()=>props.unit==='context'?lab.value.options.filter(o=>config.value[o.key]!=='no'&&config.value[o.key]!=='none').map(o=>({label:o.choices.find(c=>c.value===config.value[o.key]).label,size:o.key==='chat'?3:o.key==='deadline'?1:2})):props.unit==='multi'?lab.value.options.filter(o=>o.node==='gate'&&config.value[o.key]==='yes').map(o=>({label:o.choices.find(c=>c.value===config.value[o.key]).label,size:1})):[]);
const used=computed(()=>packet.value.reduce((a,p)=>a+p.size,0));
const edges=computed(()=>{let pairs=[['agent','gate'],['gate','tool'],['tool','data'],['data','result']];if(props.unit==='overview'&&config.value.guard==='off')pairs=[['agent','tool'],['tool','data'],['data','result']];if(props.unit==='optimization'&&config.value.schedule==='parallel')pairs=[['agent','gate'],['agent','tool'],['gate','data'],['tool','data'],['data','result']];if(props.unit==='reliability')pairs.push(['tool','agent']);if(props.unit==='loop')pairs=[['agent','data'],['agent','gate'],['gate','agent'],['agent','tool'],['data','result']];if(props.unit==='context')pairs=[['agent','gate'],['data','gate'],['gate','tool'],['tool','result']];if(props.unit==='evidence')pairs=[['data','agent'],['agent','gate'],['gate','tool'],['tool','result']];if(props.unit==='reliability')pairs=[['agent','tool'],['agent','gate'],['gate','tool'],['tool','data'],['tool','agent'],['agent','result']];return pairs;});
function point(id){const n=lab.value.nodes.find(n=>n.id===id);return {x:n.x+100,y:n.y+52};}
function path(from,to){const a=point(from),b=point(to);if(from===to)return `M ${a.x-30} ${a.y-52} C ${a.x-70} ${a.y-95},${a.x+70} ${a.y-95},${a.x+30} ${a.y-52}`;if(from==='tool'&&to==='agent')return `M ${a.x} ${a.y-52} C ${a.x} 5,${b.x} 5,${b.x} ${b.y-52}`;const dx=b.x-a.x,dy=b.y-a.y;const scale=Math.max(Math.abs(dx)/102,Math.abs(dy)/60);return `M ${a.x+dx/scale} ${a.y+dy/scale} L ${b.x-dx/scale} ${b.y-dy/scale}`;}

function stop(){clearTimeout(timer);moving.value=false;auto.value=false;}
function remember(){past.value.push({config:{...config.value},cursor:cursor.value,previous:previous.value});if(past.value.length>150)past.value.shift();}
function baseline(){if(done.value)previous.value={config:{...config.value},outcome:run.value.outcome,metrics:{...run.value.metrics}};}
function change(key,value){stop();remember();baseline();config.value={...config.value,[key]:value};cursor.value=0;notice.value='配置已更新。重新執行同一案件，觀察差異。';}
function advance(){if(done.value){auto.value=false;return;}remember();moving.value=true;const finish=()=>{cursor.value++;moving.value=false;if(auto.value&&!done.value)timer=setTimeout(advance,300);else auto.value=false;};if(!motion.value||window.matchMedia('(prefers-reduced-motion: reduce)').matches){finish();}else timer=setTimeout(finish,800);}
function play(){if(auto.value||moving.value){stop();return;}auto.value=true;advance();}
function undo(){stop();const p=past.value.pop();if(!p)return;config.value=p.config;cursor.value=p.cursor;previous.value=p.previous;notice.value='已還原上一步的配置與執行狀態。';}
function replay(){stop();remember();cursor.value=0;notice.value='已回到本次執行起點，配置保持不變。';}
function preset(value){stop();remember();baseline();mode.value=value;config.value=cleanConfig(props.unit,value==='guide'?lab.value.good:lab.value.defaults);cursor.value=0;selected.value=lab.value.focus;notice.value=value==='guide'?'先執行範例，點節點查看每一步。':value==='repair'?'觀察故障，再調整一處配置重試。':'自行配置後，執行案件檢查成功條件。';}
function reset(){stop();remember();config.value=cleanConfig(props.unit);cursor.value=0;previous.value=null;notice.value='已重設案件；保存的實驗仍保留。';}
function save(){try{const all=readLabs(localStorage.getItem(LAB_KEY));all[props.unit]={...config.value};localStorage.setItem(LAB_KEY,JSON.stringify({version:4,entries:all}));saved.value=all;emit('saved');notice.value='已保存配置與可重現的實驗結果。';}catch{notice.value='瀏覽器無法保存，請下載本次實驗。';}}
function load(){if(!saved.value[props.unit])return;stop();remember();config.value=cleanConfig(props.unit,saved.value[props.unit]);cursor.value=0;notice.value='已載入保存的配置，可以重新執行。';}
function download(){const entries={...saved.value};if(done.value)entries[props.unit]=config.value;const url=URL.createObjectURL(new Blob([labMarkdown(entries)],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='agent-system-experiments.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
watch(()=>props.unit,()=>{stop();config.value=cleanConfig(props.unit);cursor.value=0;selected.value=lab.value.focus;past.value=[];previous.value=null;notice.value='';mode.value='repair';});
watch(motion,()=>stop());onBeforeUnmount(stop);
</script>
<template>
<section class="system-lab" aria-label="系統模擬實驗">
 <header class="case-brief"><p class="eyebrow">案件 #1024 · 系統實驗</p><h2>{{lab.title}}</h2><p><strong>成功條件：</strong>{{lab.goal}}</p></header>
 <div class="lab-toolbar"><div class="lab-modes" aria-label="練習方式"><button v-for="m in [{id:'guide',label:'觀察範例'},{id:'repair',label:'修復故障'},{id:'design',label:'自行設計'}]" :key="m.id" :aria-pressed="mode===m.id" @click="preset(m.id)">{{m.label}}</button></div><label><input type="checkbox" v-model="motion"/>播放事件動畫</label></div>
 <p class="lab-instruction">{{mode==='guide'?'執行範例，沿著連線觀察資料與狀態。':mode==='repair'?'先執行目前配置，再點選圖中的步驟修復問題。':'點選節點配置系統，再用案件驗證你的設計。'}} 每次可以只改一項，與上次完整執行比較。</p>
 <div class="lab-workspace">
  <div class="lab-canvas"><div class="lab-canvas-heading"><h3>案件系統圖</h3><span>點節點查看與調整</span></div>
   <svg viewBox="0 0 860 410" aria-label="可操作的案件系統圖" role="group">
    <defs><marker :id="'arrow-'+unit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7b978b"/></marker></defs>
    <path v-for="([from,to]) in edges" :key="from+to" :d="path(from,to)" class="lab-edge" :marker-end="`url(#arrow-${unit})`"/>
    <path v-if="moving&&active" :d="path(active.from,active.to)" class="lab-event-path" :class="{'event-lost':active.kind==='lost','event-blocked':active.kind==='blocked'}"/>
    <g v-for="n in lab.nodes" :key="n.id" role="button" tabindex="0" :aria-label="'查看'+n.label" :aria-pressed="selected===n.id" @click="selected=n.id" @keydown.enter.prevent="selected=n.id" @keydown.space.prevent="selected=n.id" class="lab-node" :class="{selected:selected===n.id,receiving:moving&&active?.to===n.id}" :transform="`translate(${n.x},${n.y})`">
     <rect width="200" height="115" rx="13"/><text x="16" y="29" class="lab-node-title">{{n.label}}</text><text x="16" y="55" class="lab-node-state">{{states[n.id].slice(0,13)}}</text><text x="16" y="76" class="lab-node-state">{{states[n.id].slice(13,26)}}</text><text x="16" y="98" class="lab-node-link">{{lab.options.some(o=>o.node===n.id)?'點此調整配置':'查看狀態與執行證據'}}</text>
    </g>
    <circle v-if="moving&&active&&motion" :key="unit+'-'+cursor" r="7" :fill="active.kind==='lost'?'#b64a2e':'#217462'" class="lab-particle"><animateMotion dur=".8s" fill="freeze" :path="path(active.from,active.to)" :keyPoints="active.kind==='lost'?'0;0.5':'0;1'" keyTimes="0;1" calcMode="linear"/></circle>
   </svg>
   <p class="lab-current" role="status">{{moving?active.label+'…':cursor?run.events[cursor-1].label:'尚未執行；圖中為案件初始狀態。'}}</p>
   <div v-if="unit==='context'||unit==='multi'" class="lab-packet" aria-label="目前資料包"><strong>{{unit==='context'?'模型可見區':'交接包'}} · {{unit==='context'?used+' / 6 格':packet.length+' / 4 欄位'}}</strong><meter v-if="unit==='context'" min="0" max="6" :value="Math.min(6,used)" :aria-label="'已占用 '+used+' 格，上限 6 格'"/><span v-if="used>6&&unit==='context'" class="lab-warning">超出容量 {{used-6}} 格</span><span v-for="p in packet" :key="p.label" class="packet-chip">{{p.label}}</span><p v-if="!packet.length">尚未放入資料，點選圖中的{{unit==='context'?'模型可見區':'交接包'}}配置。</p></div>
   <div v-if="unit==='evidence'" class="lab-evidence"><h4>回答與來源</h4><p>句子 A「已收到 A」 → {{config.a==='receipt'?'收件紀錄：已收到 A':config.a==='rules'?'規範：必須交 A、B':'尚未連接'}}</p><p>句子 B「已收到 B」 → {{config.b==='unverified'?'暫不交付，待確認':config.b==='receipt'?'收件紀錄：已收到 A':'尚未連接'}}</p><p>點「證據連線」調整引用，點「驗證步驟」設定交付前檢查。</p></div>
  </div>
  <aside class="lab-inspector" aria-label="節點設定"><h3>{{lab.nodes.find(n=>n.id===selected).label}}</h3><p>{{states[selected]}}</p><fieldset v-for="o in nodeOptions" :key="o.key"><legend>{{o.label}}</legend><button v-for="choice in o.choices" :key="choice.value" :aria-pressed="config[o.key]===choice.value" @click="change(o.key,choice.value)">{{choice.label}}</button></fieldset><p v-if="!nodeOptions.length">此節點沒有可調整項目。可點選下方紀錄，回看它在各步驟的狀態。</p><small>配置調整後，案件會回到執行起點；上一個完整結果會保留供比較。</small></aside>
 </div>
 <div class="animation-actions lab-actions"><button class="primary" :disabled="!past.length" @click="undo">← 回到上一步</button><button class="primary" :disabled="done" @click="play">{{auto||moving?'暫停執行':'執行案件'}}</button><button class="primary" :disabled="done||moving||auto" @click="advance">{{active?active.label:'本次執行完成'}}</button><button class="primary" :disabled="!cursor&&!moving" @click="replay">重播本次執行</button><button class="primary" @click="reset">重設案件</button></div>
 <div class="lab-results"><section aria-label="執行紀錄"><h3>執行紀錄 · {{cursor}} / {{run.events.length}}</h3><p v-if="!cursor">請執行案件。每一筆紀錄都對應一次狀態變化。</p><ol><li v-for="(e,i) in run.events.slice(0,cursor)" :key="i"><button @click="stop();remember();cursor=i+1;selected=e.to">{{e.kind==='lost'?'✕ ':e.kind==='blocked'?'■ ':''}}{{e.label}}</button></li></ol></section>
 <section aria-label="實驗結果"><h3>{{done?'本次結果':'執行後檢查成功條件'}}</h3><template v-if="done"><p :class="run.pass?'lab-success':'lab-warning'">{{run.pass?'✓ 符合本案例的設計條件':'需要調整'}} · {{run.outcome}}</p><dl class="lab-metrics"><div v-for="(value,key) in run.metrics" :key="key"><dt>{{key}}</dt><dd>{{value}}</dd></div></dl><p><strong>從這次操作學到：</strong>{{lab.learn}}</p><button class="primary" @click="save">保存本次實驗</button></template><p v-else>尚未完成，結果不會提前判定。</p>
 <div v-if="unit==='optimization'&&done&&run.pass" class="lab-timing"><p>教學假設 · 同一刻度 0–6 秒</p><div v-for="b in [{name:'案件',start:0,length:3},{name:'信箱',start:config.schedule==='parallel'?0:3,length:2},{name:'核對',start:config.schedule==='parallel'?3:5,length:1}]" :key="b.name"><small>{{b.name}} {{b.start}}–{{b.start+b.length}} 秒</small><div class="lab-track"><span :style="{marginLeft:b.start/6*100+'%',width:b.length/6*100+'%'}"/></div></div></div>
 </section></div>
 <section v-if="previous" class="lab-compare" aria-label="前後實驗比較"><h3>與上次完整執行比較</h3><p>修改項目：{{lab.options.filter(o=>previous.config[o.key]!==config[o.key]).map(o=>o.label).join('、')||'配置相同'}}</p><table><thead><tr><th>觀察項目</th><th>上次</th><th>本次</th></tr></thead><tbody><tr><th>結果</th><td>{{previous.outcome}}</td><td>{{done?run.outcome:'等待完整執行'}}</td></tr><tr v-for="key in [...new Set([...Object.keys(previous.metrics),...(done?Object.keys(run.metrics):[])])]" :key="key"><th>{{key}}</th><td>{{previous.metrics[key]??'—'}}</td><td>{{done?(run.metrics[key]??'—'):'—'}}</td></tr></tbody></table></section>
 <p v-if="notice" role="status">{{notice}}</p><div class="animation-actions"><button v-if="saved[unit]" class="primary" @click="load">載入已保存的配置</button><button class="primary" @click="download">下載實驗紀錄</button></div><p class="quiet">所有數值與事件均為固定教學情境，動畫速度不代表真實耗時。保存資料只留在此瀏覽器。</p>
</section>
</template>
