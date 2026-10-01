// Deterministic teaching models. These numbers are assumptions, not benchmarks.
const range=(key,label,min,max,step=1,advanced=false)=>({key,label,type:'range',min,max,step,advanced});
const select=(key,label,options,advanced=false)=>({key,label,type:'select',options:options.map(([value,label])=>({value,label})),advanced});
const toggle=(key,label,advanced=false)=>({key,label,type:'toggle',advanced});
export const experimentControls={
 flow:[range('step','目前流程步驟',0,4)],
 locate:[select('incident','切換一組觀察資料',[[0,'情境 A'],[1,'情境 B'],[2,'情境 C'],[3,'情境 D'],[4,'情境 E']]),toggle('repaired','修復這組資料中的眼前故障',true)],
 latency:[range('dbMs','資料查詢耗時（毫秒）',50,1000,50),range('networkMs','網路耗時（毫秒）',50,1000,50,true),range('externalMs','外部查詢耗時（毫秒）',50,1000,50,true)],
 cache:[range('reads','每秒列表讀取量',100,3000,100),toggle('cache','使用讀取副本'),range('hit','副本命中比例（％）',0,100,10,true),toggle('fresh','副本已更新到新版本',true)],
 queue:[toggle('async','先回覆已接收，稍後追蹤完成'),range('arrival','每秒新工作量',.1,1,.1),range('workers','背景工作者數',1,4,1,true),toggle('failed','工作者在觀察視窗內失敗',true)],
 consistency:[select('source','這次讀取哪一份', [['db','主資料'],['cache','快取副本'],['replica','讀取複本'],['projection','衍生檢視']]),range('lag','這份副本傳遞延遲（秒）',0,10,1,true),range('elapsed','主資料更新後觀察時間（秒）',0,10,1,true),select('tolerance','產品允許的傳遞時間',[[0,'立即看到新值'],[5,'五秒內更新即可']],true)],
 evidence:[select('evidence','這次要看哪種證據',[['logs','單次事件紀錄'],['metrics','整體指標'],['trace','同次操作追蹤'],['business','業務結果']]),toggle('verified','另外查詢外部結果收據',true)],
 redesign:[select('incident','加入一組情境限制',[[0,'現象 A'],[1,'現象 B'],[2,'現象 C'],[3,'現象 D'],[4,'現象 E']]),toggle('cache','儲存可重用的讀取副本'),toggle('async','先回覆工作已接收'),range('workers','處理工作者數',1,4),toggle('fresh','重新整理讀取副本'),toggle('verified','另外核對外部結果')]
};
const defaults={
 flow:{step:0},locate:{incident:0,repaired:false},latency:{dbMs:900,networkMs:100,externalMs:100},
 cache:{reads:1000,cache:false,hit:90,fresh:false},queue:{arrival:.1,workers:1,async:false,failed:false},
 consistency:{source:'cache',lag:4,elapsed:0,tolerance:0},evidence:{evidence:'logs',verified:false},
 redesign:{incident:0,cache:false,async:false,workers:1,fresh:false,verified:false}
};
export function experimentDefaults(id,context='teaching'){
 const state={...defaults[id]};
 if(context==='transfer'){
  if(id==='latency')Object.assign(state,{dbMs:100,externalMs:900});
  if(id==='cache')state.reads=2000;
  if(id==='consistency')Object.assign(state,{source:'projection',tolerance:5});
  if(id==='locate')state.incident=4;
  if(id==='evidence')state.evidence='trace';
 }
 return state;
}
export function normalizeExperiment(id,value={},context='teaching'){
 const state=experimentDefaults(id,context);
 for(const c of experimentControls[id]||[]){
  const v=value[c.key];
  if(c.type==='toggle'&&typeof v==='boolean')state[c.key]=v;
  if(c.type==='range'&&typeof v==='number'&&Number.isFinite(v))state[c.key]=Math.max(c.min,Math.min(c.max,Math.round(v/c.step)*c.step));
  if(c.type==='select'&&c.options.some(o=>o.value===v))state[c.key]=v;
 }
 return state;
}
const node=(id,label,input,output,status='ok',evidence=[])=>({id,label,input,output,status,evidence});
const edge=(from,to,label)=>({from,to,label});
const metric=(label,value)=>({label,value});
const round=v=>Math.round(v*100)/100;
const packet=(nodes,edges,values,metrics,tradeoff,assumptions)=>({nodes,edges,values,metrics,tradeoff,assumptions});
const webNodes=(record)=>[
 node('browser','使用者畫面','按下儲存','正在等待', 'waiting',[`操作 ${record}：使用者按下儲存`]),
 node('frontend','前端程式','事件與表單','尚未送出', 'waiting',['畫面事件、請求內容、回應及呈現都可分開核對']),
 node('api','操作入口','HTTP 請求','尚未收到', 'waiting',['請求紀錄可核對路徑、資料及回應程式碼']),
 node('backend','後端處理','已驗證操作','尚未處理', 'waiting',['業務檢查、資料呼叫與結果需要同一操作識別碼']),
 node('db','儲存資料','寫入要求','尚未儲存', 'waiting',[`查詢 ${record} 的資料列`])
];
const webEdges=[edge('browser','frontend','使用者事件'),edge('frontend','api','送出 HTTP 請求'),edge('api','backend','驗證後交給業務處理'),edge('backend','db','寫入'),edge('db','backend','儲存結果'),edge('backend','api','處理結果'),edge('api','frontend','HTTP 回應'),edge('frontend','browser','呈現新畫面')];
export function simulateExperiment(id,input,context='teaching'){
 const s=normalizeExperiment(id,input,context), transfer=context==='transfer';
 const record=transfer?'T-17':'S-17';
 if(id==='flow'){
  const nodes=webNodes(record);
  const outputs=['事件已觸發','請求已送達','業務檢查通過',`${record} 已儲存`,'畫面已顯示成功'];
  const ids=['frontend','api','backend','db','browser'];
  for(let i=0;i<=s.step;i++){const n=nodes.find(n=>n.id===ids[i]);n.output=outputs[i];n.status='ok';n.evidence.push(`${record}：${outputs[i]}`);}
  if(s.step>=1)nodes[1].output='已送出有效表單';
  if(s.step===4){nodes[1].output='已收到回應並更新畫面資料';nodes[1].evidence.push(`HTTP 200，回傳 ${record} 的識別碼`);nodes[2].output='HTTP 200';nodes[3].output='已回傳儲存結果';}
  return packet(nodes,webEdges.slice(0,s.step===4?8:s.step+1),{saved:s.step>=3,rendered:s.step===4},[metric('資料已儲存',s.step>=3?'是':'尚未'),metric('畫面已更新',s.step===4?'是':'尚未')],'儲存與畫面更新可分別成功或失敗；需要分開驗證。','一次最小操作；圖中的入口與後端是責任角色，不一定是不同部署服務。');
 }
 if(id==='locate'){
  const nodes=webNodes(record), incidents=[
   {bad:'frontend',front:'事件沒有接到儲存處理',api:'沒有收到請求',back:'未執行',db:'沒有新資料',facts:['按鈕 click 有觸發','儲存事件處理沒有執行；Network 沒有這次請求']},
   {bad:'frontend',front:'送出內容缺必填欄位',api:'HTTP 400：依約定拒絕',back:'未執行',db:'沒有新資料',facts:['使用者有輸入必填值','送出的請求漏掉該值；需回看前端組合資料的過程']},
   {bad:'backend',front:'送出有效內容',api:'HTTP 500',back:'業務處理發生例外',db:'尚未呼叫',facts:['入口驗證通過','application log：業務處理例外；缺更深原因證據']},
   {bad:'db',front:'送出有效內容',api:'HTTP 503',back:'呼叫資料庫等待失敗',db:'無法建立連線',facts:['後端送出的寫入要求有效','資料庫連線失敗；設定、網路或資源仍待查證']},
   {bad:'frontend',front:'收到 200，但呈現條件未更新',api:'HTTP 200',back:'儲存成功並回應',db:`${record} 存在`,facts:['資料列存在，HTTP response 含新資料','畫面呈現仍使用舊條件；需重現並檢查改版範圍']}
  ];
  const x=incidents[s.incident];
  const saved=s.repaired||s.incident===4, rendered=s.repaired;
  nodes[0].output=rendered?'畫面顯示成功':'使用者看見沒有完成';nodes[0].status=rendered?'ok':'waiting';
  for(const [key,val] of [['frontend',x.front],['api',x.api],['backend',x.back],['db',x.db]]){
   const n=nodes.find(n=>n.id===key);n.output=s.repaired?`${record}：此層輸出已恢復預期`:val;
   n.status=s.repaired?'ok':key===x.bad?'bad':/未執行|沒有收到|尚未呼叫/.test(val)?'waiting':'ok';
   n.evidence.push(`${s.repaired?'修復前觀察':'目前觀察'} ${record}：${val}`);
  }
  nodes.find(n=>n.id===x.bad).evidence.push(...x.facts);
  return packet(nodes,webEdges,{firstAbnormal:s.repaired?null:x.bad,saved,rendered},[metric('有儲存結果',saved?'是':'未確認'),metric('畫面符合預期',rendered?'是':'否')],s.repaired?'眼前輸出已恢復，還需用重現及版本證據核對形成原因。':'先找能排除假設的資料；合法拒絕可能是正確行為，第一個可見異常也不等於根因。','五組合成記錄；修復切換只表示眼前故障消除，不代表真實環境已修復。');
 }
 if(id==='latency'){
  const times={frontend:50,network:s.networkMs,backend:50,db:s.dbMs,external:s.externalMs};
  const labels={frontend:'前端呈現',network:'網路傳輸',backend:'後端處理',db:'資料查詢',external:'外部查詢'};
  const max=Math.max(...Object.values(times));
  const nodes=Object.entries(times).map(([key,v])=>node(key,labels[key],`${record} 的這一段工作`,`${v} ms`,v===max?'attention':'ok',[`合成量測：${labels[key]} ${v} ms`]));
  const totalMs=Object.values(times).reduce((a,b)=>a+b,0);
  return packet(nodes,[edge('frontend','network','這個案例依序等待'),edge('network','backend','請求傳輸'),edge('backend','db','查詢資料'),edge('db','external','本案例查完資料才查外部')],{totalMs},[metric('整條序列路徑',`${totalMs} ms`),metric('最長一段',`${max} ms`)],'只改一段，其他工作仍要做；不能從一個慢段直接推導加機器的收益。','固定負載、固定回傳需求、各段序列；數字是可調教學耗時，不是效能預測。');
 }
 if(id==='cache'){
  const originReads=Math.round(s.reads*(s.cache?1-s.hit/100:1)),hits=s.reads-originReads;
  const readVersion=s.cache&&s.hit>0&&!s.fresh?2:3;
  const nodes=[node('browser',transfer?'預約列表':'文章列表',`${s.reads} 次讀取／秒`,readVersion===2?'部分讀取為 v2':'讀取為 v3',readVersion===2?'attention':'ok',[`來源資料為 v3；副本命中 ${hits} 次／秒`]),node('backend','讀取處理',`${s.reads} 次／秒`,`${hits} 次讀副本；${originReads} 次讀來源`),node('cache','讀取副本',s.cache?`${s.reads} 次檢查／秒`:'未使用',`v${s.fresh?3:2}；命中 ${hits} 次／秒`,s.cache?(readVersion===2?'attention':'ok'):'idle',['副本版本與命中率是兩件事']),node('db','權威來源',`${originReads} 次讀取／秒`,'v3',originReads>500?'attention':'ok',['教學來源上限 500 次／秒；超過表示需進一步量測，不推算延遲'])];
  const edges=[edge('browser','backend','列表讀取')];
  if(s.cache){edges.push(edge('backend','cache','先查副本'));if(hits>0)edges.push(edge('cache','browser','命中：回傳副本'));if(originReads>0)edges.push(edge('cache','db','未命中：查來源'));}
  else edges.push(edge('backend','db','每次查來源'));
  if(originReads>0)edges.push(edge('db','browser','來源回傳 v3；省略處理端回程細節'));
  return packet(nodes,edges,{originReads,readVersion},[metric('到達讀取',`${s.reads}／秒`),metric('來源收到',`${originReads}／秒`),metric('副本命中',`${hits}／秒`),metric('讀到的版本',readVersion===2?(originReads>0?'v2／v3 混合':'v2'):'v3')],'來源負載降低不會自動重新整理副本；回傳時效必須另外核對。','只計讀取分流；來源上限 500／秒；未模擬排隊、重新整理競態或延遲。');
 }
 if(id==='queue'){
  const duration=transfer?60:30,capacity=s.failed?0:s.workers/duration;
  const completed=round(Math.min(s.arrival,capacity)*60),unfinished=round(Math.max(0,s.arrival-capacity)*60),userWait=s.async?.18:s.failed?null:duration;
  const nodes=[node('browser',transfer?'轉錄畫面':'PDF 畫面','建立工作',s.async?'已接收；稍後查結果':s.failed?'本件未完成；無法估計成功回應時間':`等本件產物至少 ${duration} 秒`,'waiting',[`工作 ${record}；目前回應不等於產物`]),node('api','接收入口',`${s.arrival} 件／秒`,s.async?'202 已接收':`等待處理結果`),node('queue','待處理工作',s.async?`${s.arrival} 件／秒`:'同步未經佇列',s.async?`${unfinished} 件未完成（含執行中）`:'未使用',s.async?(unfinished>0?'attention':'ok'):'idle'),node('worker','背景處理',`${s.workers} 個工作者`,s.failed?'處理失敗':`${round(capacity)} 件／秒`,s.failed?'bad':'ok',[`${transfer?'音訊轉錄':'PDF 產製'}：每件 ${duration} 秒`,s.failed?'工作者錯誤；本視窗未完成產物':'產物需以工作識別碼查詢']),node('result','完成產物','已處理工作',`${completed} 件完成（平均量）`,completed>0?'ok':'waiting',[`合成視窗 ${record}：已完成 ${completed}，未完成 ${unfinished}`])];
  const edges=[edge('browser','api','建立工作'),...(s.async?[edge('api','queue','持久交接的教學假設'),edge('queue','worker','取件')]:[edge('api','worker','同次請求等待')]),edge('worker','result','儲存產物'),edge('api','browser',s.async?'先回覆接收':'產物完成後回覆')];
  return packet(nodes,edges,{capacity,completed,unfinished,userWait,duration},[metric('本件回應等待',userWait===null?'未完成，無法估計':`${userWait} 秒${s.async?'（接收）':'起（無排隊）'}`),metric('每件處理時間',`${duration} 秒`),metric('60 秒完成平均量',`${completed} 件`),metric('60 秒未完成',`${unfinished} 件`)],'先回覆接收改變等待位置；增加工作者才改變本模型能力，並增加執行成本。','空系統、60 秒、連續平均流量；未完成包含執行中，不是精確 queue depth／age；下游能力充足。');
 }
 if(id==='consistency'){
  const current=s.source==='db'||s.elapsed>=s.lag,readVersion=current?3:2;
  const acceptable=current||s.elapsed<s.tolerance;
  const labels={db:'主資料',cache:'快取副本',replica:'讀取複本',projection:transfer?'行事曆檢視':'衍生檢視'};
  const nodes=[node('browser','讀取畫面','指定資料識別碼',`從${labels[s.source]}讀到 v${readVersion}`,acceptable?'ok':'attention',[`要求：${s.tolerance===0?'立即新值':s.tolerance+' 秒內更新'}`,`寫入後 ${s.elapsed} 秒`]),...Object.entries(labels).map(([key,label])=>node(key,label,key==='db'?'已確認的寫入 v3':'接收主資料變更',`v${key==='db'||s.elapsed>=s.lag?3:2}`,key===s.source?acceptable?'ok':'attention':'idle',[`資料來源 ${key}；傳遞延遲 ${key==='db'?0:s.lag} 秒`]))];
  return packet(nodes,[edge('db','cache','資料變更傳遞'),edge('db','replica','複製變更'),edge('db','projection','衍生更新'),edge(s.source,'browser','本次實際讀取分支')],{readVersion,acceptable},[metric('權威版本','v3'),metric('本次讀取',`v${readVersion}`),metric('寫入後時間',`${s.elapsed} 秒`),metric('符合時效',acceptable?'是':'否')],'切到主資料可以避開此副本延遲，但會轉移負載；修錯副本無法修復真正讀取路徑。','一次 v2 → v3 變更，延遲到期即傳遞成功；不模擬多次更新、衝突或永遠失敗的傳遞。');
 }
 if(id==='evidence'){
  const verb=transfer?'發布':'通知',outcome=s.verified?'completed':'unknown';
  const panels={logs:[`${record}：工作者送出${verb}`,`${record}：期限內沒有收到回應`],metrics:['合成 100 次呼叫中，20 次回應逾時','彙整資料不能指向某一筆效果'],trace:[`${record}：入口 → 工作者 → 外部服務`,`${record}：外部等待超過 5 秒；遠端執行情況未觀察`],business:[`本地 ${record}：已送出，結果未確認`,s.verified?`另外取得收據：${record} 已完成`:'沒有取得外部完成收據']};
  const nodes=[node('api','接收入口',`${record} 工作`,'已接收'),node('queue','工作交接','工作識別碼','已取件'),node('worker','工作者','已取件工作',`已呼叫${verb}服務`,'ok',panels.logs),node('provider',`外部${verb}服務`,'本地送出要求',s.verified?'收據確認已完成':'是否執行仍未知',s.verified?'ok':'unknown',panels[s.evidence])];
  return packet(nodes,[edge('api','queue','儲存工作'),edge('queue','worker','取件'),edge('worker','provider','呼叫外部'),edge('provider','worker',s.verified?'另一次收據查證':'回應未按時取得')],{outcome},[metric('同次事故',record),metric('回應狀態','逾時'),metric('外部結果',s.verified?'另外查證已完成':'未知')],'另外的收據才能確認效果；切換紀錄／指標／追蹤不會讓未知變成失敗。','可能遠端已執行而回應遺失；在另查收據前保留未知。只看合成資料，不呼叫 provider。');
 }
 if(id==='redesign'){
  const loads=[{reads:1000,arrival:.1},{reads:300,arrival:.1},{reads:300,arrival:.3},{reads:300,arrival:.1},{reads:1000,arrival:.1}];
  const load=loads[s.incident],c=simulateExperiment('cache',{reads:load.reads,cache:s.cache,hit:90,fresh:s.fresh},context),q=simulateExperiment('queue',{arrival:load.arrival,workers:s.workers,async:s.async,failed:false},context),e=simulateExperiment('evidence',{evidence:'business',verified:s.verified},context);
  const nodes=[node('browser',transfer?'案件工作臺':'檔案工作臺','讀取與建立工作',`讀取：v${c.values.readVersion}；工作${s.async?'已接收':'仍需等待'}`,c.values.readVersion===2?'attention':'ok'),node('api','操作入口','工作臺要求',s.async?'接收後回應':'等檔案處理後回應'),...c.nodes.filter(n=>['cache','db'].includes(n.id)),...q.nodes.filter(n=>['queue','worker','result'].includes(n.id)),e.nodes.find(n=>n.id==='provider')];
  return packet(nodes,[edge('browser','api','讀取／建立：兩種操作'),edge('api',s.cache?'cache':'db','讀取分支'),...c.edges.filter(x=>x.from==='cache'||x.from==='db'),...q.edges.filter(x=>x.from!=='browser'),edge('result','provider','有產物的工作才送外部通知')],{...c.values,...q.values,...e.values},[metric('來源收到',`${c.values.originReads}／秒`),metric('60 秒未完成',`${q.values.unfinished} 件`),metric('讀取版本',`可能 v${c.values.readVersion}`),metric('外部結果',e.values.outcome==='unknown'?'未知':'另查已完成')],'減讀取負載、提高檔案處理能力、提前回應、重新整理資料及查證通知，各自處理不同問題；每個收益都要核對新代價。','讀取與背景資源分開；已完成的某筆通知回應遺失，與本視窗新進檔案分開；不是完整離散事件或部署模型。');
 }
 throw new Error('Unknown experiment '+id);
}
