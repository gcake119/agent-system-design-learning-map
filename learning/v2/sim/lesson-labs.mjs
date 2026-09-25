export const lessonLabs={
 requirements:{component:'requirements',stages:{
  enough:{focus:'requirements',note:'先改預約規則與情境條件，看 design concerns 怎麼變。'},
  rule:{focus:'rule',note:'只改預約模式，比較「真正不能被破壞的規則」如何改變。'},
  transfer:{focus:'transfer',note:'把同一套 requirement reasoning 帶到心理師＋場地預約；不提供技術答案。'}
 }},
 boundaries:{component:'boundary',stages:{
  responsibility:{focus:'layout',note:'先比較同一責任在單一 App 與多 Services 下的 coordination cost。'},
  contract:{focus:'contract',note:'打開 Payment 獨立部署，觀察跨 boundary call；再思考 contract 需要穩定哪些語意。'},
  trust:{focus:'trust',note:'打開「只靠前端授權」，看 trust risk 出現在哪條 boundary。'},
  transfer:{focus:'transfer',note:'把 repo 數量拿掉，只看責任、shared write 與 deployment need。'}
 }},
 concurrency:{component:'concurrency',stages:{
  race:{focus:'writers',note:'先把 concurrent writers 從 1 調到 2，觀察 invariant 怎麼被破壞。'},
  authority:{focus:'authority',note:'保留同一個 booking model，辨認真正能拒絕衝突的 authoritative write path。'},
  mechanism:{focus:'mechanism',note:'切換 constraint / optimistic / lock，比較 conflict 與 waiting cost。'},
  transfer:{focus:'transfer',note:'把容量 1 的座位換成心理師＋場地兩種資源，保留「先找 rule 再選 mechanism」。'}
 }},
 async:{component:'queue',stages:{
  wait:{focus:'sync',note:'先切同步／非同步，只比較 request latency 與 completion latency。'},
  states:{focus:'states',note:'保持同一條 pipeline，觀察 accepted、queued、processed 不同狀態。'},
  pressure:{focus:'capacity',note:'提高 arrival rate、增加 workers，直接看 backlog growth。'},
  transfer:{focus:'transfer',note:'把 job 換成轉錄 pipeline，思考哪些中間產物值得保存。'}
 }},
 failure:{component:'failure',stages:{
  timeout:{focus:'timeout',note:'先提高 timeout rate，只觀察 unknown outcome。'},
  retry:{focus:'retry',note:'把 retry 從 0 調到 3，再比較 provider load 與 duplicate effect。'},
  recover:{focus:'safety',note:'開啟查證與冪等，看它們各自改變哪個結果；補償仍是 external effect 的後續動作。'},
  transfer:{focus:'transfer',note:'把 payment 換成 publish，保留 unknown → verify → retry 的推理。'}
 }},
 evidence:{component:'evidence',stages:{
  scope:{focus:'scope',note:'同一個 Worker crash，切換四種 evidence view。'},
  tests:{focus:'tests',note:'把「證據有範圍」帶到 test：它實際穿過哪些 boundary？'},
  signals:{focus:'signals',note:'回到 JOB-42，Log / Metric / Trace 各回答不同問題。'},
  transfer:{focus:'transfer',note:'用案件狀態規則建立 requirement → enforcement → test → production evidence。'}
 }},
 scale:{component:'capacity',stages:{
  workload:{focus:'workload',note:'切換 URL / Feed / Video，先看同樣 traffic 對不同 resource 的壓力。'},
  bottleneck:{focus:'bottleneck',note:'提高流量，先找 critical node，再改 architecture。'},
  cache:{focus:'intervention',note:'只改 Cache / CDN / replicas，看哪些 node metrics 真的變。'},
  transfer:{focus:'transfer',note:'切到小型 Podcast workload，找「現在不需要」的複雜度。'}
 }},
 evolution:{component:'rollout',stages:{
  coexist:{focus:'coexist',note:'保持 v1/v2 同時存在，觀察 rollout 期間的 compatibility window。'},
  migration:{focus:'schema',note:'切換 expanded / contracted schema，看 old version 是否還能工作。'},
  rollback:{focus:'rollback',note:'在 schema 已 contract 時觀察 code rollback 為什麼不再安全。'},
  transfer:{focus:'transfer',note:'把同一模型帶到 frontend/backend/document-engine 的跨 repo change。'}
 }}
};
export function labFor(unitId,stageId){return lessonLabs[unitId]?.stages?.[stageId]||null}