export const PRACTICE_KEY='agent-case-practice-v3';
const card=(title,body,status='normal')=>({title,body,status});
const action=(label,to,extra={})=>({label,to,...extra});
const finish=(title,cards,rule,term,warning=false)=>({title,cards,rule,term,warning,actions:[]});
export const practices={
 overview:{title:'阻止一次沒有授權的刪除',brief:'承辦人只請助手查 #1024 缺哪些文件。同事又說：「順便刪掉看起來重複的附件。」',scenes:{
  start:{title:'先確認承辦人交代了什麼',cards:[card('承辦人的要求','查缺件，附上來源。'),card('目前權限','只能讀取案件與附件。'),card('附件 A、A-補正版','名稱相近，但內容還沒核對。')],actions:[action('查看這次可做的動作','decide')]},
  decide:{title:'助手準備刪除 A-補正版，你要怎麼處理？',cards:[card('待執行動作','刪除 A-補正版','pending'),card('已授權','查詢案件、讀取附件'),card('尚未授權','刪除或修改附件','warning')],actions:[action('攔下刪除，繼續查缺件','safe'),action('讓助手順便刪掉','unsafe')]},
  safe:finish('附件保留，查詢可以繼續',[card('附件 A','仍然存在','success'),card('附件 A-補正版','仍然存在','success'),card('交付結果','提供缺件清單；刪除需求另請承辦人確認。')],'在工具執行前檢查授權；未獲准的刪除應被攔下。','權限邊界：模型提出動作後，系統仍需檢查。'),
  unsafe:finish('補正版被刪掉了',[card('附件 A','仍然存在'),card('附件 A-補正版','已刪除；超出此次授權','danger'),card('承辦人','需要處理誤刪與恢復。','warning')],'這次放行了未授權刪除；應增加工具執行前的權限檢查。','有能力呼叫工具，不代表有權執行。',true),
 }},
 loop:{title:'接手做到一半就中斷的案件',brief:'服務剛重新啟動。案件規範已查到，信箱尚未查；檢查點寫著「案件 v3，信箱待查」。',scenes:{
  start:{title:'你接手時，哪些工作已完成？',cards:[card('案件查詢','已完成：需要 A、B；來源 v3','success'),card('信箱查詢','尚未開始','pending'),card('檢查點','已保存案件結果與待辦。')],actions:[action('查看恢復前需要確認的事','decide')]},
  decide:{title:'目前案件版本仍是 v3，接下來做什麼？',cards:[card('版本檢查','v3 仍有效','success'),card('待辦','查信箱，再核對缺件。','pending'),card('既有副作用','本次只有唯讀查詢。')],actions:[action('接續查信箱','safe'),action('把兩個來源都重新查一次','rerun'),action('直接把案件標記完成','unsafe')]},
  safe:finish('從未完成的步驟接續',[card('案件規範','沿用已確認的 v3'),card('信箱','新查 1 次：只收到 A','success'),card('核對結果','缺 B，附兩個來源；任務完成。','success')],'恢復時先確認檢查點與來源時效，再接續未完成工作。','檢查點恢復：保存進度，也要重新檢查必要條件。'),
  rerun:finish('重新查詢也完成了',[card('案件規範','重查 1 次：仍為 v3'),card('信箱','查詢 1 次：只收到 A'),card('代價','多讀一次案件；唯讀且成本可接受時可採用。')],'短小且唯讀的任務可以重跑；需把額外查詢成本算進設計。','恢復策略取捨：重查簡單，檢查點可減少重工。'),
  unsafe:finish('狀態寫了完成，但工作還沒完成',[card('信箱','尚未查詢','danger'),card('缺件結論','沒有足夠證據','danger'),card('完成標記','與實際進度不一致','warning')],'完成條件必須包含必要查詢與驗證，不能只修改狀態。','結束條件需要可以檢查的證據。',true),
 }},
 context:{title:'挑出判斷缺件需要的文件',brief:'你要判斷 #1024 是否還需要催補 B。從桌上的資料挑出判斷需要的文件，再處理新舊收件紀錄。',scenes:{
  start:{title:'把需要的文件放進助手的資料包',cards:[card('現在的問題','是否還需要催補 B？'),card('可用容量','足夠放三份必要資料；無關聊天會占用額外空間。')],pick:[card('案件規範','此案必須交 A、B。'),card('收件紀錄 v8','10:00：只收到 A。'),card('補件期限','星期五前完成。'),card('午餐聊天','與缺件判斷無關。')],actions:[action('用選到的資料判斷','conflict',{needs:[0,1,2],otherwise:'missing'})]},
  missing:finish('資料包還不足以可靠判斷',[card('缺少的依據','需同時知道規範、收件與期限。','warning'),card('下一步','回到上一步，補齊必要文件。')],'判斷前先取得任務需要的資料；資訊不足時應停止推論。','Context selection：依問題挑資料。',true),
  conflict:{title:'準備催補前，又收到一份新的紀錄',cards:[card('舊紀錄 v8','10:00：只收到 A。'),card('新紀錄 v9','10:15：A、B 都已收到。','success'),card('現在時間','10:16，同一案件與同一來源。')],actions:[action('採用 v9，取消催補','safe'),action('沿用 v8，繼續催補 B','stale')]},
  safe:finish('使用新資料，避免重複催補',[card('目前依據','v9：A、B 齊備','success'),card('舊紀錄 v8','保留供追查，不再作為目前狀態。'),card('動作','不寄補件提醒。','success')],'行動前核對來源與版本，用新紀錄更新舊資訊。','Freshness：資料以前正確，不代表現在仍正確。'),
  stale:finish('已經交齊，卻又收到催補',[card('真實收件狀態','A、B 都已收到。'),card('助手使用的資料','v8 已過期','danger'),card('不必要的提醒','再次要求補 B','danger')],'沿用過期紀錄會產生錯誤動作；行動前需刷新資料。','資料時效也是判斷依據的一部分。',true),
 }},
 reliability:{title:'提醒可能已建立，現在怎麼辦？',brief:'你要為 #1024 建立一張補件提醒。觀察助手收到的回應與資料庫裡的紀錄是否一致。',scenes:{
  start:{title:'準備建立補件提醒',cards:[card('助手','尚未送出要求。'),card('資料庫','目前沒有這次的提醒。')],actions:[action('建立補件提醒','written')]},
  written:{title:'資料庫已新增一張提醒',cards:[card('助手','仍在等待回應。','pending'),card('提醒 #R1','案件 #1024：請補 B。','success')],actions:[action('模擬成功回應在途中遺失','unknown')]},
  unknown:{title:'助手顯示逾時，現在要怎麼處理？',cards:[card('助手看到的結果','沒有收到回應；不知道是否成功。','warning'),card('資料庫的實際紀錄','提醒 #R1 已存在。','success')],actions:[action('查這次操作的結果','safe'),action('再建立一次','duplicate')]},
  safe:finish('找到了原本的提醒',[card('操作查詢','找到 #R1 對應的提醒。','success'),card('提醒 #R1','案件 #1024：請補 B。','success'),card('提醒數量','維持 1 張。','success')],'寫入結果不明時，先查原操作的結果；不能把逾時當成尚未建立。','結果不明與冪等：本案例工具可查操作狀態；支援冪等時，也可沿用同一操作鍵重試。'),
  duplicate:finish('同一件事變成兩張提醒',[card('提醒 #R1','案件 #1024：請補 B。','success'),card('提醒 #R2','案件 #1024：請補 B。','danger'),card('提醒數量','2 張；第二張是重複效果。','danger')],'直接重新建立造成重複；應查原操作結果或使用工具支援的冪等機制。','回應遺失不會撤銷資料庫已完成的寫入。',true),
 }},
 evidence:{title:'找出答案裡沒有證據的一句',brief:'助手正在草擬案件回覆。先查看附件清單，再指出哪一句不能直接交付。',scenes:{
  start:{title:'查看這次查到的附件',cards:[card('案件規範 v3','必須交 A、B。'),card('收件紀錄 v8','附件 A 已收到；沒有 B 的收件紀錄。')],actions:[action('對照助手寫的兩句答案','decide')]},
  decide:{title:'點選你認為需要修正的一句',cards:[card('來源證據','收件紀錄只有 A。'),card('句子 1','附件 A 已收到。'),card('句子 2','附件 B 也已收到，資料齊全。','pending')],actions:[action('指出「附件 B 也已收到」','safe'),action('指出「附件 A 已收到」','wrong'),action('兩句都直接交付','unchecked')]},
  safe:finish('攔下了沒有來源支持的結論',[card('保留句子','附件 A 已收到。','success'),card('修正句子','尚無 B 的收件紀錄；需補查或補件。','success'),card('驗收證據','修正後的答案可對回收件 v8。')],'逐項把答案對回來源；格式正確也需要內容證據。','Verification：檢查每個主張是否有支持。'),
  wrong:finish('這句有證據，另一句仍待檢查',[card('附件 A','收件 v8 有紀錄，不需因此否定。'),card('附件 B','仍沒有收件證據。','warning')],'核對要定位到具體主張與來源，不能只因不放心就否定全部。','驗收應指出哪一項證據與哪一句話不一致。',true),
  unchecked:finish('未收到的附件被寫成已收齊',[card('交付答案','資料齊全。','danger'),card('來源紀錄','只有 A；答案超出證據。','danger')],'交付前逐項核對來源，避免把猜測當成已知。','格式檢查不能取代內容驗證。',true),
 }},
 optimization:{title:'把可以一起查的工作排在一起',brief:'查案件要 3 秒，查信箱要 2 秒，核對要 1 秒。兩個查詢現在互不依賴，試著減少等待。',scenes:{
  start:{title:'兩張查詢工作卡已準備好',cards:[card('查案件','3 秒；只需要已知案件 ID。'),card('查信箱','2 秒；也只需要已知案件 ID。'),card('核對結果','1 秒；必須等兩份結果都到齊。')],actions:[action('把兩個查詢放在同一時間開始','parallel'),action('先查案件，結束後才查信箱','serial')]},
  parallel:{title:'兩個查詢同時開始，4 秒完成',cards:[card('案件查詢','0–3 秒'),card('信箱查詢','0–2 秒'),card('核對','3–4 秒；共 4 秒','success')],timeline:'parallel',actions:[action('換成信箱需要先拿到案件編號','dependent')]},
  serial:{title:'依序執行，6 秒完成',cards:[card('案件查詢','0–3 秒'),card('信箱查詢','3–5 秒'),card('核對','5–6 秒；共 6 秒')],timeline:'serial',actions:[action('換成信箱需要先拿到案件編號','dependent')]},
  dependent:{title:'這次信箱查詢需要案件查詢回傳的編號',cards:[card('案件查詢','先回傳信箱檢索所需的編號。'),card('信箱查詢','目前還沒有必要編號。','pending')],actions:[action('等拿到編號，再查信箱','safe'),action('仍然同時開始兩個查詢','unsafe')]},
  safe:{...finish('保留依賴，完整結果需要 6 秒',[card('案件查詢','0–3 秒，取得編號'),card('信箱查詢','3–5 秒，取得收件'),card('核對','5–6 秒，來源齊備','success')],'互不依賴的工作可平行；需要前一步結果時必須等待。','Parallelism：縮短等待前，先確認資料依賴。'),timeline:'serial'},
  unsafe:finish('信箱查詢缺少編號，執行失敗',[card('案件查詢','仍需 3 秒。'),card('信箱查詢','缺必要參數，無法執行。','danger'),card('結果','缺少收件資料，還要重新查詢。','warning')],'不能用提早發出無效請求來宣稱加速；先滿足必要依賴。','優化仍須維持相同品質與完整性。',true),
 }},
 multi:{title:'準備一個別人接得下去的交接包',brief:'案件助手已查完規範，信箱助手要接手。請把接手者真正需要的資料放進交接包。',scenes:{
  start:{title:'選取要交給信箱助手的資料',cards:[card('你已完成','案件 #1024 規範 v3：需要 A、B。'),card('接手者要做','查收件；失敗時交給整合負責人。')],pick:[card('案件 ID 與規範','案件 #1024；需要 A、B。'),card('來源與版本','案件規範 v3，10:00 查詢。'),card('已完成與待辦','案件已查；信箱待查。'),card('失敗時找誰','整合負責人接手。'),card('只說「已處理」','沒有說明處理了哪些事。')],actions:[action('把交接包送給信箱助手','safe',{needs:[0,1,2,3],otherwise:'blocked'})]},
  safe:finish('信箱助手可以接續工作',[card('接收檢查','案件、來源、進度、責任都齊備。','success'),card('信箱查詢','查到 A；尚未收到 B。'),card('整合負責人','取得來源與結果，核對後交付缺件清單。','success')],'交接要帶案件、來源版本、進度與失敗負責人，接收方先檢查再執行。','Handoff contract：讓接手者知道已做什麼、還要做什麼。'),
  blocked:finish('接手者停下來要求補資料',[card('交接包','缺少必要欄位。','warning'),card('信箱助手','先要求補齊，不猜測案件或執行狀態。','pending'),card('任務進度','尚未查信箱；協調等待增加。')],'交接資料不完整時先補齊，避免猜測與重複工作。','交接成本也是多 Agent 設計需要承擔的成本。',true),
 }},
};
export const initialPractice=()=>({scene:'start',selected:[]});
export function stepPractice(id,state,event){const scene=practices[id]?.scenes[state.scene];if(!scene)return state;
 if(event.type==='toggle'&&Number.isInteger(event.index)&&scene.pick?.[event.index])return {...state,selected:state.selected.includes(event.index)?state.selected.filter(n=>n!==event.index):[...state.selected,event.index]};
 if(event.type==='act'&&Number.isInteger(event.index)&&scene.actions[event.index]){const a=scene.actions[event.index];return {...state,scene:a.needs&&!a.needs.every(n=>state.selected.includes(n))?a.otherwise:a.to};}
 return state;
}
export function replayPractice(id,events=[]){return events.reduce((state,event)=>stepPractice(id,state,event),initialPractice());}
export function readPractices(raw){try{const data=JSON.parse(raw);if(data?.version!==3)return {};const out={};for(const id of Object.keys(practices)){const events=data.entries?.[id];if(!Array.isArray(events)||events.length>150)continue;let state=initialPractice(),valid=true;const clean=[];for(const e of events){if(!e||!['act','toggle'].includes(e.type)||!Number.isInteger(e.index)){valid=false;break;}const next=stepPractice(id,state,e);if(next===state){valid=false;break;}state=next;clean.push({type:e.type,index:e.index});}if(valid&&practices[id].scenes[state.scene].rule)out[id]=clean;}return out;}catch{return {};}}
export function practiceMarkdown(entries){const lines=['# 我的案件處理規則','','依教學操作整理，尚未驗證真實系統。',''];for(const [id,task] of Object.entries(practices)){lines.push('## '+task.title,'');if(!entries[id]){lines.push('尚未保存。','');continue;}let state=initialPractice();for(const e of entries[id]){const scene=task.scenes[state.scene];lines.push('- '+(e.type==='act'?scene.actions[e.index].label:(state.selected.includes(e.index)?'移出：':'放入：')+scene.pick[e.index].title));state=stepPractice(id,state,e);}const result=task.scenes[state.scene];lines.push('','結果：'+result.title,'','規則：'+result.rule,'','觀念：'+result.term,'',result.warning?'狀態：待改善':'狀態：此案例已處理','');}return lines.join('\n');}
