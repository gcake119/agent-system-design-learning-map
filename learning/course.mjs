export const course={
  title:'System Design',
  subtitle:'沿著真實系統 flow 找問題、理解設計、判斷 trade-off',
  intro:'從使用者看到的現象開始，沿 request / data flow 找到第一個異常節點，再用 evidence 驗證原因與修改。'
};

const stage=(id,eyebrow,title,intro,prompt)=>({id,eyebrow,title,intro,prompt,options:[]});

export const units=[
  {id:'flow',number:1,title:'一個按鈕到底發生了什麼',summary:'建立 Browser → Frontend → API → Backend → DB → Response → UI 的完整 request flow。',stages:[
    stage('observe','建立系統心智模型','按下「儲存」之後，request 到底去了哪裡？','先不要背架構名詞。沿著一次最小 Web 操作，看每一層收到什麼、產生什麼。','切換上方步驟，試著用自己的話重畫正常 flow。'),
    stage('reason','INPUT → OUTPUT','每一層都可以問同一件事','只要知道一層的 input 與 output，就開始有辦法沿 flow 找問題。','哪一層第一次把 user action 變成跨網路 request？哪一層真正改變 authoritative state？'),
    stage('transfer','TRANSFER','換成建立預約','把同一個 flow 套到一筆預約建立；先不加入 cache、queue 或 microservices。','你能指出預約成立前後，各層至少一個可觀察結果嗎？')
  ]},
  {id:'locate',number:2,title:'問題到底壞在哪一層',summary:'從「按儲存沒有反應」開始，用 input / output 找第一個異常節點。',stages:[
    stage('observe','FIRST BAD NODE','同一個症狀，可以壞在完全不同的地方','切換故障位置，不看答案名稱，先比較每一層 evidence。','哪一個節點的 input 還正常，但 output 已開始不正常？'),
    stage('reason','CAUSE ≠ SYMPTOM','找到錯誤訊息還不夠','第一個可見異常點、direct cause 與 root cause 可能落在不同位置。','HTTP 500 能證明什麼？又不能證明什麼？'),
    stage('transfer','TRANSFER','PDF 一直停在處理中','把「沒反應」換成背景工作卡住，仍沿 input / output 與 evidence 追。','你會先看 request、queue、worker，還是 artifact state？為什麼？')
  ]},
  {id:'latency',number:3,title:'系統為什麼會變慢',summary:'把 total latency 拆回 flow，看真正時間花在哪一段。',stages:[
    stage('observe','LATENCY PATH','慢不是一個位置','同一條 request path 上，每一段都會累積等待時間。','切換 bottleneck，找出 critical path 最長的 segment。'),
    stage('reason','BOTTLENECK','找到慢點後才選解法','DB slow、network slow、third-party slow 需要的處理方向不同。','目前 evidence 足以支持「加 server」嗎？'),
    stage('transfer','TRANSFER','列表頁突然變慢','給你 frontend、network、API、DB 的時間，你能先排除哪些層？','哪一份新 evidence 最能縮小範圍？')
  ]},
  {id:'cache',number:4,title:'為什麼要 Cache',summary:'從 repeated read 與 DB overload 長出 cache，再看 stale、miss 與 invalidation。',stages:[
    stage('observe','PROBLEM → MECHANISM','同一份資料一直被查','先看 no-cache baseline，再切換 hit / miss / stale。','Cache 真正改變了 request flow 的哪一段？'),
    stage('reason','TRADE-OFF','變快之後，多了什麼問題','副本會讓 freshness 與 invalidation 變成新的 correctness concern。','Cache hit 一定代表回傳的是對的資料嗎？'),
    stage('transfer','TRANSFER','熱門可預約時段','讀取很多、寫入較少時，哪些資料可以 cache？哪些決策仍要回 authority？','你會用什麼 evidence 判斷 cache 是否值得？')
  ]},
  {id:'queue',number:5,title:'為什麼要 Queue',summary:'從 30 秒 PDF processing 理解 request completion、business completion 與 backlog。',stages:[
    stage('observe','SYNC → ASYNC','使用者需要等 30 秒嗎？','比較同步與 enqueue 後立即 accepted 的差異。','哪一步只是「收到工作」，哪一步才是「完成工作」？'),
    stage('reason','BACKLOG','Queue 不會創造處理能力','arrival 長期高於 processing 時，等待只會被保存起來。','Queue depth 與 queue age 各自告訴你什麼？'),
    stage('transfer','TRANSFER','文件處理流程','把 upload → parse → extract → result 畫成工作流。','worker 掛掉時，哪裡應留下足以 resume 的 evidence？')
  ]},
  {id:'consistency',number:6,title:'資料為什麼看起來不一致',summary:'沿 frontend state、cache、primary、replica、projection 追資料版本。',stages:[
    stage('observe','DATA FLOW','同一筆資料同時有很多份','切換 stale cache / replica lag / projection lag。','哪一份是 authoritative state？使用者這次讀到哪一份？'),
    stage('reason','CONSISTENCY','「舊」要看使用情境','短暫落後是否可接受，要回到 read-after-write 與 product requirement。','哪種畫面必須立即看到新值？哪種可以延遲？'),
    stage('transfer','TRANSFER','預約完成但行事曆還沒更新','DB、Calendar projection、UI state 可能不同步。','你會如何描述正常 propagation，以及哪一步算第一個異常？')
  ]},
  {id:'evidence',number:7,title:'系統出錯時怎麼知道',summary:'根據問題選 logs、metrics、traces 或 business state，不靠猜。',stages:[
    stage('observe','EVIDENCE SURFACES','同一事故有不同看法','切換 logs / metrics / trace / business state，注意每份 evidence 的 scope。','這份 evidence 能支持哪個結論？不能支持哪個？'),
    stage('reason','VERIFY HYPOTHESIS','Evidence 是用來縮小範圍','先說 hypothesis，再決定下一份最有資訊量的 evidence。','如果 trace 已顯示 provider timeout，下一步還需要什麼才能找 root cause？'),
    stage('transfer','TRANSFER','notification 沒送到','不要把所有 logs 都打開。','你現在最需要回答的是「根本沒排程、尚未處理、worker 失敗、provider 失敗」中的哪一個？')
  ]},
  {id:'redesign',number:8,title:'找到問題以後，要怎麼改系統',summary:'定位 incident 後，再比較 cache、queue、retry、replica、rate limit 等 design trade-off。',stages:[
    stage('observe','INTEGRATED INCIDENT','先定位，再設計','切換 DB saturation、provider timeout、queue backlog、stale read。','每個 incident 的 first bad node 與 bottleneck 在哪裡？'),
    stage('reason','DESIGN DECISION','同一問題可以有多個方案','每個改動都要說明解什麼問題、複雜度移到哪裡、需要新增什麼 evidence。','如果加 cache 解了 DB read load，新增了哪一類 failure mode？'),
    stage('transfer','TRANSFER','完整 Web / SaaS 系統','沒有 chapter hint，也不提示 pattern 名稱。','從 symptom → flow → evidence → cause → modification → trade-off → verification 完整走一次。')
  ]}
];

export function unitById(id){return units.find(unit=>unit.id===id)||units[0];}
export function stageById(unit,id){return unit?.stages.find(stage=>stage.id===id)||unit?.stages[0]||null;}
