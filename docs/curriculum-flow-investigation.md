# System Design Learning Map：Flow Investigation Curriculum v0.3

> 日期：2026-09-30
> 狀態：**CONFIRMED — 進入 Canonical Content / Interaction / Implementation**
> 使用者已確認可依本文件實作；Human Learning Review 留到實際開始學習後進行。

> 2026-10-02 更新：本文件保留 9/30 確認的 outcome 與順序。實際 v0.4 baseline／scope／單元內容以 `curriculum-proposal.md` 為準；下列進階名詞清單不是本次 Learn now 的授權範圍。

## 1. Highest-level capability

面對 Web / SaaS 系統中的真實問題，學習者能從使用者可見現象開始，建立 request flow / data flow，沿各層 input / output 與 evidence 找到第一個開始不正常的節點，區分 symptom / direct cause / root cause，理解原設計 trade-off，提出可驗證修改，並以 tests / logs / metrics / traces / browser tools / business state 驗證結果。

全課共同推理鏈：

```text
使用者看到的現象
→ 正常 flow
→ 實際 flow
→ evidence
→ 第一個異常節點
→ input / output
→ symptom / direct cause / root cause
→ design trade-off
→ modification
→ cross-layer impact
→ verification
```

「找第一個壞掉的節點」是全課反覆使用的 reasoning primitive。

## 2. Capability tree

### A. 建立系統心智模型
Browser / HTTP / request-response / frontend state / API / backend / database / cache / queue / external service / infrastructure。

每一層只先要求理解：
- 負責什麼
- input
- output
- common failure modes

### B. 觀察系統
UI state / browser console / network request / status code / payload / response / backend log / DB query / latency / cache hit-miss / queue backlog / error rate / trace / business state。

### C. 跨層追蹤問題

```text
這層 input 正常嗎？
├─ NO → 往上游追
└─ YES
   ↓
這層 output 正常嗎？
├─ NO → 第一個異常點很可能在這層
└─ YES → 繼續往下游追
```

### D. 系統設計判斷
scalability / availability / consistency / latency / throughput / caching / async / queue / replication / partitioning / rate limiting / failure handling / retry / circuit breaker / idempotency / CDN。

每個概念都必須回答：
1. 它解決哪種問題？
2. 複雜度轉移到哪裡？
3. 出問題時哪裡有 evidence？

## 3. Unit 1–8

### Unit 1｜一個按鈕到底發生了什麼
Teaching case：儲存表單。
Flow：User click → frontend event → request → API → backend → DB → response → frontend state → UI。
目標：建立完整 request / data flow 心智模型。

### Unit 2｜問題到底壞在哪一層
Teaching case：「按儲存沒有反應」。
逐層檢查 click / request / status / backend / DB write / response / render。
目標：建立 first bad node debugging method。

### Unit 3｜系統為什麼會變慢
Teaching case：頁面載入變慢。
可能來源：frontend / network / API / slow query / N+1 / cache miss / third-party / server load。
目標：理解 latency 沿 critical path 累積。

### Unit 4｜為什麼要 Cache
Teaching case：同一份資料被大量重複讀。
先看 no cache → DB load，再加入 cache hit/miss/stale/invalidation/stampede。
目標：理解 cache 是 problem-driven trade-off。

### Unit 5｜為什麼要 Queue
Teaching case：PDF processing 30 秒。
同步 → enqueue → worker → result，再加入 retry / duplicate / failed job / backlog。
目標：理解 request completion 與 business completion 分離。

### Unit 6｜資料一致性問題
Teaching case：「畫面顯示成功，另一頁仍是舊資料」。
追 frontend state → cache → DB → replica → async projection。
目標：把 consistency 放回實際 data flow。

### Unit 7｜系統出錯時怎麼知道
以 logs / metrics / traces / business state 回答「這一層壞了，需要什麼 evidence？」
目標：建立 evidence selection 與 evidence scope。

### Unit 8｜完整系統設計
Integrated Web / SaaS system。
User action → flow → bottleneck → failure point → evidence → design decision → trade-off → verification。
不顯示 chapter/pattern hint。

## 4. Prerequisites

```text
Unit 1
↓
Unit 2
↓
Unit 3
├→ Unit 4
└→ Unit 5
    ↓
Unit 6
↓
Unit 7
↓
Unit 8
```

Observability / testing / failure reasoning 從 Unit 2 起反覆出現，Unit 7 再正式統整。

## 5. 全課固定 11 問

1. 使用者看到什麼現象？
2. 正常 flow 是什麼？
3. 哪一層第一次出現異常？
4. 這一層 input 正常嗎？
5. 這一層 output 正常嗎？
6. 有什麼 evidence？
7. direct cause 是什麼？
8. root cause 可能是什麼？
9. 可以在哪一層修？
10. 修正會帶來什麼 trade-off？
11. 如何驗證真的修好了？

Progressive disclosure：
- Unit 1：1–2
- Unit 2：1–8
- Unit 3–6：1–10
- Unit 7–8：完整 1–11

## 6. Canonical teaching cases

| Unit | Teaching case |
| --- | --- |
| 1 | 儲存表單 |
| 2 | 儲存表單失敗 |
| 3 | 頁面讀取 |
| 4 | 熱門內容重複讀取 |
| 5 | PDF / media processing |
| 6 | 更新後看到舊資料 |
| 7 | notification / background-job incident |
| 8 | booking / file-processing / notification integrated system |

Reusable cases：URL shortener / notification / feed / image upload / booking / payment。

## 7. Transfer cases

只給 requirement / state / constraint / failure / measurement / evidence，不提示 pattern。

- 諮商預約系統
- 案件追蹤系統
- 文件處理流程
- AI agent workflow

私人／熟悉專案只作 transfer，不作主要 teaching case。

## 8. AI role

AI 只作 reasoning collaborator：
- 產 hypotheses
- 解讀 logs / metrics
- 建議 inspection point
- 產 test
- 比較 design options

Learner 保留：
- problem definition
- flow model
- evidence relevance judgment
- trade-off judgment
- final decision

## 9. Existing curriculum disposition

保留 subject matter：request/data flow、boundary、authoritative state、concurrency、async、queue、failure、retry、idempotency、observability、performance、cache、compatibility、deployment basics、trade-off、evidence validation。

重寫：
- Unit responsibilities
- Unit 1–2
- observability progression
- cache / queue entry point
- performance framing
- final integrated transfer

降級為 extension：
- microservice decomposition 深入內容
- deployment-strategy taxonomy
- CI/CD taxonomy
- detailed rollout patterns
- partitioning / replication algorithms
- multi-region architecture

刪除教法：
- 以名詞作 chapter navigation
- checklist-driven topic coverage
- 沒有 symptom 的 pattern introduction
- 選 component 型 quiz
- 以元件數量代表架構成熟度

## 10. Human Learning Review focus

實際開始學習後檢查：
- 能否自行重建 flow
- 是否先找 first bad node 而非猜答案
- 是否知道下一份 evidence 為何值得看
- 是否理解 evidence 能／不能支持什麼
- 是否區分 symptom / direct cause / root cause
- 是否能跨 domain transfer
- 是否能說明 mechanism 解什麼問題、複雜度移到哪裡、如何觀察 failure
- 修改後是否能推演 cross-layer impact
- 是否能提出 verification chain

特別風險：
- flow animation 看懂但無法自己重畫
- debugging 變成機械式逐節點巡覽
- first bad node 被誤認為 root cause
- 課程被學成 debugging 而失去 design trade-off
- evidence surface 過密

## 11. Locked interaction direction

新版主要 learning surface：

```text
persistent architecture
+ request/data flow tracing
+ node evidence inspection
+ failure injection
+ parameter → consequence
+ focused metrics
+ trade-off panel
```

目前上線版「太單調、太抽象」已記為 generalizable Learning UX finding。

新版不得只用：
- 選答案
- 靜態文字卡
- 裝飾動畫

必須讓 learner 操作系統並看見 state / path / evidence / quantity / trade-off 真正改變。
