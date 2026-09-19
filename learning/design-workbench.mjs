import { designBriefs } from './deep-content.mjs';
export const WORKBENCH_KEY='agent-design-workbench-v2';
const control=(label,a,b)=>({label,options:[a,b]});
export const workbenches={
 overview:{scenario:['兩個來源正常','信箱查詢逾時'],controls:[control('安排查詢流程','固定查詢兩個來源','依缺口選擇工具'),control('遇到未知如何交付','交付部分結果並轉人工','等待完整證據再交付')],nodes:['任務','查詢','交付']},
 loop:{scenario:['第一輪取得資料','連續查不到新資料'],controls:[control('執行上限','最多 2 輪','最多 4 輪'),control('服務重啟時','從檢查點接續','重新查詢唯讀資料')],nodes:['檢查狀態','執行查詢','中斷與恢復','停止條件']},
 context:{scenario:['收件版本未改變','已有新收件 v9'],controls:[control('摘要保留什麼','期限、來源與未知','只保留一句大意'),control('行動前如何取得資料','重新查詢來源版本','直接使用先前摘要')],nodes:['原始資訊','模型當前資訊','行動依據']},
 reliability:{scenario:['查詢暫時逾時','寫入成功但回應遺失'],controls:[control('重試預算','最多重試 1 次','最多重試 3 次'),control('寫入結果不明時','沿用同一冪等鍵','直接重新建立')],nodes:['送出請求','來源實際狀態','恢復動作','實際結果']},
 evidence:{scenario:['答案與來源一致','答案宣稱收到未查到的文件'],controls:[control('留下哪些紀錄','只記最終答案','記錄來源、工具與結果'),control('如何驗收','只檢查輸出格式','檢查格式及來源支持')],nodes:['執行證據','輸出答案','驗收結果']},
 optimization:{scenario:['兩個來源互相獨立','信箱依賴案件查詢結果'],controls:[control('查詢如何安排','依序查詢','同時查詢'),control('遇到前置依賴','等待必要資料再執行','忽略依賴直接執行')],nodes:['案件查詢','信箱查詢','彙整與驗證']},
 multi:{scenario:['交接正常','信箱助手逾時'],controls:[control('誰負責整合','單一助手統一狀態','多助手分工'),control('交接保留什麼','來源、版本、狀態與負責人','只傳送結論摘要')],nodes:['任務分配','來源處理','整合負責人']},
};
export const defaultDesign=()=>({choices:[0,0],scenario:0,note:''});
export function normalizeDesign(id,value){
 const c=workbenches[id]; if(!c||!value||typeof value!=='object')return null;
 return {choices:c.controls.map((_,i)=>value.choices?.[i]===1?1:0),scenario:value.scenario===1?1:0,note:typeof value.note==='string'?value.note.slice(0,2000):''};
}
export function readDesigns(raw){try{const data=JSON.parse(raw);if(data?.version!==2)return {};return Object.fromEntries(Object.keys(workbenches).filter(id=>data.entries?.[id]).map(id=>[id,normalizeDesign(id,data.entries[id])]).filter(([,v])=>v));}catch{return {};}}
const f=(action,states,explanation,extra={})=>({action,states,explanation,...extra});
export function simulateDesign(id,design){
 const d=normalizeDesign(id,design)||defaultDesign(),[a,b]=d.choices,s=d.scenario;let frames=[],risk=false,tradeoff='',revisit='';
 if(id==='overview'){
  const source=s?'信箱逾時，收件未知':'規範 A、B；只收到 A';
  frames=[f('送出查詢任務',['#1024；只允許讀取',a?'由模型辨認資料缺口':'固定查案件與信箱','尚未交付'],'任務明確限制為唯讀；工具選擇仍受授權限制。'),f('取得來源結果',['#1024；只允許讀取',source,'等待驗證'],'查詢失敗必須保留未知狀態。'),f('依交付規則處理',['#1024；只允許讀取',source,s?(b?'暫停交付，保存狀態':'交付部分結果；承辦人補查'):'缺 B；附來源與查詢時間'],s?(b?'等待也需要期限；本草稿設定 30 秒後轉人工。':'不宣稱已確認缺件，並指定承辦人補查。'):'來源支持缺件結論，才可交付。')];
  tradeoff=(a?'工具選擇較靈活，需要限制呼叫與驗證軌跡。':'流程易重現，新增來源需要修改流程。')+(b?' 等待完整證據會增加回覆時間。':' 部分結果需要人工接續。');revisit='來源、授權或可接受的等待時間改變時。';
 }else if(id==='loop'){
  const limit=a?4:2;frames=[f('觀察任務狀態',['案件已查；信箱待查','尚未查信箱','保存案件 v3','上限 '+limit+' 輪'],'先知道做到哪裡，再決定下一步。'),f('查詢信箱',['案件已查',s?'第 1 輪：無新資料':'第 1 輪：取得收件 v8','保存本輪結果','尚未驗證'],'工具結果寫入狀態。'),f('模擬重啟並恢復',[b?'重新讀取案件與信箱':'讀取檢查點',s?'信箱仍無新資料':'取得有效收件資料',b?'唯讀重查；增加 2 次讀取':'驗證案件版本後接續','依剩餘預算執行'],'檢查點與重查的差異是恢復成本；兩者都不能繞過執行上限。'),f('執行至結束條件',['檢查完成',s?'累計 '+limit+' 輪無新資料':'來源齊備',b?'重查記錄已保留':'檢查點已更新',s?'達上限，停止並轉人工':'完成；缺 B 並附來源'],s?'持續無進展時停止，不以重啟重設總預算。':'驗收條件已滿足，不必把所有輪次用完。')];tradeoff=(a?'較多查詢機會，也增加等待與費用。':'較早停止，暫時性問題較容易轉人工。')+(b?' 重查簡單但增加讀取。':' 檢查點需要版本管理。');revisit='工具成本、任務長度或是否包含寫入改變時。';
 }else if(id==='context'){
  const refresh=!b,missing=!!a; risk=!refresh&&(missing||!!s);
  frames=[f('選取任務資料',['期限週五；收件 v8 只有 A','任務＋期限＋收件：8 / 10 單位','尚未決定'],'先保留任務所需的來源與期限。',{capacity:8}),f('套用摘要策略',['完整來源仍保留',a?'需要補文件：2 / 10 單位':'週五補 B；版本 v8；新收件未知：5 / 10 單位','等待檢查'],a?'容量較小，但無法還原期限、缺件與來源版本。':'壓縮同時保留決策需要的欄位。',{capacity:a?2:5}),f('依資訊策略做判斷',[s?'來源已更新 v9：A、B 齊備':'來源仍為 v8',refresh?(s?'讀取 v9：已收齊':'重新取得 v8 與期限'):'沿用舊摘要',refresh?(s?'不再催補':'週五前補 B'):a?'資訊不足，停止推論':s?'仍催補 B：使用過期資訊':'依 v8 提醒補 B'],refresh?'重新取得完整來源可補足摘要缺口，但增加查詢。':risk?'目前策略缺少必要資訊或刷新證據，不能放心採用。':'本次資料剛好未變；仍需訂定刷新規則。',{capacity:refresh?7:a?2:5})];tradeoff=(a?'摘要更短但失去決策細節。':'摘要保留較多容量。')+(b?' 節省查詢，但可能使用過期資料。':' 每次刷新增加讀取成本。');revisit='資料異動頻率、容量限制或行動風險改變時。';
 }else if(id==='reliability'){
  const retries=a?3:1;risk=!!(s&&b);
  frames=[f('送出工具要求',['操作 #R1',s?'尚未寫入':'查詢尚未返回','重試上限 '+retries+' 次','等待回應'],'操作鍵代表同一次業務動作。',{records:0}),f('模擬回應逾時',['助手看到逾時',s?'提醒 #1 已寫入':'查詢暫時不可用','成功與否尚待確認','不可猜測結果'],s?'逾時沒有撤銷已完成的寫入。':'查詢逾時與空資料不同。',{records:s?1:0}),f('執行所選恢復策略',['保持操作範圍',s?'提醒 #1 仍存在':'仍暫時不可用',s?(b?'直接重新建立':'沿用 R1 取得原結果'):'依退避策略重試 '+retries+' 次',s?(b?'提醒 #2 重複建立':'仍只有提醒 #1'):'用完預算，停止並交接'],s?(b?'重複寫入已發生，需要修改策略。':'本案例假設工具在有效保留期內支援同鍵去重。'):'增加重試次數也增加等待；總等待另限 30 秒。',{records:s?(b?2:1):0})];tradeoff=(a?'較多恢復機會與等待成本。':'較少等待，但較快轉人工。')+(b?' 直接建立可能造成重複效果。':' 冪等鍵需符合工具作用範圍與有效期。');revisit='工具是否支援冪等、操作可逆性或錯誤類別改變時。';
 }else if(id==='evidence'){
  risk=!b||(!a&&!!s);frames=[f('記錄執行證據',[a?'案件 v3；收件 v8；工具成功':'只保留最終文字','收件來源只有 A','尚未檢查'],'保留遮蔽敏感資料後的必要證據。',{trace:a?'查詢 #1024 → 收件 v8：只有 A':'未保存來源紀錄'}),f('產生待驗收答案',[a?'來源紀錄可查':'來源紀錄缺漏',s?'答案宣稱 A、B 已收齊':'答案說明缺 B','格式符合'],'兩種答案格式相同，語意是否有證據支持不同。',{trace:s?'答案：A、B 已收齊':'答案：缺 B'}),f('執行驗收規則',[a?'可對照收件 v8':'無法回查來源',s?'A、B 已收齊':'缺 B',b?(a?(s?'拒絕：來源不支持答案':'來源與答案一致'):'證據不足，轉人工確認'):'格式通過；未驗證內容'],b?'來源支持與格式是不同檢查；缺少證據時不得宣稱驗證完成。':'格式通過無法證明缺件結論正確。',{trace:b?'檢查格式＋來源支持':'僅檢查格式'})];tradeoff=(a?'增加紀錄與隱私管理成本。':'紀錄少，但難以追查錯誤。')+(b?' 來源核對增加驗收工作。':' 僅格式檢查會漏掉語意錯誤。');revisit='來源格式、敏感資料要求或可接受錯誤類型改變時。';
 }else if(id==='optimization'){
  risk=!!(s&&a&&b);const parallel=!!(a&&!s);frames=[f('安排查詢',['案件需 3 秒','信箱需 2 秒','驗證需 1 秒'],'時間都是教學假設，兩種配置使用相同資料與刻度。'),f('播放目前設計的時間軸',['案件查詢 0–3 秒',risk?'缺案件編號，信箱查詢失敗':parallel?'信箱查詢 0–2 秒':'信箱查詢 3–5 秒',risk?'缺來源，禁止宣稱完成':'總計 '+(parallel?4:6)+' 秒'],risk?'平行化不能消除資料依賴。':parallel?'來源獨立，因此可重疊等待時間。':s?'有前置依賴，先等待案件結果再查信箱。':'依序完成兩個查詢，再統一驗證。',{timeline:true,parallel,failed:risk})];tradeoff=risk?'無效的提前查詢增加失敗與重工。':parallel?'降低等待，但需管理併發與部分失敗。':'執行順序明確，但獨立來源可能多等 2 秒。';revisit='依賴、負載、品質或尾端延遲改變時；錯誤增加就撤回。';
 }else if(id==='multi'){
  risk=!!(a&&b);frames=[f('分配查詢責任',[a?'案件助手＋信箱助手':'單一助手呼叫兩個工具','案件與信箱各自查詢','指定整合負責人'],'任務責任必須有明確歸屬。'),f('接收查詢結果',[a?'兩位助手交接':'工具結果回到同一狀態',s?'案件成功；信箱逾時':'案件與信箱皆成功',b?'只傳「已處理」':s?'保留版本、未知與待辦':'保留兩來源版本與完成狀態'],b?'簡短摘要不足以說明哪些工作已完成。':'來源、版本、成功／失敗與負責人一起保留。',{packet:b?['已處理']:['案件 v3',s?'信箱未知':'收件 v8','整合負責人接手']}),f('驗證並整合',[a?'交接驗證':'統一狀態驗證',s?'信箱仍未知':'來源已返回',b?(a?'交接不完整，退回補齊':'回查保留的工具原始結果'):s?'交付待確認事項並轉人工':'缺 B；附來源'],b?'補查與補交接都要計入分工成本。':s?'逾時不應被整合成已完成。':'結果相同時還要比較交接與協調成本。',{packet:b?['需要補查來源與完成狀態']:['來源版本已保留',s?'承辦人補查信箱':'驗收完成']})];tradeoff=(a?'增加專業分工，也增加交接與協調。':'狀態集中，專業責任擴大時需再評估。')+(b?' 摘要過短會增加補查。':' 完整交接較長但可追查。');revisit='專業分工是否帶來可量測的品質收益，以及協調成本增加時。';
 }
 const labels=workbenches[id].controls.map((c,i)=>c.options[d.choices[i]]);
 return {frames,risk,tradeoff,revisit,summary:labels.join('；'),result:frames.at(-1).states.at(-1),scenario:workbenches[id].scenario[s]};
}
export function designEntry(id,design){const d=normalizeDesign(id,design),sim=simulateDesign(id,d);return {approach:sim.summary,fields:[workbenches[id].controls[0].label+'：'+workbenches[id].controls[0].options[d.choices[0]],workbenches[id].controls[1].label+'：'+workbenches[id].controls[1].options[d.choices[1]],'已演練條件：'+sim.scenario,'觀察結果：'+sim.result],rationale:'依上述操作選擇整理；仍需以其他情境驗證。',tradeoff:sim.tradeoff,revisit:sim.revisit+(d.note?'\n個人補充：'+d.note:'')};}
export function designMarkdown(entries){const lines=['# 我的案件助手設計','', '由互動操作產生的教學草稿。演練完成不代表已通過真實系統驗證。',''];for(const [id,brief] of Object.entries(designBriefs)){lines.push('## '+brief.title,'');if(!entries[id]){lines.push('尚未採用設計。','');continue;}const e=designEntry(id,entries[id]);lines.push('採用方案：'+e.approach,'',...e.fields.map(t=>'- '+t),'','接受的代價：'+e.tradeoff,'','重新評估條件：'+e.revisit,'');}return lines.join('\n');}
