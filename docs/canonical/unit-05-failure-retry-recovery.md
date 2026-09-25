# Unit 5 Canonical Content v0.1 — 處理失敗、重複與恢復

> 狀態：**Content Review PASS（2026-09-25）**。Canonical Content v0.1 方向已確認；以下修訂納入 subject-matter validation。
> 本文件定義 Unit 5 必須正確傳達的 instructional meaning；不是特定 retry library、broker 或 payment provider 教學。

## Central question

**當系統沒有收到預期結果時，怎麼分辨「失敗了」「還不知道」「只完成一部分」？下一步怎麼做才不會讓故障擴大或重複產生副作用？**

Unit 3 已建立 authoritative state / concurrency；Unit 4 已區分 accepted / queued / processed / completed。Unit 5 注入 timeout、dependency failure、worker crash、duplicate request / delivery、partial success，建立 failure reasoning 與 recovery。

## Learning objectives

學完後，學習者應能：

1. 區分 explicit failure、transient failure、timeout / unknown outcome、partial success，避免把「沒有收到成功」直接解讀成「操作沒有發生」。
2. 依 operation semantics 判斷是否能安全 retry，設定 retry scope / budget / backoff，並辨認 non-transient error 或 overload 時重試可能惡化問題。
3. 說明 idempotency 的目標、key / operation identity、effect scope 與 retention boundary，知道「同一 request 回應一樣」不等於所有外部 effects 都恰好一次。
4. 在 partial success 下保存已完成 effects 與未知事項，選擇 verify / resume / compensate / manual intervention，而不是一律從頭重跑。
5. 區分 redundancy / failover、backup / restore、checkpoint / resume、compensation 各自處理的 failure class。
6. 為 failure handling 定義可觀察 evidence、停止條件與 human escalation。
7. 面對 AI 建議「retry 3 次」「加 circuit breaker」時，能要求它說明 error classification、operation side effect、budget 與 recovery evidence。

## Core claims

### C1. Timeout 表示「在等待期限內沒有得到結果」，不等於 operation 未執行

可能情況包括：

- request 根本沒到 dependency；
- dependency 收到但尚未完成；
- dependency 完成，但 response 遺失／延遲；
- caller timeout 後 dependency 才完成。

因此對有 side effect 的 write，timeout 後直接重送可能造成 duplicate effect。第一步應根據 operation identity / authoritative evidence 判斷是否能查證結果。

### C2. Retry 是針對可能恢復的 failure 的策略，不是所有 error 的預設反應

Retry 適合 transient faults 的前提是：

- operation 可以重試，或有足夠 idempotency / deduplication protection；
- retry 不會超出 user / system latency budget；
- 不會在 dependency overload 時形成 retry storm；
- non-transient error（invalid input、permission denied 等）應停止或走其他處理。

Backoff / jitter 可以降低 synchronized retry pressure，但不能把永久錯誤變成可恢復錯誤。

### C3. Retry budget 要跨層思考

若 client、API、service、SDK、queue consumer 都各自 retry，實際 attempts 可能相乘。

教材不要求計算特定公式，但學習者要能畫出：

```text
caller attempt
  → service attempt
      → dependency attempt
```

並定義哪一層擁有 retry responsibility、最大時間／次數，以及超限後的 outcome。

### C4. Idempotency 要明確定義「同一 operation」與「哪個 effect 不應重複」

Idempotency 不是在 request body 加一個 UUID 就自動成立。

設計至少要回答：

- key / operation identity 如何產生、scope 是什麼；
- key 與 request payload 是否需要一致性檢查；
- dedup / result record 保存多久；
- concurrent duplicate requests 怎麼處理；
- 重複時回傳原 result、current state 或 conflict；
- local idempotency 是否涵蓋 external provider effect。

對 payment / publish 等 mutation，idempotency 的目的通常是讓同一 logical operation 重送時不產生額外 business effect；具體 guarantee 依 system / provider contract。

### C5. Exactly-once business effect 不能只靠 transport label 推論

Broker / database / stream platform 可能提供各種 delivery / processing guarantee，但 end-to-end business effect 會跨 producer、broker、consumer、database、external API。

本課程避免用「exactly once」當一句萬能保證；必須問：

> exactly once 的 **什麼**，在哪個 **scope**，由哪些 **mechanisms** 支持？

Unit 5 的初學重點是 deduplication / idempotent effect / reconciliation，而不是深入 distributed commit protocol。

### C6. Partial success 要保存進度與 effect，不要把整個 workflow 壓成 success / failure 二值

例如：

- booking 已建立；
- email job 已入列；
- provider call unknown。

Recovery 要從已知 state 接續。重新從第一步開始可能重複 booking / message / charge。

Checkpoint / durable workflow state 的價值是讓系統知道「已經做過什麼、還不知道什麼」。

### C7. Compensation 是新的 business action，不是時間倒轉

有些 effect 無法 rollback，例如 email 已寄出、外部付款已捕獲、實體流程已開始。

Compensation 可能是 refund、cancel、issue correction、manual review。它本身也可能失敗，需要 state / audit。

因此「distributed transaction 失敗就 rollback 全部」不是一般 external workflow 的可靠 mental model。

### C8. Circuit breaker / fallback / failover 解決不同問題

- retry：再次嘗試同一 dependency / operation；
- circuit breaker：在 dependency 持續失敗時暫停呼叫，避免浪費資源／擴大 cascading failure；
- fallback / degradation：提供較低能力的替代結果；
- failover / redundancy：切換到替代 instance / region / dependency；
- backup / restore：從持久備份恢復資料；
- checkpoint / resume：從 workflow 已保存進度接續；
- compensation：用新的 business action 處理已發生 effect。

教材要依 failure class 選工具，不把 reliability patterns 當同義詞。

### C9. Human-in-the-loop 是合法的 recovery path

當結果未知、風險高、automated evidence 不足或 compensation 需要 domain judgment 時，可以停止 automation 並交給人工。

交接至少要包含：

- operation / case identity；
- 已完成 effects；
- unknown / failed step；
- evidence / timestamps；
- 已做 retries；
- 可採下一步與禁止動作。

## Reasoning chain

```text
unexpected / missing result
  ↓
classify: explicit failure / transient / unknown / partial
  ↓
identify operation side effect + identity
  ↓
can authoritative result be verified?
  ↓
choose retry / wait / stop / fallback / resume / compensate
  ↓
apply budget + idempotency / dedup scope
  ↓
record evidence + final / unknown state
  ↓
escalate when automation cannot safely decide
```

## Required terminology

### Timeout
等待超過設定期限而沒有取得預期 response / result。它描述 observer 的等待結果，不直接證明 remote effect 是否發生。

### Transient fault
預期可能在短時間或下一次嘗試恢復的 failure。分類依 dependency / error contract，不由 HTTP status code 單獨決定所有情況。

### Unknown outcome
目前證據不足以判定 operation effect 是否已發生的狀態。

### Retry budget
允許 retry 的總次數、時間、資源或 end-to-end latency 範圍。

### Idempotency
同一 logical operation 被重複提交時，不額外產生超出其定義 scope 的 business effect。實際 semantics 由 API / system contract 決定。

### Deduplication
辨認重複 input / operation 並避免或合併重複處理的機制；不是所有 dedup 都等同完整 business idempotency。

### Compensation
針對已發生且不能直接 rollback 的 business effect 執行後續修正動作。

### Recovery
故障後把系統帶回可接受狀態或可繼續處理狀態的總稱，不等於單一 retry。

## Classic teaching case A — Payment System

Synthetic assumptions：

- client 為一次 checkout 建立 stable payment operation ID；
- payment provider 可能 timeout；
- provider 有查詢 payment status 的能力；
- local system 保存 operation state；
- 不在本單元宣稱特定 provider 的真實 API guarantee。

Scenario：

1. caller 發出 charge；
2. provider 收到並成功 charge；
3. response 遺失；
4. caller timeout。

比較：

- 直接產生新的 operation 再 charge；
- 用相同 logical operation identity 查證／重送；
- 等待人工查帳。

Learner 要指出 duplicate charge risk、需要的 evidence、idempotency scope、何時停止 automation。

## Classic comparison case B — Notification / Job Processing

Scenario：

- message delivered to worker；
- worker 呼叫 email provider；
- worker 在記錄 completion 前 crash。

問題：

- broker 是否會 redeliver？
- provider effect 是否已發生？
- consumer local state 能證明什麼？
- duplicate email 的 business impact 是否與 duplicate charge 一樣？
- 哪些 work 可以接受 at-least-once processing + idempotent effect，哪些需要更強 verification？

用來顯示相同 failure pattern 在不同 business effect 下 recovery policy 不同。

## Transfer target — iThome-style automated publishing

Synthetic scenario：

「Browser automation 點下『發表』後等待逾時，沒有看到成功頁面。」

不提示 retry。

Learner 應先問：

- publish request 是否可能已被 server 接受？
- 有沒有文章 ID / draft ID / expected publish date 可查？
- 可以從公開文章列表或後台 state 驗證嗎？
- 再按一次可能產生 duplicate post 還是被平台拒絕？
- platform 是否提供 idempotency contract？若不知道，不應假設。
- 哪些 evidence 足以宣稱 published？
- 自動查證失敗後，什麼狀態交給人工？

這個 transfer 只使用合成 platform semantics，不宣稱真實 iThome API / UI 有特定保證。

## Misconceptions and boundary cases

### M1. 「timeout = failure」
修正：timeout 是 observer 沒在期限內拿到結果；remote effect 可能成功、失敗或未知。

### M2. 「retry 多幾次可靠性就更高」
修正：retry 會增加 load / latency，也可能重複 side effect；需要 classification、budget 與 backoff。

### M3. 「POST 不能 retry，GET 都能 retry」
修正：HTTP method 提供語意線索，但實際 safety 仍依 API contract、side effects、idempotency implementation；不能只看 method 決定。

### M4. 「有 idempotency key 就 exactly once」
修正：key 只是 mechanism 的一部分；要定義 scope、storage、concurrent duplicate、external effects 與 retention。

### M5. 「queue exactly-once = business exactly-once」
修正：transport / processing guarantee 有 scope；end-to-end effect 還跨 consumer state / external systems。

### M6. 「rollback 可以撤銷所有事情」
修正：external / irreversible effects 常需要 compensation。

### M7. 「人工介入代表系統設計失敗」
修正：高風險 unknown state 有時明確停止與人工 review 才是安全設計。

## Transferable principle

> **遇到失敗先問「我現在知道什麼？」再問「能不能重試？」。Reliability 的核心不是無限重做，而是用 operation identity、authoritative evidence、bounded retry、idempotency、durable state 與明確 escalation，把未知與副作用控制在可處理的範圍。**

## Claim-level source mapping

| Claim | Source | Status |
| --- | --- | --- |
| transient failure 可 retry；策略需考慮 operation type、latency、backoff、retry storm | Azure Retry pattern | official source; review pending |
| repeated failure 可用 circuit breaker 避免持續呼叫 unhealthy dependency | Azure Circuit Breaker | official source; review pending |
| distributed workflow 可用 compensating transaction 撤銷／修正已完成 steps，compensation 本身也可能 fail | Azure Compensating Transaction | official source; review pending |
| retry + idempotency / duplicate effect boundary | AWS Builders' Library / Azure Retry / API provider docs to validate | pending |
| payment idempotency semantics | synthetic unless a provider's official docs are selected | intentionally not provider-specific |
| queue / consumer crash duplicate effect | messaging pattern sources | review pending |
| iThome transfer | synthetic teaching scenario based on workflow type | no platform guarantee asserted |

## Sources for Content Review

- Azure Architecture Center — Retry pattern
- Azure Architecture Center — Circuit Breaker pattern
- Azure Architecture Center — Compensating Transaction pattern
- AWS Builders' Library — Timeouts, retries and backoff with jitter
- AWS Builders' Library — Making retries safe with idempotent APIs
- Azure / AWS messaging docs as needed for redelivery scope
- Existing legacy reliability lessons as reusable teaching material, not authority

## Content Review — 2026-09-25

### Result: PASS

Unit 5 的 failure classification → verification → bounded retry / recovery 推理鏈通過內容審查。

### Validation decisions

1. **Retry 僅針對可合理視為 transient 的 failure。** Azure Retry 明確要求依 operation / exception 類型判斷是否 cancel、立即 retry 或 delay retry；不是所有 failure 都重試。
2. **Idempotency 與 side effect 必須一起判斷。** Azure Retry 指出非 idempotent operation 的 retry 可能造成 inconsistency；AWS Builders' Library 也把 stable client request identifier / semantic equivalence 作為 safe retry 的重要條件。
3. **Layered retries 會放大 load。** AWS Builders' Library 的案例明確說明多層各自 retry 會 multiplicatively 增加 downstream calls；Canonical Content 的 retry ownership / budget 保留。
4. **Backoff / jitter 是 load-control mechanism，不是 correctness guarantee。** 它降低同步 retry 與 overload 壓力，但不能修正 invalid request 或 duplicate business effect。
5. **Compensation 不是 automatic rollback。** Azure Compensating Transaction 把它描述為 undo / counter-effect workflow；步驟可有 application-specific logic、順序可能不同，compensation 本身也可能失敗並需要可恢復 state。
6. **Circuit breaker 與 retry 分工成立。** Retry 假設下一次可能成功；Circuit Breaker 在 dependency 持續故障時阻止更多呼叫並等待 recovery condition。
7. **Exactly-once 維持 scope-question framing。** 不做「所有 exactly-once 都不可能」的 universal claim；只要求 learner 指出 transport / processing / business effect 的 scope 與 supporting mechanisms。
8. **Payment / publishing 保持 synthetic。** 不引用特定 payment provider 或 iThome 的真實 idempotency guarantee；若未有官方 contract，就保持 unknown。

### Remaining non-blocking work

- Unit 6 需要把 failure evidence 與 observability / testing 接起來，不能把「有 log」當成 recovery correctness proof。
- Storyboard 若模擬 timeout，畫面必須保留 remote effect 的 unknown branch，不能把 timeout 動畫直接畫成紅色「失敗」終點。
- 若後續加入 poison message / dead-letter queue 的具體操作語意，需依所選 broker 官方文件核實。
