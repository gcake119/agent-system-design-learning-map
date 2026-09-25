# Unit 3 Canonical Content v0.1 — 讓資料與狀態在併發下仍然正確

> 狀態：Canonical Content v0.1 方向已由使用者確認（2026-09-25）；待 subject-matter Content Review。
> 本文件定義 Unit 3 必須正確傳達的 instructional meaning；不是 database tutorial、SQL 教學或 UI 規格。

## Central question

**兩個操作都根據「當時看起來正確」的資料做決定，為什麼最後仍可能產生不允許的狀態？系統要在哪裡維持資料規則？**

Unit 1 已定義 behavior / constraints，Unit 2 已定義 responsibility / ownership / contracts。Unit 3 把這些要求落到資料與 state：資料代表什麼、誰能改、哪些變化必須一起成立，以及 concurrent operations 如何互相干擾。

## Learning objectives

學完後，學習者應能：

1. 從 domain requirement 建立最小必要資料與 state model，指出 entity identity、authoritative state、derived / cached / projected data 與合法 state transitions。
2. 用 interleaving 推演兩個 concurrent operations 如何破壞 business rule，辨認「先讀再判斷再寫」的 race。
3. 說明 transaction 的 atomicity 與 isolation 分別在解什麼問題，並知道 transaction 本身不自動保證任意 business invariant。
4. 比較 database constraint、conditional / optimistic update、locking / serialization 等機制所保護的範圍與 trade-off，不把其中任何一個當通用答案。
5. 區分 authoritative write state 與可能暫時落後的 replica / cache / projection，依 requirement 判斷哪個 read path 可以容忍 stale data。
6. 面對 AI 建議「加 transaction / lock / Redis」時，能先要求它指出具體 race、保護的 invariant、transaction boundary 與失敗條件。

## Core claims

### C1. 先定義資料代表的業務狀態，再選 storage technology

資料模型不只是 table / collection schema。System Design 至少要說清楚：

- entity 如何識別；
- 哪些欄位／record 共同代表一個 business fact；
- 哪些 state transition 合法；
- 哪個 boundary 對 authoritative write 負責；
- 哪些資料是 derived projection、cache 或外部 copy；
- 哪些 rule 必須在 state change 時保持成立。

「使用 PostgreSQL / MongoDB」不能替代這些問題。

### C2. Concurrent correctness 要用 interleaving 推演，不靠「兩個 request 很接近」的直覺

典型 race：

```text
A read: seat available
B read: seat available
A write: booked
B write: booked
```

若 business rule 是「指定座位最多一個有效 booking」，兩個 request 各自看見合法舊狀態，合併結果卻可能違反規則。

因此教材必須讓學習者指出：

- 哪些 read 影響後續 decision；
- 哪些 write 互相衝突；
- rule 要在哪個 atomic / serialized decision point 被維持。

### C3. Transaction 的 atomicity 與 isolation 是不同問題

Atomicity 關心一組 transaction 內的操作是否作為一個單位 commit / abort；Isolation 關心 concurrent transactions 彼此可以觀察到什麼，以及執行結果允許哪些交錯效果。

教學不能把「有 transaction」當成「沒有 concurrency problem」。實際保證取決於 database semantics、isolation level、statements / constraints 與 application pattern。

PostgreSQL 例如提供 Read Committed、Repeatable Read、Serializable 等 isolation behavior；本課程只把它作為具體 implementation evidence，不把 PostgreSQL 行為泛化成所有 DB。

### C4. Database constraint 能把某些 invariant 放到 authoritative write path 上

如果 rule 可以表達為資料層 constraint，例如 key uniqueness，讓 authoritative database 在 write 時拒絕不合法狀態，通常比「client 先查一次」更接近真正的 enforcement point。

但：

- 不是所有 business rule 都能直接表達成單一 unique / check constraint；
- constraint 只保護它實際描述的範圍；
- application 仍需處理 conflict / error outcome；
- distributed resources / external effects 可能超出單一 database transaction。

### C5. Locking、conditional update、optimistic concurrency 都是在控制衝突，但機制與代價不同

本單元只建立概念層比較：

- **pessimistic locking / serialization**：先限制其他 conflicting operations，再修改；可能增加等待、deadlock / contention 等成本。
- **optimistic / conditional update**：先工作，到 commit / update 時確認版本或前置條件仍成立；衝突時拒絕或重試。
- **database constraint**：在 authoritative write 時檢查可表達的資料規則。
- **serializable execution / isolation**：讓 concurrent transactions 的結果符合該系統定義的 serializable guarantee；仍需正確 transaction boundary 與 error / retry handling。

選擇必須從 conflict frequency、latency、throughput、data model、database capability 與 failure behavior 推導。

### C6. 「Source of truth」不代表所有 read 都必須直接打 authoritative store

系統可以有 cache、read replica、search index、materialized view 或 projection。這些 copy 可以服務不同 read workload，但要明示：

- freshness / lag；
- invalidation / update mechanism；
- stale read 對 business decision 是否可接受；
- 哪些操作在 commit 前必須回 authoritative state / enforcement point 檢查。

例如「顯示剩餘座位」可以容忍短暫延遲，不代表「確認最後一個座位是否能賣」也能只相信 stale cache。這個差異取決於 booking requirement，不是 cache 的固定規則。

### C7. Consistency requirement 應按 business invariant / flow 描述，不先背 CAP slogan

Unit 3 的初學目標不是證明 CAP theorem，而是能說：

- 哪個 decision 需要看到什麼 state；
- 多久的 stale data 可以接受；
- conflicting writes 怎麼被發現／阻止；
- 哪個結果可以稍後同步；
- 如果不同 copy 暫時不同，使用者會看到什麼。

Replication、distributed consensus、CAP 的深入機制列為延伸；必要時由 DDIA / MIT 6.5840 提供後續原理來源。

## Reasoning chain

```text
business rule / invariant
  ↓
authoritative state + legal transitions
  ↓
identify read → decide → write path
  ↓
interleave concurrent operations
  ↓
find conflict / invalid state
  ↓
choose enforcement mechanism + boundary
  ↓
define conflict / stale / retry outcome
  ↓
verify the invariant under the stated scope
```

## Required terminology

### State
系統在某個時間點用來描述 domain / workflow 的資料。不是所有 transient variables 都是本課程所說的 business state。

### Entity identity
讓系統知道兩筆操作是否在談同一個 domain object / resource 的識別方式。

### Authoritative state / source of truth
對指定 business decision 具有最終寫入／判定權責的 state。此詞必須帶 scope；大型系統可能對不同 facts 有不同 authorities。

### Derived / projected state
由其他 authoritative data 計算、同步或索引而來，用於特定 read / reporting workload 的資料。

### Transaction
資料系統提供的一組操作邊界；其 atomicity、isolation、durability 等實際語意依系統而定。本課程不把「transaction」當跨所有 external systems 的全域原子操作。

### Isolation
concurrent transactions 彼此可觀察與干擾的規則／保證。

### Race condition
結果依賴 concurrent operations 不受控制的時序／interleaving，可能使要求的 rule 被破壞。

### Constraint
由資料系統在 write path 上 enforcement 的資料規則。不要與 Unit 1 的 general architecture constraint 混淆；畫面文案需加上下文，例如 database constraint。

### Stale read
讀到不是 authoritative state 最新版本的資料。是否錯誤取決於該 flow 的 freshness requirement。

## Classic teaching case A — Ticket Booking

### Explicit synthetic assumptions

- 每張 ticket 對應一個指定 seat。
- 一個 event 內，同一 seat 同時最多只能有一個 **confirmed booking**。
- Unit 3 暫不處理 payment hold timeout；先只處理 confirmed booking 的 concurrency。
- 所有 create-booking writes 最終進入同一 authoritative booking store；跨 region / partition 的深入問題不在本單元。

### Failure demonstration

Naive design：

1. query seat: no confirmed booking；
2. application decides available；
3. insert booking。

兩個 request 可同時通過 step 1。

學習者應比較：

- unique data constraint / conditional insert；
- transaction + appropriate isolation / locking；
- optimistic version / conditional write；

並回答每種方案「到底保護哪個 rule、conflict 時 caller 收到什麼」。

不要求選出唯一最佳方案；實際方案取決於 data model、DB capability 與 booking workflow。

## Classic comparison case B — Payment / Ledger

### Purpose

顯示「資料正確」不只等於 uniqueness。

Synthetic assumptions：

- 每個 payment request 有 stable operation identity；
- payment lifecycle 有 explicit states；
- accounting / ledger records 需要可追溯，不以覆寫最終 balance 取代所有交易歷史；
- external payment provider 的 effect 不屬於單一 local DB transaction。

Unit 3 聚焦：

- payment / ledger 的 state 與 identity；
- 哪些 local writes 必須一起成立；
- balance projection 與 transaction records 的關係；
- duplicate external effect / reconciliation 留 Unit 5。

這個案例避免讓學習者以為「所有 correctness 都是一個 unique index」。

## Transfer targets

### Transfer A — Sim-sik-style therapist + room booking

只給 synthetic requirement：

「一次 appointment 需要一位 therapist 和一個 room；兩者都可能有其他 booking。」

學習者需辨認：

- therapist availability 與 room availability 是不同 resources；
- appointment 成立時需要維持哪些 cross-resource rules；
- 哪份 state 是 authoritative，Calendar / Sheet 若存在可能只是 projection / integration；
- concurrent create / cancel 如何交錯；
- 若資料分散到不同 authorities，單一 DB transaction 的假設是否仍成立。

不要求在 Unit 3 解 external calendar sync failure；留 Unit 4–5。

### Transfer B — Case workflow state

Synthetic case：

「案件只有在 required information complete 時才能從 review 進到 inspection。」

學習者需辨認：

- UI disabled 不是 state transition enforcement；
- backend / authoritative write path 要維持 transition rule；
- 兩個 actor 同時修改 required fields / state 時要推演 concurrency；
- audit / observability 留 Unit 6。

## Misconceptions and boundary cases

### M1. 「用了 transaction 就不會 race」
修正：transaction boundary、isolation semantics、statements、constraints 與 application logic 都會影響 guarantee。

### M2. 「先 SELECT 確認沒有，再 INSERT 就安全」
修正：若 read 與 write 之間沒有足夠 isolation / atomic enforcement，其他 concurrent operation 可以插入。

### M3. 「Redis lock 是 distributed concurrency 的標準答案」
修正：先確認 authoritative state、database capability、failure semantics 與要保護的 invariant；額外 lock service 本身也引入 failure / lease / ownership 問題。

### M4. 「source of truth = 所有讀取都只能查主 DB」
修正：read projection / cache 可以存在；關鍵是 freshness、authority 與 decision path。

### M5. 「eventual consistency = 最後一定會 magically 正確」
修正：需要明確的 update / reconciliation mechanism、conflict semantics 與 business tolerance。Unit 3 不用一句 eventual consistency 取代設計。

### M6. 「Serializable = 整個分散式系統 exactly once」
修正：database serializability 的 scope 是該資料系統／transactions 的 guarantee，不自動涵蓋 external API side effects、messages 或跨系統 effects。

### Boundary: low-contention internal tool
若 conflict 極少，optimistic conditional update + conflict handling 可能比長時間 lock 更簡單；但仍需維持 rule，不能因為「幾乎不會同時操作」就完全忽略 race。

## Transferable principle

> **資料正確性不是「選一個資料庫」；先說清楚哪個 state、哪條 rule、哪些 concurrent operations 會衝突，再把 enforcement 放到不能被競態繞過的 authoritative boundary。讀取副本可以很多，但關鍵寫入與決策必須知道自己依賴哪個 authority。**

## Claim-level source mapping

| Claim | Source | Status |
| --- | --- | --- |
| PostgreSQL isolation levels 與 concurrent phenomena / serialization behavior | PostgreSQL Transaction Isolation docs | primary implementation source; verify exact version in review |
| transaction / isolation / concurrency 的一般模型 | DDIA (Transactions chapter) | selected source; exact edition / pages pending |
| replication / stale data / consistency trade-offs | DDIA (Replication chapters) | selected source; exact edition / pages pending |
| distributed systems / consistency principles | MIT 6.5840 readings / lectures | validation source; exact lecture/readings pending |
| cache / projection 可能是 authoritative data 的 copy，freshness / invalidation 有 trade-offs | ByteByteGo archive + Azure Cache-Aside | supporting source; exact claim review pending |
| Ticket / Payment / transfer scenarios | synthetic teaching cases | instructor-created; assumptions explicitly stated |

## Sources for Content Review

- PostgreSQL current docs — Transaction Isolation
- Martin Kleppmann, Designing Data-Intensive Applications — Transactions / Replication (edition and pages to pin)
- MIT 6.5840 — relevant transaction / consistency readings (to pin)
- Azure Architecture Center — Cache-Aside pattern
- User-provided ByteByteGo archive — database / cache / system design sections

## Pending validation before Content Review passes

1. 固定 DDIA 版本與可取得的實際章節／頁碼；若無法取得全文，不用二手摘要替代原書主張。
2. 以 PostgreSQL 官方文件核實 Read Committed / Repeatable Read / Serializable 的表述，避免把 PostgreSQL implementation 說成 SQL / all databases universal behavior。
3. 核對「constraint / optimistic / locking / serializable」比較是否保持概念層，不誤導成互斥選項；實務方案可以組合。
4. Payment case 的 ledger 說明需要支付／會計系統來源支持；若無足夠來源，Content Review 時縮減到 operation identity + state，不教 ledger architecture。
5. 檢查 cache / stale read example：顯示 availability 是否能 stale 是 synthetic business assumption，不能泛化成所有 booking system。
6. Unit 3 不提前解 Unit 5 的 duplicate external effects / exactly-once claims。
