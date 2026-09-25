# Interaction Redesign v0.2 — Simulator-linked Learning

> 日期：2026-09-26
> 狀態：**重大互動方向修正**
> 來源：使用者回饋 + `gcake119/system-design-simulator`
> 影響：取代 `docs/interaction-storyboard.md` 中「選項 → 文字 feedback」作為主要互動機制的做法。

## 為什麼要重做

目前 v2 第一版大多是：

```text
情境文字
→ 選一個判斷
→ 顯示 feedback
→ 揭露術語
```

這種方式可以檢查概念，但**看不到一個設計選擇如何改變系統本身**。對 System Design 來說不夠。

`system-design-simulator` 值得參考的不是「拖拉元件」本身，而是它把：

- 架構元件；
- 連線；
- traffic；
- component capacity；
- node utilization；
- latency；
- bottleneck；
- async edge；
- trade-off

放進同一個可運算模型。Learner 改一個元件或參數，整個系統的結果跟著改。

新版課程應採同一個核心思路：

> **情境不是答案題，而是 simulator 的輸入條件。學習者改 workload、state、元件或 policy，然後觀察整個系統哪些地方跟著變。**

## 新的 teaching loop

```text
固定一個可見系統
        ↓
注入一個 scenario / constraint
        ↓
learner 改參數／元件／連線／policy
        ↓
simulation 重算
        ↓
架構圖 + state + metrics 一起改變
        ↓
highlight consequence / bottleneck / invariant break
        ↓
再解釋「為什麼」
        ↓
改另一個 constraint，重新跑
```

這比「按選項看文字答案」更符合 learning-map 的 observation → manipulation → consequence → concept。

## Simulator 的互動元素如何轉成教材

### 1. Architecture Canvas

每個 lesson 不是空白畫布，而是載入一個**最小可理解系統**。

例如 booking：

```text
Client
  ↓
App
  ↓
Booking DB
```

Learner 可以在限定範圍內：

- 開／關一個元件；
- 增加 replicas；
- 加 cache / queue / constraint / worker；
- 把 edge 改同步／非同步；
- 改 responsibility owner；
- 改 authoritative state；
- 改 retry policy；
- 改 rollout percentage。

不是提供完整 35-component palette；只提供該單元真正需要比較的 controls。

### 2. Scenario Controls

一個 scenario 必須對 simulation model 有實際參數：

- requests/sec；
- concurrent writers；
- resource capacity；
- service latency；
- failure rate；
- queue service rate；
- cache hit / freshness；
- retry count；
- worker count；
- version mix；
- rollout percentage。

例如 Unit 7 的「流量十倍」不能只改文案，要真的把 offered load 從 1k → 10k → 100k，讓 utilization / latency / bottleneck 改變。

### 3. System Metrics

參考 simulator 的 MetricsDisplay，但教材只呈現當下學習需要的 metrics。

可能包括：

- incoming QPS；
- utilization；
- latency；
- queue depth / age；
- success / conflict count；
- duplicate effects；
- stale reads；
- failed transitions；
- version incompatibility count；
- affected users / blast radius。

不在所有章固定顯示 QPS / latency。

### 4. Consequence Layer

Simulation 之後要直接在系統圖上標：

- 哪個 node 飽和；
- 哪條 edge 讓 user latency 增加；
- 哪個 write conflict 被拒絕；
- 哪筆 duplicate effect 發生；
- 哪個 stage backlog 堆積；
- 哪個 old consumer 讀不懂 new status。

這一層是目前課程最缺少的。

### 5. Trade-off Panel

參考 simulator 的 TradeoffCards，但不做百科。

只顯示 learner 剛做的 change：

> 加 Cache

結果：
- DB QPS ↓
- read latency ↓
- stale window ↑
- operational complexity ↑

然後問：

> 這個 workload 值得這個 trade-off 嗎？

## 八個 Unit 的 simulator 化方式

### Unit 1 — 需求會改變什麼設計？

不是單純選「該問什麼」。

Canvas 固定 booking system。

Scenario controls：
- seat model：assigned / general admission；
- peak traffic：normal / flash sale；
- hold required：yes / no；
- cancellation allowed：yes / no。

Learner 改 requirement，右側顯示「設計問題清單」如何改變：
- concurrency importance；
- state machine complexity；
- capacity concern；
- authorization concern。

這章 simulator 不需要跑 performance，只需要讓 requirement → design concerns 可見。

### Unit 2 — Boundary 改變 coupling / trust / deploy cost

同一 Order System 有兩種 boundary layout：

- modular monolith；
- multiple services。

Learner 可以拖 responsibility 到不同 boundary。

System model 即時顯示：
- cross-boundary calls；
- shared writes；
- trust crossings；
- independent deploy units；
- coordination points。

目標不是算分，而是看到「切一刀」會新增什麼。

### Unit 3 — Concurrency Simulator

Booking state：

- capacity = 1；
- concurrent writers = 1 / 2 / 5；
- protection = none / unique constraint / optimistic conditional write / lock。

Run 後顯示：
- successful bookings；
- rejected conflicts；
- invalid double-bookings；
- waiting time。

Learner 改 protection mechanism，直接看到 invariant 是否被破壞。

### Unit 4 — Async / Queue Simulator

Notification / media pipeline：

controls：
- arrival rate；
- worker rate；
- worker count；
- edge sync / async；
- queue enabled / disabled。

metrics：
- user-facing latency；
- queue depth；
- queue age；
- processed/sec；
- rejected work。

Learner 把通知從 sync 改 async，應看到：
- order request latency ↓；
- completion latency未必↓；
- backlog可能↑。

### Unit 5 — Failure / Retry Simulator

Payment / external provider：

controls：
- provider failure / timeout rate；
- retries；
- idempotency on/off；
- retry backoff；
- verification before retry on/off。

metrics：
- successful logical operations；
- total attempts；
- duplicate effects；
- unknown outcomes；
- provider load。

Learner 把 retries 從 0 → 3，若 idempotency off，duplicate effect 應上升。

### Unit 6 — Evidence Simulator

同一 distributed job run，讓 learner 切換：

- log view；
- metric view；
- trace view；
- business-state view。

Scenario 注入一個 failure，例如 worker crash。

不同 view 顯示不同 evidence，不能只換文字：
- log：離散事件；
- metric：error spike / queue age；
- trace：哪一段斷掉；
- business state：artifact absent / job unknown。

Learner 要用 signals 拼出 conclusion。

### Unit 7 — Workload / Bottleneck Simulator

最接近 SystemForge。

給三個 preset：
- News Feed；
- Video Delivery；
- URL Shortener。

controls：
- requests/sec；
- object size；
- cache hit；
- replicas；
- worker count。

metrics：
- node utilization；
- throughput；
- total / critical-path latency；
- bandwidth；
- bottleneck。

Learner 加 cache / CDN / replica 時，整條 architecture metrics 重算。

### Unit 8 — Deployment / Compatibility Simulator

Timeline + architecture：

controls：
- old/new version ratio；
- schema version；
- deploy strategy；
- rollout %；
- compatibility on/off。

Simulation 顯示：
- incompatible requests；
- affected traffic %；
- migration completion；
- rollback-safe / unsafe state。

Learner 把 rollout 從 10% → 100%，如果 old frontend 不支援 new enum，affected users 會跟著放大。

## Transfer 練習

Transfer 也必須沿用同一 simulation primitives，但拿掉概念標籤。

例如 Podcast transfer：

Learner 只看到：
- media size；
- downloads；
- writes；
- origin bandwidth；
- CDN on/off；
- DB QPS。

不提示「這是 cache / CDN 題」。

Final transfer 會共用：

- state / invariant simulator；
- queue / worker simulator；
- failure / retry simulator；
- deployment mix simulator。

## Implementation Architecture v0.2

建議建立一層教材專用 simulation engine，而不是直接移植 SystemForge：

```text
learning/v2/
  sim/
    engine.mjs
    models/
      capacity.mjs
      concurrency.mjs
      queue.mjs
      failure.mjs
      evidence.mjs
      rollout.mjs
    scenarios.mjs
  components/
    ArchitectureCanvas.vue
    ScenarioControls.vue
    MetricStrip.vue
    ConsequenceOverlay.vue
    TradeoffPanel.vue
```

### Engine 要求

- pure functions；
- deterministic；
- synthetic assumptions；
- 每個 output 可測試；
- 不追求 production-grade simulator；
- 一個模型只模擬該 lesson 需要理解的關係；
- 不假裝模擬真實 AWS / Redis / Kafka benchmark。

## 與 SystemForge 的差別

不採用：

- interview scoring；
- 35-component 自由組裝 palette；
- 「Architect Level」分數；
- 直接複製 production benchmark 數字；
- 大型 unrestricted canvas。

採用：

- system graph 是 learning surface；
- 改 component / parameter 會重算；
- per-node metrics；
- bottleneck highlight；
- async edge 對 user latency 的差異；
- trade-off consequence；
- scenario-driven simulation。

## Current v2 implementation disposition

目前 `learning-map-v2` branch 的 Unit 1–8 選項式 UI 視為 **prototype / content wiring**。

保留：
- course structure；
- learning copy；
- routes；
- transfer cases；
- term definitions。

重做：
- StageRenderer；
- lesson interaction；
- metrics；
- system diagram；
- consequence visualization。

下一步不應繼續 polish 現在的 option-card UI。先建立 simulator primitives，再從 Unit 3 / Unit 7 做兩個 reference lessons，驗證新的 interaction model。
