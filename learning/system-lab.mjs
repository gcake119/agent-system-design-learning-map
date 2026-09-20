// Deterministic teaching events. No network/model requests or production benchmarks.
export const LAB_KEY='agent-system-lab-v4';
const node=(id,label,x,y,initial)=>({id,label,x,y,initial});
const option=(key,node,label,choices)=>({key,node,label,choices:choices.map(([value,label])=>({value,label}))});
const common=[node('agent','案件助手',40,50,'等待案件'),node('gate','處理步驟',330,50,'等待請求'),node('tool','案件工具',620,50,'尚未執行'),node('data','案件資料',620,260,'尚未變更'),node('result','交付結果',40,260,'尚未產生')];
export const labs={
 overview:{title:'把權限檢查放進執行路徑',goal:'完成缺件查詢，保留兩份附件，攔下未授權刪除。',learn:'工具執行前的權限檢查，必須真的位於請求路徑上。',focus:'gate',nodes:common,defaults:{guard:'off',permission:'read'},good:{guard:'on',permission:'read'},options:[option('guard','gate','工具前的檢查步驟',[['off','直接送給工具'],['on','接入權限檢查']]),option('permission','gate','本次允許的動作',[['read','只允許讀取'],['all','讀取與刪除都放行']])]},
 loop:{title:'讓中斷的工作能接續',goal:'查完案件與信箱，恢復後不遺失進度；過期資料須重查。',learn:'檢查點保存進度，恢復時還要確認來源版本與完成條件。',focus:'gate',nodes:common.map(n=>({...n,label:n.id==='gate'?'檢查點':n.id==='tool'?'信箱工具':n.id==='data'?'案件來源':n.label})),defaults:{checkpoint:'off',fresh:'same'},good:{checkpoint:'on',fresh:'same'},options:[option('checkpoint','gate','保存工作進度',[['off','不保存'],['on','接入檢查點']]),option('fresh','data','中斷後的來源版本',[['same','保持 v3'],['changed','更新為 v4']])]},
 context:{title:'組好模型這一步看得到的資料',goal:'在 6 格容量內取得必要文件，依最新收件紀錄判斷缺件。',learn:'選資料同時要考慮必要性、容量與來源時效。',focus:'gate',nodes:common.map(n=>({...n,label:n.id==='agent'?'文件桌':n.id==='gate'?'模型可見區':n.id==='tool'?'判斷缺件':n.id==='data'?'收件來源':n.label})),defaults:{rules:'yes',receipt:'old',deadline:'no',chat:'yes'},good:{rules:'yes',receipt:'new',deadline:'yes',chat:'no'},options:[option('rules','gate','案件規範 · 2 格',[['no','移出規範'],['yes','放入規範：需要 A、B']]),option('receipt','gate','收件紀錄 · 2 格',[['none','移出收件紀錄'],['old','放入 v8：只收到 A'],['new','換成 v9：A、B 齊備']]),option('deadline','gate','補件期限 · 1 格',[['no','移出期限'],['yes','放入期限：星期五']]),option('chat','gate','無關聊天 · 3 格',[['no','移出聊天'],['yes','放入午餐聊天']])]},
 reliability:{title:'回應遺失後，保留唯一一張提醒',goal:'即使成功回應遺失，最後也只有一張補件提醒。',learn:'逾時只表示沒有收到結果；查原操作或沿用受支援的冪等鍵，才能避免重複效果。',focus:'gate',nodes:common.map(n=>({...n,label:n.id==='gate'?'結果不明時':n.id==='tool'?'提醒工具':n.id==='data'?'提醒資料庫':n.label})),defaults:{response:'lost',recovery:'retry'},good:{response:'lost',recovery:'lookup'},options:[option('response','tool','成功回應的傳送',[['ok','正常傳回'],['lost','讓成功回應遺失']]),option('recovery','gate','結果不明時接哪個步驟',[['retry','重新建立提醒'],['lookup','查詢原操作'],['key','沿用同一操作鍵重試']])]},
 evidence:{title:'把回答連回它的證據',goal:'每個結論都有支持它的來源，缺少證據時停止交付。',learn:'驗證要比對來源內容；有引用標記不代表來源支持結論。',focus:'gate',nodes:common.map(n=>({...n,label:n.id==='gate'?'證據連線':n.id==='tool'?'驗證步驟':n.id==='data'?'來源文件':n.label})),defaults:{a:'rules',b:'receipt',verify:'off'},good:{a:'receipt',b:'unverified',verify:'on'},options:[option('a','gate','句子 A：已收到附件 A',[['none','不連接來源'],['rules','連到規範：需交 A、B'],['receipt','連到收件：已收到 A']]),option('b','gate','句子 B：已收到附件 B',[['none','不連接來源'],['receipt','連到收件：已收到 A'],['unverified','標為尚未確認，暫不交付']]),option('verify','tool','交付前驗證',[['off','直接交付'],['on','核對每句與來源']])]},
 optimization:{title:'調整依賴，縮短真正的等待',goal:'取得兩份來源後才核對，並比較相同條件下的完成時間。',learn:'獨立查詢可以平行；有資料依賴時必須等待，時間依實際路徑計算。',focus:'gate',nodes:common.map(n=>({...n,label:n.id==='gate'?'案件查詢 · 3 秒':n.id==='tool'?'信箱查詢 · 2 秒':n.id==='data'?'核對 · 1 秒':n.label})),defaults:{schedule:'serial',dependency:'no'},good:{schedule:'parallel',dependency:'no'},options:[option('schedule','gate','兩個查詢如何連接',[['serial','查案件後，再查信箱'],['parallel','從助手分別接到兩個查詢']]),option('dependency','tool','信箱查詢的必要條件',[['no','案件 ID 已知，可獨立查'],['yes','必須等案件查詢取得編號']])]},
 multi:{title:'把接手者需要的資料送過去',goal:'接手者收到案件、來源、進度與失敗負責人，才能開始查信箱。',learn:'分工需要明確交接契約；缺少資料時應停下補齊，不能猜測。',focus:'gate',nodes:common.map(n=>({...n,label:n.id==='agent'?'案件助手':n.id==='gate'?'交接包':n.id==='tool'?'信箱助手':n.id==='data'?'整合負責人':n.label})),defaults:{case:'yes',source:'no',progress:'no',owner:'no',failure:'no'},good:{case:'yes',source:'yes',progress:'yes',owner:'yes',failure:'no'},options:[option('case','gate','案件與需求',[['no','移出案件'],['yes','放入 #1024，需要 A、B']]),option('source','gate','來源與版本',[['no','移出來源'],['yes','放入規範 v3、查詢時間']]),option('progress','gate','已完成與待辦',[['no','移出進度'],['yes','放入案件已查、信箱待查']]),option('owner','gate','失敗時的負責人',[['no','不指定接手者'],['yes','指定整合負責人']]),option('failure','tool','信箱工具的情境',[['no','正常回傳'],['yes','注入查詢失敗']])]}
};
export function cleanConfig(id,input={}){const lab=labs[id];return Object.fromEntries(lab.options.map(o=>[o.key,o.choices.some(c=>c.value===input[o.key])?input[o.key]:lab.defaults[o.key]]));}
export function simulate(id,input){const c=cleanConfig(id,input),events=[];let metrics={};let pass=false;let outcome='';
 const add=(from,to,label,patch={},extra={})=>events.push({from,to,label,patch,...extra});
 const end=(ok,text,m)=>{pass=ok;outcome=text;metrics=m;add(['context','evidence'].includes(id)?'tool':id==='reliability'?'agent':'data','result',text,{result:text},{kind:ok?'success':'warning'});};
 if(id==='overview'){
 add('agent',c.guard==='on'?'gate':'tool','送出缺件查詢',{agent:'查 #1024 缺件',gate:c.guard==='on'?'查詢通過權限檢查':'未設檢查'});
 add(c.guard==='on'?'gate':'tool',c.guard==='on'?'tool':'data','讀取案件附件',{tool:'唯讀查詢完成',data:'附件 A、A-補正版都存在'});
 add('agent',c.guard==='on'?'gate':'tool','提出刪除補正版',{agent:'建議刪除 A-補正版',gate:'等待刪除判定'});
 if(c.guard==='on'&&c.permission==='read'){add('gate','gate','攔下未授權刪除',{gate:'拒絕刪除',tool:'未收到刪除請求'},{kind:'blocked'});end(true,'查詢完成；兩份附件保留',{保留附件:2,未授權刪除:0});}
 else{add(c.guard==='on'?'gate':'agent','tool','放行刪除要求',{tool:'收到刪除要求'});add('tool','data','刪除 A-補正版',{data:'只剩附件 A'},{kind:'warning'});end(false,'補正版遭到未授權刪除',{保留附件:1,未授權刪除:1});}
 }
 if(id==='loop'){
 add('agent','data','查詢案件規範 v3',{data:'v3：需 A、B',agent:'案件查完；信箱待查'});
 add('agent','gate',c.checkpoint==='on'?'保存檢查點':'略過保存進度',{gate:c.checkpoint==='on'?'已保存 v3 與信箱待辦':'沒有檢查點'});
 add('agent','agent','中斷服務',{agent:'記憶中的進度已清空'},{kind:'blocked'});
 add('data','gate','確認目前來源版本',{data:c.fresh==='changed'?'來源已更新 v4':'來源仍是 v3'});
 const reread=c.checkpoint==='off'||c.fresh==='changed';
 add('gate','agent',c.checkpoint==='off'?'沒有檢查點，重新開始':c.fresh==='changed'?'檢查點過期，重查來源':'載入有效檢查點',{agent:reread?'需要重查案件':'接續信箱待辦'});
 if(reread)add('agent','data','重新讀取案件',{data:c.fresh==='changed'?'已讀取 v4':'已讀取 v3'});
 add('agent','tool','查信箱',{tool:'收到 A；未收到 B'});end(true,'兩份来源已核對，確認缺 B'.replace('来源','來源'),{案件查詢次數:reread?2:1,信箱查詢次數:1});
 }
 if(id==='context'){
 const size=(c.rules==='yes'?2:0)+(c.receipt!=='none'?2:0)+(c.deadline==='yes'?1:0)+(c.chat==='yes'?3:0);const complete=c.rules==='yes'&&c.receipt!=='none'&&c.deadline==='yes';
 add('agent','gate','把選取文件放入模型可見區',{gate:`已占用 ${size} / 6 格`,data:'最新 v9：A、B 齊備'});
 if(size>6)end(false,'容量超過上限，先移出無關資料',{容量占用:size,容量上限:6});
 else if(!complete)end(false,'必要資料缺件，停止判斷',{容量占用:size,容量上限:6});
 else{add('gate','tool','依可见資料判斷'.replace('见','見'),{tool:c.receipt==='new'?'A、B 齊備':'依 v8 判為缺 B'});end(c.receipt==='new',c.receipt==='new'?'依 v9 取消催補':'沿用過期 v8，錯誤催補 B',{容量占用:size,容量上限:6,過期來源:c.receipt==='old'?1:0});}
 }
 if(id==='reliability'){
 add('agent','tool','送出建立提醒要求',{agent:'等待回應',tool:'收到操作 op-1024'});
 add('tool','data','寫入第一張提醒',{data:'R1：請補 B',tool:'写入完成'.replace('写','寫')});
 if(c.response==='ok'){add('tool','agent','成功回應抵達助手',{agent:'確認 R1 已建立'});end(true,'提醒建立完成',{提醒張數:1,工具呼叫:1});}
 else{add('tool','agent','成功回應在途中遺失',{agent:'逾時；結果不明'},{kind:'lost'});
 add('agent','gate','執行結果不明的處理策略',{gate:c.recovery==='retry'?'重新建立':c.recovery==='lookup'?'查詢 op-1024':'沿用 op-1024 重試'});
 add('gate','tool',c.recovery==='retry'?'送出新的建立操作':c.recovery==='lookup'?'查詢原操作紀錄':'用相同操作鍵重試',{tool:c.recovery==='retry'?'收到新操作':'辨識為原操作 op-1024'});
 add('tool','data',c.recovery==='retry'?'新增第二張提醒':'找到原本的 R1',{data:c.recovery==='retry'?'R1：請補 B｜R2：請補 B':'R1：請補 B（維持一張）'});
 add('tool','agent','將查詢或重試結果傳回助手',{agent:c.recovery==='retry'?'新提醒 R2 已建立':'已確認原提醒 R1'});
 end(c.recovery!=='retry',c.recovery==='retry'?'同一案件出現兩張提醒':'確認原提醒，沒有重複建立',{提醒張數:c.recovery==='retry'?2:1,工具呼叫:2});}
 }
 if(id==='evidence'){
 add('data','agent','讀取規範與收件紀錄',{data:'規範：需 A、B｜收件：只有 A',agent:'草稿：A 已收到；B 已收到'});
 add('agent','gate','為句子連接證據',{gate:`A → ${c.a==='receipt'?'收件':c.a==='rules'?'規範':'無來源'}；B → ${c.b==='unverified'?'暫不交付':c.b==='receipt'?'收件':'無來源'}`});
 const unsupported=(c.a!=='receipt'?1:0)+(c.b!=='unverified'?1:0);
 add('gate','tool',c.verify==='on'?'逐句檢查來源是否支持':'略過驗證直接交付',{tool:c.verify==='on'?`發現 ${unsupported} 句缺乏支持`:'未核對來源內容'});
 end(c.verify==='on'&&unsupported===0,c.verify==='on'&&unsupported?'攔下不受來源支持的回答，請修正連線':unsupported?'交付內容含無證據的結論':c.verify==='off'?'本次結論有依據，但未建立驗證步驟':'A 有收件證據；B 保持尚未確認',{不受支持句子:unsupported,交付錯誤句子:c.verify==='on'?0:unsupported});
 }
 if(id==='optimization'){
 const invalid=c.schedule==='parallel'&&c.dependency==='yes';
 add('agent','gate','開始案件查詢',{gate:'查詢中：0–3 秒'});
 if(c.schedule==='parallel')add('agent','tool',invalid?'信箱缺少必要編號，查詢被拒絕':'信箱同時開始查詢',{tool:invalid?'缺編號，未執行':'查詢中：0–2 秒'},{kind:invalid?'blocked':'normal'});
 add('gate','data','案件查詢完成 · 第 3 秒',{gate:'已取得案件來源與編號',data:'案件來源已到'});
 if(invalid)end(false,'平行路徑缺少編號，無法完成核對',{已經過秒數:3,缺少來源:1});
 else{add(c.schedule==='serial'?'gate':'tool','tool',c.schedule==='serial'?'取得編號後查信箱 · 第 3–5 秒':'信箱結果已於第 2 秒備妥',{tool:'收件來源已取得'});
 add('tool','data','兩份來源齊備，核對 1 秒',{data:'已核對案件與信箱'});end(true,'完整來源已核對',{完成秒數:c.schedule==='parallel'?4:6,查詢次數:2});}
 }
 if(id==='multi'){
 const fields=['case','source','progress','owner'];const count=fields.filter(k=>c[k]==='yes').length;
 add('agent','gate','組成交接包',{gate:`必要欄位 ${count} / 4`,agent:'案件規範已查完'});
 add('gate','tool','將交接包送給信箱助手',{tool:count===4?'接收檢查通過':'缺少必要欄位，等待補齊'},{kind:count===4?'normal':'blocked'});
 if(count<4)end(false,'交接被擋下，先補齊資料',{交接欄位:count,已查信箱:0});
 else if(c.failure==='yes'){add('tool','data','信箱失敗，交給指定負責人',{tool:'查詢失敗',data:'整合負責人收到案件與失敗紀錄'});end(true,'已交人工接手；案件尚未完成',{交接欄位:4,人工接手:1});}
 else{add('tool','data','回傳收件來源與核對結果',{tool:'只收到 A',data:'整合負責人確認缺 B'});end(true,'交接完成，附來源交付缺件結論',{交接欄位:4,已查信箱:1});}
 }
 return {config:c,events,metrics,pass,outcome};
}
export function frameAt(id,run,cursor){const states=Object.fromEntries(labs[id].nodes.map(n=>[n.id,n.initial]));for(const e of run.events.slice(0,Math.max(0,cursor)))Object.assign(states,e.patch);return states;}
export function readLabs(raw){try{const d=JSON.parse(raw);if(d.version!==4)return {};return Object.fromEntries(Object.keys(labs).filter(id=>d.entries?.[id]&&typeof d.entries[id]==='object').map(id=>[id,cleanConfig(id,d.entries[id])]));}catch{return {};}}
export function labMarkdown(entries){return '# 我的系統實驗\n\n'+Object.entries(entries).filter(([id])=>labs[id]).map(([id,c])=>{const r=simulate(id,c);return '## '+labs[id].title+'\n\n'+labs[id].options.map(o=>'- '+o.label+'：'+o.choices.find(v=>v.value===r.config[o.key]).label).join('\n')+'\n\n結果：'+r.outcome+'\n\n'+Object.entries(r.metrics).map(([k,v])=>`${k}：${v}`).join('；')+'\n\n學習觀念：'+labs[id].learn;}).join('\n\n');}
