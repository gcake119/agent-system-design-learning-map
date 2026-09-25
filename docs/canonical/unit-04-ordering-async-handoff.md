# Unit 4 Canonical Content v0.1 — 決定工作的順序、等待與交接

> 狀態：**Content Review PASS（2026-09-25）**。Canonical Content v0.1 方向已確認；以下修訂納入 subject-matter validation。
> 本文件定義 Unit 4 必須正確傳達的 instructional meaning；不是 message broker、Kafka 或 workflow framework 教學。

## Central question

**一個工作需要經過多個步驟時，哪些步驟必須等待，哪些可以稍後／平行處理？系統說「收到」時，到底完成了什麼？**

Unit 2 已建立 responsibility / contract，Unit 3 已建立 authoritative state / concurrency。Unit 4 把它們放進時間軸：依賴、同步／非同步、background work、queue、job state 與 handoff。

## Learning objectives

學完後，學習者應能：

1. 從 dependency 與 user-visible outcome 判斷工作必須 serial、可以 parallel，或可以 asynchronous，不用「async 比較 scalable」作唯一理由。
2. 區分 request accepted、message persisted / queued、worker started、business effect completed、result delivered 等不同狀態。
3. 為 background / long-running job 定義 identity、input reference / version、state、result、error、retry / handoff information。
4. 說明 queue / broker 能提供哪些 decoupling / buffering 能力，以及哪些 ordering、duplicate、delivery / business completion semantics 仍需另外設計。
5. 依 workload 比較 synchronous request path、background job、queue-based processing 的 latency、reliability、operability 與 complexity trade-offs。
6. 面對 AI 建議「加 queue / parallelize」時，能先畫 dependency graph 並指出哪些步驟真的互不依賴。

## Core claims

### C1. 順序來自 dependency，不來自程式碼目前怎麼寫

若 B 的 input 需要 A 的 output，B 必須等待 A 的相關結果；若兩個 read / computation 互不依賴，才有平行的可能。

「目前是 for-loop」不證明必須 serial；「可以開 Promise.all」也不證明業務上可以 parallel。

### C2. Synchronous / asynchronous 是 interaction semantics，不是快／慢的同義詞

Synchronous path 通常讓 caller 等待某個結果；asynchronous path 允許 caller 在 work 完成前先取得 acknowledgement / job identity，再透過 callback、polling、event 或其他方式取得結果。

Async 可能降低 caller blocking time、吸收尖峰或隔離慢 dependency，但也增加：

- job state；
- result retrieval；
- retry / duplicate；
- ordering；
- monitoring；
- cancellation / timeout；
- eventual completion / failure handling。

因此 async 不是免費的 scalability switch。

### C3. Accepted / queued / delivered / processed / business-completed 是不同語意

把 message 成功寫入 queue，只能支持「broker 接受／保存了這個 message」這類範圍內的結論，不能自動推出 consumer 已處理，更不能推出 domain outcome 已成立。

教材要讓 learner 為每個狀態命名，並決定 user / upstream system 真正需要等待哪個狀態。

### C4. Queue 用來 decouple 與 buffer，不自動提供 end-to-end exactly-once business effect

Queue 可以讓 producer 與 consumer 在時間、吞吐或 availability 上較鬆耦合，也可吸收 burst。

但 delivery semantics、duplicate handling、consumer crash、poison message、ordering、backlog、business idempotency 等需要依 broker 與 application 設計。

Unit 4 只建立這個邊界；duplicate effect / retry / idempotency 在 Unit 5 深入。

### C5. Long-running work 需要 durable job identity / state，而不是只靠一條 HTTP connection

若工作時間長於合理 request lifecycle，或需要 crash recovery，系統通常需要能在 connection 消失後仍辨認 job：

- job / correlation ID；
- input reference + version；
- accepted / running / completed / failed / cancelled 等 state；
- result / artifact reference；
- error / attempt information；
- ownership / authorization。

具體 storage / broker implementation 依 workload 決定。

### C6. Handoff contract 必須攜帶下一個 responsibility 真正需要的資訊

好的 handoff 不只是「請處理 case 123」。依情境可能需要：

- stable identity；
- source / version；
- 已完成 state / effects；
- required inputs；
- authorization / tenant context；
- known errors / unknowns；
- expected output / completion semantics。

這延續舊版 multi-agent handoff 的可用內容，但移除「一定是 Agent-to-Agent」的假設。

### C7. Backpressure 是 production / consumption rate 不匹配時的系統問題

如果 work arrival rate 長時間高於 processing capacity，queue 只會讓 backlog 變得可見／延後爆發，不會創造 capacity。

系統需要決定：

- 可以排多長；
- 超過容量時 reject / shed / throttle / degrade；
- 是否增加 workers；
- user 如何知道延遲；
- backlog 是否會讓資料過期或失去價值。

Unit 7 會用量測與 capacity 深入；Unit 4 先建立 queue length / wait time 是設計的一部分。

## Reasoning chain

```text
desired user / business outcome
  ↓
list steps + inputs / outputs
  ↓
draw dependencies
  ↓
identify required synchronous path
  ↓
move independent / deferrable work off path if justified
  ↓
define job / message states + handoff contract
  ↓
define how result / failure reaches caller
  ↓
check backlog / ordering / duplicate boundaries
```

## Required terminology

### Dependency
後一步需要前一步的 output / state / decision 才能正確執行的關係。

### Synchronous interaction
Caller 在同一 interaction 中等待指定 outcome。並不表示所有內部工作都只能 serial。

### Asynchronous interaction
Caller 不在原 interaction 中等待最終 business outcome；系統需要另外表示 work identity、state 與 result delivery。

### Queue / broker
在 producer / consumer 之間保存與傳遞 work / messages 的 infrastructure。實際 durability、ordering、delivery guarantee 依產品／設定而定。

### Job
可被識別、追蹤狀態與結果的一次工作執行／業務處理實例。

### Handoff
責任從一個 component / worker / human 移交給下一個處理者時，傳遞足以繼續工作的 state / context。

### Backpressure
當 downstream 無法以 incoming rate 持續處理時，系統用來限制、延後、拒絕或調節 upstream work 的機制／現象。

## Classic teaching case A — Notification System

Synthetic flow：

「Order 已成立後，需要發 email / SMS 通知。」

Questions：

- Order success 是否必須等待 notification provider？
- 如果只要求「通知工作已接受」，API response 應該承諾什麼？
- queue accepted、worker processed、provider accepted、recipient actually received 是不是同一件事？
- email / SMS 可以 parallel 嗎？是否有 channel-specific dependency？
- user 如何知道通知失敗？
- provider 慢時，order path 是否應一起變慢？

Unit 4 不先解 duplicate send / retry policy；只建立 state / dependency / completion semantics。

## Classic comparison case B — Video / Media Processing

Synthetic pipeline：

upload → virus / format check → transcode variants → thumbnail → publish metadata。

用來顯示：

- 某些 steps 有 hard dependency；
- 多個 transcode variants 可能 parallel；
- work 長到不適合維持 request connection；
- partial artifact / job progress 需要 durable state；
- publish 是否等待所有 variants，是 product requirement。

不要把「video pipeline = 一定要 Kafka」當結論。

## Transfer target — VocaScript-style processing pipeline

Synthetic flow：

audio file → transcription → speaker diarization → structured transcript → summary / export。

不提示 queue / worker。

Learner 應辨認：

- diarization 是否依賴 transcript / timestamps，依實際 pipeline assumption 明示；
- summary 失敗是否需要重做 transcription；
- intermediate artifact 是否值得持久化；
- job identity / file version 如何避免拿錯輸入；
- CPU / GPU heavy step 是否適合從 interactive request path 移出；
- 多個 export 是否可以 parallel；
- caller 怎麼知道「已接受」「正在轉錄」「可下載 transcript」「summary failed」。

## Misconceptions and boundary cases

### M1. 「async 一定比較快」
修正：async 改變 caller waiting / coordination；總工作時間可能不變，還增加 queue / state overhead。

### M2. 「進 queue 就算完成」
修正：queued 只代表 queue 所承諾的接受／保存狀態；business completion 需另外定義。

### M3. 「queue 保證 exactly once」
修正：delivery guarantee 依 broker；end-to-end business effect 還需要 application design。Unit 5深入。

### M4. 「可以 parallel 就應該 parallel」
修正：parallelism 增加 resource contention、rate limit、partial failure 與 coordination；要有 latency / throughput requirement。

### M5. 「背景工作不需要 user-facing state」
修正：如果 user / upstream 需要知道 outcome，就要有 job identity、status / callback / polling 等 contract。

### M6. 「有 queue 就解決 overload」
修正：若長期 arrival > service rate，backlog 會持續成長；仍需 capacity / admission / backpressure 策略。

## Transferable principle

> **先定義「誰需要等到什麼狀態」，再決定同步、非同步、平行與 queue。Infrastructure 只能提供局部 delivery / buffering guarantee；business completion 必須由自己的 state 與 contract 說清楚。**

## Claim-level source mapping

| Claim | Source | Status |
| --- | --- | --- |
| Queue-Based Load Leveling 可 decouple task arrival from processing，吸收 load peaks，但 queue length / latency / failure 需監控 | Azure Queue-Based Load Leveling | selected official source; review pending |
| async request-reply 需要 status endpoint / correlation and separate result retrieval | Azure Asynchronous Request-Reply | selected official source; review pending |
| competing consumers 可增加 processing capacity，但 ordering / concurrency / idempotency 需考量 | Azure Competing Consumers | selected official source; review pending |
| messaging delivery / ordering guarantee 依 broker / configuration，不泛化 | product-neutral claim; must validate with pattern docs and keep scoped | review pending |
| Notification / media / VocaScript scenarios | synthetic teaching cases | assumptions must be explicit |

## Sources for Content Review

- Azure Architecture Center — Queue-Based Load Leveling
- Azure Architecture Center — Asynchronous Request-Reply
- Azure Architecture Center — Competing Consumers
- Azure Architecture Center — Pipes and Filters (for pipeline dependency / independent stages if needed)
- ByteByteGo archive — message queue / Kafka / async diagrams as supplemental coverage
- Existing course handoff / state content as legacy material to adapt, not authority

## Content Review — 2026-09-25

### Result: PASS

Unit 4 的 dependency → interaction semantics → job state → handoff → backlog 推理鏈通過內容審查。

### Validation decisions

1. **Queue-Based Load Leveling 的 scope 收斂。** Queue 可以 decouple arrival rate 與 processing rate、buffer burst、讓 consumer 依自身 capacity 處理；但 queue 本身不創造 processing capacity，長期 arrival > service rate 仍會累積 backlog。
2. **HTTP 202 只是 async request-reply 的一種具體 pattern。** Azure Asynchronous Request-Reply 使用 202 + status endpoint / Location 作 Web API 例子；Canonical Content 保留更一般的「acknowledgement + stable work identity + later result」語意，不把 202 當所有 async interaction 的必要形式。
3. **Competing Consumers 不是無條件 parallelism。** 增加 consumers 可提升 throughput / availability，但 ordering、shared-resource contention、duplicate / failure semantics 仍需 application / broker 設計。
4. **Exactly-once claim 收斂。** Unit 4 不宣稱所有 queue 都會 duplicate，也不宣稱沒有 broker 能提供 exactly-once-related features；只教：不能從「message accepted / delivered」直接推論「end-to-end business effect 恰好發生一次」。這個 end-to-end 問題留 Unit 5。
5. **Pipeline parallelism 必須由 dependency 決定。** Pipes-and-Filters 類 pattern 可以把工作拆成 stages，但每個 stage 的 input/output、failure、ordering 與 state 都要明示；不是看到 pipeline 就自動平行。
6. **Backpressure 是 capacity mismatch 的設計問題。** Unit 4 只建立 backlog / admission / user-visible wait 的概念；Unit 7 再做 throughput / capacity measurement。
7. **VocaScript transfer 全部視為 synthetic teaching assumptions。** 不宣稱真實專案的 diarization / transcription dependency 或 production architecture 已被核實。

### Remaining non-blocking work

- Unit 5 正式處理 retry、duplicate delivery / effects、idempotency、unknown outcome、poison work 與 recovery；Unit 4 不提前提供完整解法。
- Storyboard 若用 queue 動畫，必須分開呈現 producer accepted、broker persisted、consumer received、business state changed，避免視覺上把它們合成同一個「成功」。
