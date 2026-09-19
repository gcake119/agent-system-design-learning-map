<script setup>
import {computed,useId} from 'vue';
import {diagramLayout,edgePath,edgePoint,textLines} from './diagram-layout.mjs';
const props=defineProps({unit:{type:String,default:'overview'},labels:{type:Array,required:true},states:{type:Array,default:()=>[]},focus:{type:Number,default:-1},from:{type:Number,default:-1},lost:Boolean,animate:Boolean,parallel:Boolean,connected:{type:Boolean,default:true},reverse:Boolean,title:{type:String,default:'系統運作示意圖'}});
const uid=useId().replace(/[^a-zA-Z0-9-]/g,''),arrow='arrow-'+uid;
const graph=computed(()=>{const g=diagramLayout(props.unit,props.labels,props.parallel);if(!props.connected)g.edges=[];else if(props.reverse)g.edges=g.edges.map(e=>({...e,from:e.to,to:e.from,path:edgePath(g.nodes[e.to],g.nodes[e.from],props.unit)}));return g;});
const activeEdge=computed(()=>{
 if(props.focus<0||!props.connected)return null;
 const source=props.from>=0?props.from:Math.max(0,props.focus-1);
 if(source===props.focus)return null;
 return graph.value.edges.find(e=>e.from===source&&e.to===props.focus)||{from:source,to:props.focus,path:edgePath(graph.value.nodes[source],graph.value.nodes[props.focus],props.unit),label:'本次更新'};
});
const midpoint=e=>edgePoint(graph.value.nodes[e.from],graph.value.nodes[e.to],props.unit);
</script>
<template>
 <figure class="system-figure">
  <figcaption><span class="diagram-title-mark"></span><strong>{{title}}</strong><span class="diagram-key">虛線框：責任範圍 · 箭頭：資料流向</span></figcaption>
  <div class="system-viewport" tabindex="0" :aria-label="title+'，窄螢幕可左右捲動'">
   <svg class="system-svg" :viewBox="`0 0 ${graph.width} ${graph.height}`" role="img" :aria-labelledby="uid+'-title '+uid+'-description'">
    <title :id="uid+'-title'">{{title}}</title><desc :id="uid+'-description'">{{labels.map((l,i)=>l+'：'+(states[i]||'等待操作')).join('；')}}{{lost?'；回應在途中遺失':''}}</desc>
    <defs><marker :id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#435963"/></marker></defs>
    <rect x="12" y="12" :width="graph.width-24" :height="graph.height-24" rx="18" class="system-boundary"/>
    <text x="32" y="37" class="boundary-label">{{unit==='multi'?'責任與交接範圍':unit==='context'?'單次模型請求的資訊邊界':'案件助手 · 教學系統'}}</text>
    <g v-for="edge in graph.edges" :key="edge.index" class="system-edge">
     <path :d="edge.path" :marker-end="`url(#${arrow})`"/>
     <g :transform="`translate(${midpoint(edge).x},${midpoint(edge).y})`"><circle r="11" fill="white" stroke="#435963"/><text y="4" text-anchor="middle" font-size="11" fill="#435963">{{edge.index}}</text></g>
    </g>
    <g v-for="node in graph.nodes" :key="node.index" :transform="`translate(${node.x},${node.y})`" class="system-node" :class="['kind-'+node.kind,{'is-current':focus===node.index}]">
     <rect class="node-surface" width="180" height="140" rx="12"/>
     <rect class="node-header" width="180" height="43" rx="12"/>
     <g transform="translate(12,8)" class="system-icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="node.kind==='database'"><ellipse cx="16" cy="6" rx="13" ry="5"/><path d="M3 6v18c0 7 26 7 26 0V6M3 15c0 7 26 7 26 0"/></template>
      <template v-else-if="node.kind==='agent'"><rect x="2" y="7" width="28" height="21" rx="6"/><path d="M16 7V2M11 21h10M0 14h2M30 14h2"/><circle cx="10" cy="15" r="2"/><circle cx="22" cy="15" r="2"/></template>
      <template v-else-if="node.kind==='person'"><circle cx="16" cy="8" r="6"/><path d="M4 29v-4a12 12 0 0 1 24 0v4M9 29v-7M23 29v-7"/></template>
      <template v-else-if="node.kind==='shield'"><path d="M16 1L29 6v10c0 7-9 13-13 15C12 29 3 23 3 16V6ZM9 15l5 5 10-11"/></template>
      <template v-else-if="node.kind==='envelope'"><rect x="1" y="5" width="30" height="23" rx="3"/><path d="M2 7l14 12L30 7M2 27l10-10M30 27L20 17"/></template>
      <template v-else-if="node.kind==='document'"><path d="M6 1h15l6 6v24H6ZM21 1v7h6M11 14h11M11 20h11M11 26h7"/></template>
      <template v-else><rect x="1" y="2" width="30" height="12" rx="2"/><rect x="1" y="18" width="30" height="12" rx="2"/><path d="M7 8h1M7 24h1M15 8h10M15 24h10"/></template>
     </g>
     <text x="50" y="27" class="system-node-label">{{node.label}}</text>
     <text x="12" y="65" class="system-node-state"><tspan v-for="(line,i) in textLines(states[node.index]||'等待操作').slice(0,4)" :key="i" x="12" :dy="i?18:0">{{line}}{{i===3&&textLines(states[node.index]||'').length>4?'…':''}}</tspan></text>
     <circle cx="170" cy="-4" r="13" class="system-number"/><text x="170" y="1" class="system-number-text">{{node.index+1}}</text>
    </g>
    <g v-if="activeEdge"><path :d="activeEdge.path" class="active-route" :class="{'route-lost':lost}"/>
     <circle r="7" class="route-packet" :class="{'packet-play':animate,'packet-lost':lost}" :style="{'offset-path':`path('${activeEdge.path}')`}"/>
     <g v-if="lost" :transform="`translate(${midpoint(activeEdge).x},${midpoint(activeEdge).y})`"><circle r="14" fill="#fff3e9" stroke="#c65e40"/><path d="M-5-5L5 5M-5 5L5-5" stroke="#c65e40" stroke-width="3"/><text x="0" y="33" text-anchor="middle" class="lost-label">回應中斷</text></g>
    </g>
   </svg>
  </div>
  <ol class="diagram-flow-key"><li v-for="edge in graph.edges" :key="edge.index"><span>{{edge.index}}</span>{{labels[edge.from]}} → {{labels[edge.to]}}：{{edge.label}}</li></ol>
  <p v-if="lost" class="diagram-alert">助手沒有收到回應，已提交的資料仍留在資料庫。</p>
  <details class="diagram-state-details"><summary>查看完整節點狀態</summary><ul><li v-for="(label,i) in labels" :key="i"><strong>{{label}}：</strong>{{states[i]||'等待操作'}}</li></ul></details>
 </figure>
</template>
