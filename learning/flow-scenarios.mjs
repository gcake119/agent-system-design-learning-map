const baseWeb = [
  {id:'browser',label:'Browser',role:'使用者操作與畫面狀態'},
  {id:'frontend',label:'Frontend',role:'事件、驗證、state 與 render'},
  {id:'api',label:'API',role:'HTTP 邊界、validation、auth'},
  {id:'backend',label:'Backend',role:'業務邏輯與 dependency 協調'},
  {id:'db',label:'Database',role:'權威資料與持久化'}
];

const make=(id,title,question,nodes,modes)=>({id,title,question,nodes,modes});

export const flowScenarios={
  flow:make('flow','一次儲存到底走過哪裡？','先看一個最小 Web request，切換步驟觀察每一層的 input / output。',baseWeb,[
    {id:'click',label:'1. Click',active:'frontend',status:'running',metrics:['目前：click event','尚未送出 request'],evidence:['Frontend 收到 user event','表單資料仍只在 browser memory'],takeaway:'使用者動作先變成 frontend event。'},
    {id:'request',label:'2. Request',active:'api',status:'running',metrics:['HTTP POST /records','payload 已送出'],evidence:['Network 面板出現 request','API 收到 method / headers / body'],takeaway:'Browser 與 API 之間透過 HTTP request / response 溝通。'},
    {id:'logic',label:'3. Backend',active:'backend',status:'running',metrics:['validation 通過','開始執行 business rule'],evidence:['backend log 有 operation id','API input 已轉成 backend command'],takeaway:'API 收到 request 後，真正的業務判斷通常在可信任端進行。'},
    {id:'write',label:'4. DB write',active:'db',status:'running',metrics:['INSERT 1 row','DB 12 ms'],evidence:['DB write 成功','authoritative state 已改變'],takeaway:'資料寫入完成只代表持久層狀態已改變。'},
    {id:'render',label:'5. UI update',active:'frontend',status:'ok',metrics:['HTTP 200','UI 顯示「已儲存」'],evidence:['response 回到 frontend','state 更新後重新 render'],takeaway:'完整 flow 還包含 response、frontend state 與 render。'}
  ]),
  locate:make('locate','「按儲存沒反應」壞在哪裡？','不要猜答案。切換故障位置，找第一個 input 正常但 output 開始不正常的節點。',baseWeb,[
    {id:'front',label:'Frontend 壞',active:'frontend',status:'bad',metrics:['Network requests: 0','UI 無變化'],evidence:['click event 未觸發 handler','API 完全沒收到 request'],takeaway:'第一個異常點在 frontend；後端沒有 evidence，不能先怪 API。'},
    {id:'api',label:'API 擋下',active:'api',status:'bad',metrics:['HTTP 400','DB writes: 0'],evidence:['request 已送達','validation error: missing field'],takeaway:'Frontend output 正常，API input 正常，但 API output 已異常。'},
    {id:'backend',label:'Backend exception',active:'backend',status:'bad',metrics:['HTTP 500','DB writes: 0'],evidence:['API routing 正常','backend log 出現 exception'],takeaway:'500 是症狀位置；還要繼續看 backend exception 的原因。'},
    {id:'db',label:'DB write 失敗',active:'db',status:'bad',metrics:['HTTP 500','constraint violation'],evidence:['backend command 正常','DB 拒絕 write'],takeaway:'第一個不正常 output 在 DB；root cause 仍可能是上游送入不合法狀態。'},
    {id:'render',label:'Render 壞',active:'frontend',status:'bad',metrics:['HTTP 200','DB row exists'],evidence:['response 正常','frontend state 已更新但 render condition 錯'],takeaway:'後端與 DB 都成功，使用者仍可能看到錯誤畫面。'}
  ]),
  latency:make('latency','頁面為什麼慢？','同一條 flow 的總 latency 是各段 critical path 累積。切換瓶頸看 evidence。',[
    {id:'frontend',label:'Frontend',role:'bundle / render'},
    {id:'network',label:'Network',role:'傳輸與 RTT'},
    {id:'api',label:'API',role:'routing'},
    {id:'backend',label:'Backend',role:'business logic'},
    {id:'db',label:'Database',role:'query'},
    {id:'external',label:'3rd-party',role:'外部 dependency'}
  ],[
    {id:'baseline',label:'Baseline',active:'backend',status:'ok',metrics:['Total 310 ms','DB 90 ms','External 80 ms'],evidence:['trace 各 span 接近','沒有單一資源飽和'],takeaway:'先有 baseline 才知道修改是否真的改善。'},
    {id:'dbslow',label:'Slow query',active:'db',status:'bad',metrics:['Total 1180 ms','DB 930 ms','DB CPU 86%'],evidence:['trace DB span 最長','query plan 顯示 full scan'],takeaway:'先定位 DB，再討論 index / query / cache；不是看到慢就加 server。'},
    {id:'network',label:'Network slow',active:'network',status:'bad',metrics:['Total 980 ms','Network 710 ms'],evidence:['server processing 正常','client RTT / transfer time 異常'],takeaway:'Server metrics 正常不代表使用者 latency 正常。'},
    {id:'external',label:'3rd-party slow',active:'external',status:'bad',metrics:['Total 1410 ms','Provider 1180 ms'],evidence:['trace 卡在 external span','內部 DB 正常'],takeaway:'外部 dependency 也在 user-facing critical path 上。'}
  ]),
  cache:make('cache','同一份資料被讀十萬次會怎樣？','從 DB overload 長出 cache，再觀察 cache 帶來的新 failure mode。',[
    {id:'api',label:'API',role:'read request'},
    {id:'backend',label:'Backend',role:'read orchestration'},
    {id:'cache',label:'Cache',role:'可重用副本'},
    {id:'db',label:'Database',role:'authoritative source'}
  ],[
    {id:'off',label:'No cache',active:'db',status:'bad',metrics:['DB QPS 10,000','Read latency 620 ms'],evidence:['每次 request 都到 DB','DB saturation 上升'],takeaway:'Cache 的需求來自 repeated read / expensive source，不是架構 checklist。'},
    {id:'hit',label:'Cache hit',active:'cache',status:'ok',metrics:['Cache hit 94%','DB QPS 600','Read latency 42 ms'],evidence:['多數 request 在 cache 結束','origin load 明顯下降'],takeaway:'Cache 改變 request path，也把 freshness 變成新問題。'},
    {id:'miss',label:'Cache miss',active:'db',status:'running',metrics:['Cache miss','DB QPS 暫升'],evidence:['cache 無值','request fallback 到 authoritative source'],takeaway:'Miss 是正常路徑之一，不等於 failure。'},
    {id:'stale',label:'Stale cache',active:'cache',status:'bad',metrics:['Cache v2','DB v3'],evidence:['response 快但資料舊','authoritative DB 已更新'],takeaway:'Hit 也可能回錯版本；cache correctness 要看 freshness requirement。'}
  ]),
  queue:make('queue','PDF 要處理 30 秒，誰需要等？','把長工作移出 request path 後，觀察 accepted、processing、completed 與 backlog。',[
    {id:'api',label:'Upload API',role:'接收工作'},
    {id:'queue',label:'Queue',role:'持久交接'},
    {id:'worker',label:'Worker',role:'背景處理'},
    {id:'result',label:'Result',role:'完成產物'}
  ],[
    {id:'sync',label:'Sync 30s',active:'worker',status:'bad',metrics:['User wait 30 s','Concurrent requests 堆積'],evidence:['request 一直等 worker','client timeout risk 上升'],takeaway:'同步代表 caller 要等指定結果，不代表這種設計一定錯。'},
    {id:'async',label:'Async',active:'queue',status:'ok',metrics:['API response 180 ms','Job state: accepted'],evidence:['工作已 enqueue','business result 尚未完成'],takeaway:'accepted ≠ completed。Queue 先改變等待位置。'},
    {id:'backlog',label:'Backlog',active:'queue',status:'bad',metrics:['Incoming 20/s','Processing 8/s','Queue age ↑'],evidence:['queue depth 持續上升','worker 沒有足夠 capacity'],takeaway:'Queue 可以吸收尖峰，長期 arrival > processing 時 backlog 仍會長大。'},
    {id:'workerfail',label:'Worker fail',active:'worker',status:'bad',metrics:['Failed jobs ↑','Retries ↑'],evidence:['API enqueue 正常','worker log 顯示 processing error'],takeaway:'使用者 request 成功後，後段仍可能失敗，因此需要 job evidence 與 recovery。'}
  ]),
  consistency:make('consistency','為什麼另一頁還是舊資料？','同一筆資料可能同時存在 browser、cache、DB、replica 與 projection。',[
    {id:'browser',label:'Browser state',role:'畫面副本'},
    {id:'cache',label:'Cache',role:'read copy'},
    {id:'db',label:'Primary DB',role:'authoritative state'},
    {id:'replica',label:'Read replica',role:'複本'},
    {id:'projection',label:'Async view',role:'衍生資料'}
  ],[
    {id:'fresh',label:'全部 v3',active:'db',status:'ok',metrics:['Primary v3','Cache v3','Replica v3'],evidence:['所有 read path 已追上','同一 record 在 browser / cache / replica 都回報 v3'],takeaway:'一致不是抽象名詞；可以直接描述各 read path 看見哪個版本。'},
    {id:'cachelag',label:'Cache 還是 v2',active:'cache',status:'bad',metrics:['Primary v3','Cache v2'],evidence:['write 已完成','另一頁讀 cache 回舊值'],takeaway:'第一個舊版本出現在 cache path，修法取決於 freshness requirement。'},
    {id:'replicalag',label:'Replica lag',active:'replica',status:'bad',metrics:['Primary v3','Replica v2','Lag 4.2 s'],evidence:['write primary 成功','read-after-write 落到 replica'],takeaway:'Replication 可改善 read capacity / availability，也會引入可見的 propagation lag。'},
    {id:'projectionlag',label:'Async view lag',active:'projection',status:'bad',metrics:['Primary v3','Projection v1'],evidence:['event 已產生','projection consumer backlog'],takeaway:'資料正確性要看「哪一份資料在什麼時間點被拿來做什麼決策」。'}
  ]),
  evidence:make('evidence','這一層壞了，要看什麼才知道？','同一事故切換不同 evidence surface，理解每種證據能回答的問題與限制。',[
    {id:'client',label:'Client',role:'user symptom'},
    {id:'api',label:'API',role:'request boundary'},
    {id:'queue',label:'Queue',role:'job handoff'},
    {id:'worker',label:'Worker',role:'processing'},
    {id:'provider',label:'Provider',role:'external dependency'}
  ],[
    {id:'logs',label:'Logs',active:'worker',status:'bad',metrics:['event: worker error','operation_id: A17'],evidence:['單次事件與 context 清楚','無法直接知道一小時整體失敗率'],takeaway:'Log 適合回答「這一次發生了什麼」。'},
    {id:'metrics',label:'Metrics',active:'queue',status:'bad',metrics:['error rate 18%','queue age 92 s'],evidence:['趨勢與 aggregate 異常清楚','不知道某一筆 request 的完整路徑'],takeaway:'Metric 適合回答「整體是否變差、變多少」。'},
    {id:'trace',label:'Trace',active:'provider',status:'bad',metrics:['Trace A17','provider span timeout'],evidence:['跨元件 critical path 可見','仍需其他 evidence 解釋 provider 為何 timeout'],takeaway:'Trace 適合回答「同一次 operation 經過哪裡、在哪段停住」。'},
    {id:'business',label:'Business state',active:'provider',status:'running',metrics:['Job accepted','Artifact absent'],evidence:['技術 request 成功','真正業務結果尚未完成'],takeaway:'Telemetry 描述系統事件；business state 才能回答「事情最後有沒有完成」。'}
  ]),
  redesign:make('redesign','找到問題以後，應該改哪裡？','整合 incident：先定位，再比較設計修改與 cross-layer trade-off。',[
    {id:'browser',label:'Browser',role:'user experience'},
    {id:'api',label:'API',role:'request boundary'},
    {id:'backend',label:'Backend',role:'business logic'},
    {id:'cache',label:'Cache',role:'read optimization'},
    {id:'db',label:'DB',role:'authoritative state'},
    {id:'queue',label:'Queue',role:'async handoff'},
    {id:'worker',label:'Worker',role:'background work'},
    {id:'external',label:'External',role:'third-party'}
  ],[
    {id:'dbload',label:'DB saturation',active:'db',status:'bad',metrics:['DB CPU 94%','p95 1.4 s'],evidence:['trace DB span dominates','read QPS 重複且高度相似'],takeaway:'可以比較 query/index/cache/read replica；每個方案解不同限制，也引入不同成本。'},
    {id:'provider',label:'Provider timeout',active:'external',status:'bad',metrics:['Timeout 24%','retries 3x'],evidence:['內部處理正常','重試放大 provider load'],takeaway:'修改 retry policy 也會改流量、duplicate-effect risk 與 user latency。'},
    {id:'backlog',label:'Queue backlog',active:'queue',status:'bad',metrics:['Queue age 11 min','Workers 2'],evidence:['arrival 長期大於 processing','API accepted 仍正常'],takeaway:'增加 workers、限流、改工作成本或改 SLA 都是不同 design choice。'},
    {id:'stale',label:'Stale read',active:'cache',status:'bad',metrics:['DB v8','Cache v6'],evidence:['write 成功','read path 仍命中舊 cache'],takeaway:'修 cache invalidation、讀 authoritative source 或改 UX expectation，要回到 consistency requirement。'}
  ])
};

export function flowScenarioFor(unitId){
  return flowScenarios[unitId]||null;
}
