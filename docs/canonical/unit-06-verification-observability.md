# Unit 6 Canonical Content v0.1 — 驗證行為，觀察與定位問題

> 狀態：**Content Review PASS（2026-09-25）**。Canonical Content v0.1 方向已確認；以下修訂納入 subject-matter validation。
> 本文件定義 Unit 6 必須正確傳達的 instructional meaning；不是特定 testing framework、APM 或 observability vendor 教學。

## Central question

**系統「看起來有跑」和「我們有證據支持它符合需求」差在哪裡？出問題時，要留下哪些證據才能知道哪一段發生了什麼？**

Unit 1 定義 behavior / constraints；Unit 2–5建立 boundary、state、workflow、failure handling。Unit 6 把需求與實際執行重新接起來：verification、tests、logs、metrics、traces、production evidence 與 regression。

## Learning objectives

學完後，學習者應能：

1. 把一項 requirement / rule 對應到 design mechanism、pre-production verification 與 production evidence，指出仍未被驗證的 assumption。
2. 區分 unit / component / contract / integration / end-to-end 等不同 test scope 所能提供的證據，不用「測試有過」概括所有 correctness。
3. 區分 logs、metrics、traces 的觀察視角，為一次跨 component flow 選擇 correlation / trace identity 與必要事件。
4. 從 success / boundary / concurrency / failure / unauthorized scenarios 建立 regression cases，避免只測 happy path。
5. 區分「觀測到發生什麼」與「依 requirement 判斷是否可接受」，不把 observability data 本身當 acceptance criteria。
6. 辨認 telemetry 中的 sensitive data / secrets / identifiers 風險，遵守 data minimization / access control / retention。
7. 使用 AI 協助產生 test ideas / incident hypotheses 時，能要求它連回 requirement、evidence 與未驗證假設，而不是把 AI judge 當唯一 truth source。

## Core claims

### C1. Requirement → mechanism → evidence 要能追得回去

每個重要 requirement 都應能回答：

- 哪個 component / mechanism 負責維持它？
- 在 merge / deploy 前，用什麼 test / review / analysis 檢查？
- 上線後，用什麼 signal 看它是否真的持續成立？
- 哪些部分目前只能用 assumption / sampling / manual review？

這不是要求所有 requirement 都有一個 production metric，而是要求 verification strategy 與 risk 對得上。

### C2. Test scope 不同，證據範圍也不同

- small / unit-level test：快速檢查局部 logic；
- component / service test：檢查較完整 component behavior；
- contract test：檢查 consumer / provider 對 contract 的相容理解；
- integration test：檢查多 component / infrastructure interaction；
- end-to-end / acceptance flow：從外部行為檢查一條較完整 user / business flow。

名稱在不同團隊可能不同。本課程不把 taxonomy 當標準答案；重點是 learner 能說出「這個 test 實際包含哪些 boundary、沒包含哪些」。

### C3. Passing tests 是指定案例的可執行證據，不是所有 production behavior 的證明

Tests 只證明在其環境、fixtures、assertions 與執行範圍下觀察到預期結果。

可能仍未涵蓋：

- production traffic / concurrency；
- external provider behavior；
- data distribution；
- configuration / permissions；
- long-running degradation；
- unknown edge cases。

因此 regression suite 很重要，但不能被描述為完整 correctness proof。

### C4. Logs、metrics、traces 回答不同類型的問題

概念層：

- **logs**：離散事件與 context，例如 error、state transition、job result；
- **metrics**：一段時間內可聚合的數值，例如 request rate、latency、error count、queue depth；
- **traces**：一次 request / transaction / workflow 穿過多個 components 的因果／時間路徑。

實際 telemetry model 依 observability stack 而定。OpenTelemetry 提供 traces / metrics / logs 的 vendor-neutral model，可作術語核實來源。

### C5. Correlation identity 讓跨邊界證據可以連起來

若一個 flow 經過 API → queue → worker → external provider，只看各自孤立 log 很難回答「這是不是同一個 operation」。

需要依情境使用 request / trace / job / operation / case identity，並避免把 sensitive business data 當 correlation key。

Correlation 讓 evidence 可串接，但不等於所有事件都應永久保存。

### C6. Observability 告訴我們系統內部狀態的 evidence；acceptance / SLO / business rule 才決定是否可接受

例如 metric 顯示 P95 latency 800ms 是 observation；「必須低於 1s」才是 requirement / target。

trace 顯示 email provider 花 3 秒是 evidence；是否代表 order failure 取決於 Unit 1 / 4定義的 completion semantics。

因此：

> **telemetry ≠ verdict**

### C7. Production verification 需要同時看 outcome 與 process constraints

某結果可能「看起來正確」，但執行過程違反：

- authorization；
- privacy；
- rate / resource limit；
- required approval；
- forbidden external call；
- audit requirement。

反過來，process 看起來正常也不能證明 final business state 正確。

Unit 6 延續舊版 evidence 單元的「成果與過程分開驗證」。

### C8. Regression cases 應來自已知風險與曾發生問題

Regression 不只是固定 happy-path snapshot。應保留：

- critical success cases；
- boundary cases；
- concurrency / duplicate cases；
- failure / timeout cases；
- unauthorized attempts；
- 曾修復的 bugs / incidents。

當 requirement 改變，tests 也可能需要更新；「舊測試失敗」不自動代表新 implementation 錯。

### C9. Telemetry 本身有 security / privacy cost

不要為了 debugging 無限制記錄：

- access tokens / passwords / secrets；
-完整 sensitive payload；
-不必要的 PII；
-可被未授權人員讀取的 internal data。

需要 data minimization、redaction / filtering、access control、retention / deletion policy。Observability pipeline 本身也是需要保護的 system。

## Reasoning chain

```text
requirement / invariant / constraint
  ↓
responsible mechanism
  ↓
pre-production verification
  ↓
deploy / run
  ↓
logs + metrics + traces + business state
  ↓
correlate evidence
  ↓
compare against acceptance / target
  ↓
classify failure / regression / unknown
  ↓
feed findings back into design + tests
```

## Required terminology

### Verification
取得 evidence 檢查 implementation / system behavior 是否符合指定 requirement / design assumption 的活動。

### Acceptance criteria
Unit 1 定義的可檢查需求條件。它不是 telemetry 本身。

### Regression
先前被接受／確認的 behavior 在變更後退步。前提是 requirement 本身仍然有效。

### Log
描述離散 event 的 telemetry record；具體 structure 依系統。

### Metric
可聚合的 numeric measurement / time series，用來觀察 rate、latency、error、resource / business quantities 等。

### Trace
描述一個 request / transaction / workflow 在多個 operations / spans 間路徑與時間關係的 telemetry。

### Correlation ID / operation identity
把跨 component evidence 關聯到同一 logical flow 的 identifier。trace ID、job ID、business operation ID 可能是不同層次。

### Observability
透過系統輸出的 signals 理解其 internal state / behavior 的能力。本課程聚焦 logs / metrics / traces 與 business evidence，不把「安裝 APM」等同 observability 完成。

## Classic teaching case A — Order / Payment

Requirement：

- order 成立時必須有唯一 order ID；
- payment outcome unknown 時不能把 order 顯示為 fully paid；
- unauthorized actor 不得修改他人 order。

Learner 要建立：

- pre-production cases：normal payment、duplicate request、provider timeout、unauthorized update；
- production evidence：order state transition、payment operation identity、dependency latency / errors、authorization denial；
- correlation：order ID ≠ trace ID ≠ payment operation ID，但需要可安全關聯。

問題：

「API 回 200」能證明哪些事情？不能證明哪些？

## Classic comparison case B — Distributed Job Processing

Flow：

upload → queue → worker → artifact store。

觀察：

- API 202 only proves accepted semantics；
- queue depth / age 告訴 backlog；
- worker logs 告訴 execution events；
- trace / job correlation 連起 enqueue → consume → artifact；
- artifact state / validation 才能證明 business output exists。

用來對比 synchronous request 的 evidence 不足以描述 background work。

## Transfer target — Case tracking validation chain

Synthetic requirement：

「required information 未完成時，案件不得進入下一階段。」

Learner 應建立 evidence chain：

- behavior / acceptance scenario；
- backend transition rule；
- automated test cases；
- API / E2E checks；
- production state-transition log / metric；
- unauthorized / bypass attempt；
- audit evidence。

不要求把所有驗證做成 E2E，也不假設 CI passing = production guarantee。

## Misconceptions and boundary cases

### M1. 「測試全綠 = 系統正確」
修正：tests 有 scope / fixtures / environment；它們是重要 evidence，不是所有未知情況的 proof。

### M2. 「E2E 越多越可靠」
修正：E2E 可以覆蓋完整 flow，但較慢、failure localization 較差、environment dependencies 較多；需要多層 verification strategy。

### M3. 「有 logs 就有 observability」
修正：isolated logs 若無結構、identity、metrics / trace / business state，仍可能無法回答問題。

### M4. 「trace 是真相」
修正：trace 是 instrumentation 產生的 evidence；sampling、missing instrumentation、clock / propagation 等都有限制。

### M5. 「監控正常 = requirement 都成立」
修正：monitoring 只看已定義 signals；未量測或未定義的 behavior 仍可能錯。

### M6. 「把所有資料都 log 下來最容易 debug」
修正：增加 privacy / security / storage / access risk；只記錄必要 evidence。

### M7. 「AI judge 可以取代 acceptance criteria」
修正：AI evaluation 可以支援語意品質判斷，但標準仍要來自 requirement，且模型評估本身需要 calibration / evidence。一般 System Design 核心不要求使用 LLM judge。

## Transferable principle

> **先問「我要證明哪個 requirement？」再決定 test、log、metric 或 trace。Evidence 的價值來自它能回答具體問題；觀測資料本身不會替系統定義成功。**

## Claim-level source mapping

| Claim | Source | Status |
| --- | --- | --- |
| traces / metrics / logs 的 telemetry model | OpenTelemetry docs / specification | primary source; review pending |
| observability / operational metrics / structured logging / tracing 應納入 architecture | Azure Design for operations | official source; reviewed at Unit 1, deeper review pending |
| operational excellence uses observability / feedback / continuous improvement | AWS Well-Architected Operational Excellence | official source; reviewed Unit 1 |
| security / privacy of telemetry | OpenTelemetry security guidance + OWASP logging guidance to validate | pending |
| test scope / test pyramid-like strategy | Google Testing Blog / Martin Fowler / official framework-neutral sources to validate | pending; taxonomy intentionally non-normative |
| BDD / acceptance examples | Cucumber official docs | reviewed Unit 1 |
| legacy evidence lessons | existing course | reusable content, not authority |
| Order / Job / case tracking | synthetic teaching cases | assumptions explicit |

## Sources for Content Review

- OpenTelemetry documentation / specification — traces, metrics, logs
- Azure Architecture Center — Design for operations
- AWS Well-Architected — Operational Excellence
- OWASP Logging Cheat Sheet
- Cucumber BDD / Examples
- suitable primary / authoritative software testing source for test-scope claims

## Content Review — 2026-09-25

### Result: PASS

Unit 6 的 requirement → mechanism → verification → production evidence → feedback loop 通過內容審查。

### Validation decisions

1. **OpenTelemetry 作 vendor-neutral telemetry terminology source。** Traces 表示 request / operation 經過 distributed system 的 path；metrics 是 runtime measurements；logs 是 event records。Canonical Content 不綁定任何 APM UI。
2. **Testing taxonomy 保持 scope-based。** 不宣稱 unit / component / integration / E2E 在所有團隊都有唯一名稱或固定大小；教學重點是 test 穿過哪些 boundaries、使用哪些 real / fake dependencies、還有哪些 behavior 未被涵蓋。
3. **Passing tests 的 claim 保持 evidence scope。** Test result 支持「在指定 code / config / environment / fixtures / assertions 下觀察到的 behavior」；不提升成 production correctness proof。
4. **Telemetry security / privacy 進核心。** OWASP logging guidance 明確警告 access tokens、passwords、sensitive PII、secrets 等不應直接記錄，並要求 log access / transport / storage protection。Canonical Content 的 minimization / redaction / access / retention 方向成立。
5. **Observability 與 acceptance 分工成立。** OpenTelemetry 定義 signals；Azure / AWS operational guidance 支持使用 telemetry 理解 system behavior。是否「好／壞」仍由 requirement / target / business rule 決定。
6. **SLI / SLO 暫不成為 Unit 6 核心術語。** v0.1 只使用 measurable target / acceptance；若後續需要 reliability objective，另加入 Google SRE 等一手來源。
7. **CI 不等於 verification。** CI 可以執行 tests / static checks / builds，但 evidence 的意義來自具體 check；Unit 8 再處理 CI/CD pipeline。
8. **AI judge 保持 optional。** 一般 System Design verification 不要求 LLM evaluation；若語意品質需要模型協助，仍需 criteria / calibration / human evidence，不能取代 requirement。

### Remaining non-blocking work

- Storyboard 若視覺化 logs / metrics / traces，要用同一 synthetic operation 讓 learner 看見三種 signal 的不同問題，而不是三張工具 dashboard。
- 若加入 distributed tracing sampling / context propagation 的細節，需再引用 OpenTelemetry specification 對應章節。
- Unit 8 需要把 test / verification evidence 接到 build → artifact → deploy → rollout / rollback。
