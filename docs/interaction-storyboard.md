# Interaction Storyboard v0.1

> 日期：2026-09-25
> 狀態：**Working storyboard accepted（2026-09-25）**。使用者授權依目前學習程度與既定 learning-map 流程自行完成後續 Learning Copy / Implementation / QA；實際使用後再依學習回饋迭代。
> 前置 gate：Curriculum confirmed；Unit 1–8 Canonical Content + Cross-unit Content Review PASS
> 本文件只定義學習互動與可觀察狀態，不是 Learning Copy，也不修改 production UI。

## 0. Storyboard 原則

依 learning-map Skill，每個 stage 都必須回答：

1. learner 眼前看到的問題；
2. 初始可見狀態；
3. learner 做什麼／觀察什麼；
4. 畫面或 system state 怎麼改；
5. 改變後揭露什麼 evidence / consequence；
6. learner 看到結果後才引入什麼概念；
7. 為什麼這個 stage 必要。

### Learner-facing 語言

- 先白話，再術語。
- 第一次出現的術語：白話問題 → 名詞 → 一句定義 → 例子／反例。
- 一個 stage 最多承擔一個主要新概念。
- 不直接把 canonical content 的研究式中英混合文字搬到 UI。
- 圖上的 box 優先寫「做什麼」，不是先寫 framework / pattern 名稱。

### Interaction rhythm

每單元原則上採：

```text
問題出現
→ learner 先預測／選擇／排列
→ 系統讓狀態真的改變
→ learner 看見 consequence
→ 才命名概念
→ 改一個 constraint 再比較
→ transfer：換成使用者接觸過的案例，不提示 pattern
```

不是每章固定相同 controls；interaction 跟著 learning problem。

## 1. Unit 1 — 到底要做到什麼？

### Stage 1A — 「可以訂票」夠不夠？

**Visible question**
「需求只有一句：『使用者可以選場次並預訂座位。』現在可以開始畫系統了嗎？」

**Initial state**
一張非常簡單的需求卡；右側有空白「還不知道」區。

**Learner action**
從數個問題中挑出會改變設計的問題，例如：指定座位／總容量、是否暫時保留、付款失敗、取消權限、開賣尖峰。也可選一個「先加 Redis」之類的技術答案。

**Transition**
選問題時，需求卡展開成「已確認／暫時假設／還不知道」三區；選技術答案不會加入需求，而顯示「這是解法，現在還不知道是否需要」。

**Revealed evidence**
不同答案會導致不同後續設計問題。

**Concept after**
requirement、assumption、constraint。先用白話：
- requirement：系統被要求做到什麼；
- assumption：現在先這樣想，但還沒確認；
- constraint：會限制設計選擇的條件。

**Why**
讓 learner 親自發現「一句功能描述不足以決定 architecture」。

### Stage 1B — Example 不是 Rule

**Question**
「兩個人同時點最後一個座位，應該發生什麼？」

**Action**
切換三種 domain conditions：指定座位容量 1／自由入場容量 N／可候補。

**Transition**
同一個「預約」操作產生不同允許結果。

**Concept**
business rule / invariant：在這個案例的明確條件下不能被破壞的規則。

**Why**
避免把教學例子誤認成所有 booking system 的真理。

### Stage 1C — 對比 URL Shortener

**Question**
「換成短網址系統，還需要先問『兩個人搶最後一個座位』嗎？」

**Action**
將同一組 requirement questions 拖到 Booking / URL Shortener。

**Transition**
問題重新分組：booking 偏 scarce resource / concurrency；shortener 偏 ID、redirect、traffic、abuse / expiry。

**Concept**
System Design 問題由 workload / rules / constraints 決定。

### Transfer 1 — Sim-sik-style booking

只給「預約心理師，同時要處理場地」。Learner 把卡片放進「先問／可晚點問／這是解法不是需求」。不提示 transaction / Calendar sync。

---

## 2. Unit 2 — 這件事誰負責？

### Stage 2A — 先不要切 microservices

**Question**
「建立訂單這件事，畫面、訂單、庫存、付款、出貨各自需要知道／修改什麼？」

**Initial state**
一條 order flow，所有責任先混在同一大框。

**Action**
把 responsibility cards 拖到不同 responsibility zones；不是 service boxes。

**Transition**
資料 ownership / external dependency / trust boundary 隨責任配置顯示。

**Evidence**
若「所有東西都直接改同一份資料」，規則來源變得模糊；若切得過細，跨界 arrows 暴增。

**Concept**
boundary：這件事到哪裡算誰負責。
contract：兩邊約好要給什麼、成功／失敗代表什麼。

### Stage 2B — Box 不等於 Service

**Action**
同一份 responsibility map 切換三種 deployment view：single app / modular app / multiple services。

**Transition**
responsibilities 不變，deployment boxes 改變；network / deployment / coordination cost 跟著出現。

**Concept**
module、process、service 的差別；microservices 不是成熟度分數。

### Stage 2C — Trust boundary

**Question**
「前端把『取消別人的訂單』按鈕藏起來，夠嗎？」

**Action**
切換正常 client / modified request。

**Transition**
modified request 繞過 UI；只有 server-side authorization 擋下 mutation。

**Concept**
trust boundary / authorization enforcement。

### Transfer 2 — Case multi-repo

給 frontend / backend / document engine / DB 四個現有 boxes，但要求 learner 重新標「責任」而不是照 repo 數量當 service 數量。

---

## 3. Unit 3 — 兩個人同時改資料會怎樣？

### Stage 3A — Race animation

**Question**
「A、B 都看到最後一個座位還空著，接下來會怎樣？」

**Action**
learner 手動交錯執行 A/B 的 read → decide → write。

**Transition**
某個 interleaving 產生兩筆 confirmed booking。

**Evidence**
每個 request 單獨看都「合理」，合起來破壞規則。

**Concept**
race condition；authoritative state。

### Stage 3B — 哪裡擋住衝突？

**Action**
依序套用：
- client 先查；
- DB constraint；
- conditional update；
- lock / stronger isolation。

**Transition**
同一 interleaving 重播，顯示哪一步被拒絕／等待。

**Concept**
transaction、isolation、constraint、optimistic / pessimistic control。每次只揭露一個。

**Boundary**
不顯示「最佳答案」；顯示各方案保護範圍與代價。

### Stage 3C — Payment 對比

把「唯一座位」換成 payment state / operation identity，讓 learner 發現 correctness 不只有 unique constraint。

### Transfer 3

Therapist + room booking 或 case workflow transition；learner 自己標出「最後要相信哪份資料」「哪條規則不能被繞過」。

---

## 4. Unit 4 — 誰要等到哪一步？

### Stage 4A — Notification timeline

**Question**
「訂單成立後要寄 Email。使用者要等 Email 寄完，才算下單成功嗎？」

**Action**
把 notification 放在 request path 內／外。

**Transition**
顯示 response wait time 與不同 failure coupling；不先顯示 queue。

**Concept**
synchronous / asynchronous：
- synchronous：這次操作要等到某個結果；
- asynchronous：先收件，最後結果稍後另外取得。

### Stage 4B — 「收到」有很多種

**Action**
沿 timeline 逐步推進：API accepted → queued → worker received → provider accepted → business result。

**Transition**
每一步只亮起已知 evidence。

**Concept**
job state、handoff、completion semantics。

### Stage 4C — Video pipeline dependency

Learner 拉 dependency arrows；只有無依賴 stages 才能切成 parallel。開太多 workers 時顯示 downstream 壓力。

**Concept**
dependency / bounded parallelism / backpressure（先白話「後面處理不完，前面不能一直塞」）。

### Transfer 4 — VocaScript-style pipeline

排列 transcription / diarization / summary / export；決定 intermediate artifact、job status、哪些 failure 可以從中間接續。

---

## 5. Unit 5 — 出錯後，我現在到底知道什麼？

### Stage 5A — Payment timeout 三分支

**Question**
「付款等太久 timeout。付款失敗了嗎？」

**Action**
先選「失敗／成功／不知道」。

**Transition**
展開三個 hidden remote branches：
1. request 沒到；
2. provider 還在做；
3. 已扣款但 response 遺失。

**Concept**
timeout / unknown outcome。

### Stage 5B — Retry 會發生什麼？

**Action**
按「直接再試一次」。

**Transition**
在 branch 3 產生 duplicate charge；在 transient branch 可能成功。

**Concept**
retry budget、idempotency：同一件事重送，不應多做一次。

### Stage 5C — Recovery toolbox

不是選「最佳 pattern」，而是把 verify / retry / wait / fallback / resume / compensate / human review 配到不同 failure states。

**Concept**
compensation：事情已經發生，只能再做一個動作補救。
circuit breaker：一直失敗時先停止繼續打同一 dependency。

### Transfer 5 — Publishing timeout

按下發表後 timeout；learner 必須先選 evidence source，再決定是否 retry。沒有「idempotency 題」提示。

---

## 6. Unit 6 — 我憑什麼說做到了？

### Stage 6A — API 200 不等於完成

**Question**
「API 回 200。你現在能確定什麼？」

**Action**
勾選 claims：handler 回覆／DB state 正確／payment known／notification delivered／authorization 正確。

**Transition**
只保留 evidence 真正支持的 claims。

**Concept**
evidence scope。

### Stage 6B — Test 穿過哪些 boundary？

**Action**
在同一 architecture 上切換小範圍 test、service/contract test、integration、E2E。

**Transition**
被實際執行的 boxes / dependencies 高亮，沒碰到的變淡。

**Concept**
不先背 taxonomy；先理解「這個 test 到底測到哪裡」。

### Stage 6C — Logs / Metrics / Traces

**Question**
「通知沒送到，你先需要回答什麼？」

**Action**
依問題選 signal：
- 某 job 發生什麼事件；
- 這一小時失敗率多少；
- 這次 operation 經過哪些服務。

**Transition**
同一 synthetic operation 用三種視角呈現。

**Concept**
log / metric / trace，並顯示 sensitive field 被 redacted。

### Transfer 6 — Case transition evidence chain

把「必要資料未完成不得推進」連成 requirement → backend rule → tests → production transition evidence。Learner 找出哪一段目前沒有證據。

---

## 7. Unit 7 — 到底是哪裡撐不住？

### Stage 7A — 三種「流量變大」

**Question**
「三個系統都說流量變大，該加一樣的東西嗎？」

**Initial state**
News Feed / Video Delivery / URL Shortener 三張 workload card。

**Action**
比較 request rate、object size、read/write、processing time、peak。

**Transition**
每張卡的 constrained resource 高亮不同。

**Concept**
workload、latency、throughput、saturation、bottleneck。

### Stage 7B — Intervention simulator

選一個 bottleneck，再加入 index / cache / worker / replica / CDN / partition。

**Transition**
只改它真正影響的 signal，同時揭露新 trade-off：staleness、cost、backlog、hotspot、coordination。

**Rule**
不能在沒有 bottleneck 的情況下自由堆元件。

### Stage 7C — Before / After evidence

固定同一 workload / correctness target，比較 intervention 前後。不能用不同 workload 做假比較。

### Transfer 7 — Podcast hosting

給小型 read-heavy workload。Learner 選「現在最值得處理的地方」和「現在沒有理由加入的元件」，並說明何種 workload change 會讓答案改變。

---

## 8. Unit 8 — 新版怎麼換上去，舊東西才不會壞？

### Stage 8A — Naive DB migration

**Question**
「把 full_name 改成 first_name + last_name，先改 DB 再 deploy 新版，可以嗎？」

**Action**
按下 naive deploy。

**Transition**
rolling period 顯示 v1 / v2 同時存在；v1 對新 schema 發生 failure。

**Concept**
compatibility window：新舊版本同時存在的那段時間。

### Stage 8B — Staged migration

**Action**
learner 排序：expand schema / deploy compatible code / backfill / switch / verify / remove old field。

**Transition**
timeline 顯示每一步哪些 app versions 還能工作。

**Concept**
migration / backward compatibility。

### Stage 8C — Rollback 不是一個按鈕

**Question**
「新版有問題，按 rollback 就好了嗎？」

**Action**
分別 rollback traffic / code / config。

**Transition**
已寫入的新 data / external effect 保留，畫面顯示哪些東西沒有回去。

**Concept**
rollback scope、forward fix、compensation。

### Stage 8D — Canary / Rolling / Blue-green

不做排行榜。Learner 切換 strategy，看 exposure、capacity、coexistence、cost、shared-state constraint 改變。

### Transfer 8 — Multi-repo change

frontend / backend / document engine / DB 同時有 contract / schema change。Learner 排 deploy order、選 verification evidence、標 rollback 不可逆點。

---

## 9. Final integrated transfer — 案件追蹤＋批次文件處理

### Setup

只給 synthetic requirement / workload，不標示章節：

- 批次匯入文件；
- 每件案件獨立處理；
- 自動分派後人工核對；
- required info 不完整不能推進；
- document processing 長時間；
- external notification；
- roles / permissions；
- workload 增長；
- 新版本新增 job states。

### Progressive incidents

系統逐步揭露：

1. 兩個 worker 同時更新同一 case；
2. document job timeout，但不知道是否產出 artifact；
3. queue backlog 成長；
4. notification provider failure；
5. production deploy 後 old frontend 看不懂 new status。

Learner 不會看到「這是 Unit 3 題」之類提示。

### Learner actions

- 標出還缺的 requirement；
- 指定 authoritative state / responsibility；
- 修正 workflow；
- 選 evidence；
- 決定 recovery；
- 找 bottleneck；
- 安排 compatible rollout。

### Output

產生一份 compact design handoff：

- confirmed requirements；
- assumptions；
- responsibilities / contracts；
- state / invariants；
- failure / recovery；
- evidence；
- workload / bottleneck；
- change / rollout plan；
- still-open questions。

不是分數，也不是「通關證書」。

## 10. Storyboard acceptance criteria

進 Learning Copy 前，需確認：

- 每個 stage 都有可觀察 state change；
- interaction 不是裝飾；
- 每個新術語都在 learner 看見問題／結果後才命名；
- 一個 stage 不同時塞太多新術語；
- 每單元至少一次 constraint change 讓原方案需要重評估；
- 經典案例教概念，transfer 不提示 pattern；
- synthetic assumptions 可見；
- 重要概念不只靠動畫或 hover；
- reduced-motion 時仍能看到 before / after；
- 沒有把 AI output 當 answer key；
- final transfer 能跨章推理。

## 11. 尚未決定

這些留到 Storyboard review / Learning Copy：

- 每個 stage 實際 screen 數；
- map navigation 的最終形式；
- controls 的具體元件；
- 是否使用 SVG / Vue Flow / custom DOM animation；
- learner notes / Learning Handoff 的 UI；
- mobile layout；
- 最終視覺風格。

Storyboard 確認前不修改 production UI。


## 12. Decision authority / iteration policy

2026-09-25 使用者確認：Storyboard 已細到難以在尚未實際學習前判斷每個互動是否適合，因此後續不再要求逐 stage 人工確認。

執行原則：

- 以已確認的 curriculum、Canonical Content、cross-unit Content Review 與本 storyboard 作 working baseline；
- 依學習者目前程度，優先降低一次引入的抽象概念數，使用白話、具體狀態變化與案例比較；
- 專有名詞第一次出現必須定義，不假設熟悉 distributed systems / DevOps / database theory；
- 可以在 Learning Copy / Implementation 階段調整 screen 數、互動節奏、提示與案例細節，只要不改變 canonical instructional meaning；
- 若 implementation 發現互動無法正確呈現機制，可回修 storyboard；若發現 subject-matter 問題，回修 Canonical Content；
- 不因「已確認 storyboard」而凍結 learning copy；
- 第一版目標是形成可實際學習的完整課程，再以 Human Learning Review / learner feedback 修正；
- 實際使用後，優先記錄「哪裡看不懂、名詞太快、操作不知道要做什麼、案例無法 transfer」，不以 clicks / completion time 當理解程度的代理指標。
