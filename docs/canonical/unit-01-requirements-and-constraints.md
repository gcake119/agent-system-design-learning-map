# Unit 1 Canonical Content v0.1 — 從工作情境定義行為與限制

> 狀態：Canonical Content v0.1 已由使用者確認（2026-09-25）；待 subject-matter Content Review。
> 本文件定義 Unit 1 必須保留的 instructional meaning；不是投影片文案，也不指定互動形式。

## Central question

**使用者說「系統要能做到 X」，還缺哪些資訊才能開始做有依據的 System Design？**

本單元要建立的第一個習慣不是畫架構，而是先把模糊需求轉成可以討論、舉例、驗證與追問的行為、規則、限制與未知事項。

## Learning objectives

學完後，學習者應能：

1. 把模糊需求整理為角色、前提／情境、事件／操作與可觀察結果，區分已確認規則、具體例子、假設與待釐清問題。
2. 從正常、邊界、併發與未授權情境中找出可能被破壞的業務規則／不變條件，並指出哪些規則需要 domain stakeholder 確認。
3. 區分 functional behavior 與 quality / operational constraints，提出 System Design 所需的 workload、latency、availability / recovery、data sensitivity、cost、operational capacity 等問題。
4. 面對 AI 產生的「完整架構」時，能先檢查其需求與假設是否有來源，而不是因為圖看起來合理就接受。

## Core claims

### C1. System Design 從需求與限制開始，不從元件清單開始

架構決策必須能追溯到要支援的使用情境、業務規則、品質要求與已知限制。沒有這些條件時，cache、queue、microservice、replication 等都只能是候選技術，不能被宣稱為必要答案。

教學上要讓學習者先回答：

- 誰在什麼情境下要完成什麼工作？
- 成功時外部可以觀察到什麼？
- 哪些結果不可接受？
- 有哪些規則不能被破壞？
- 使用量與時間要求大概是什麼？
- 哪些資料或操作具有安全／隱私風險？
- 系統失效時，業務能容忍什麼？
- 哪些資訊現在不知道？

### C2. 具體例子是探索規則的工具，不是規則本身

具體情境可以暴露模糊處、例外與互相衝突的理解。Example Mapping 把 story、rules、examples、questions 分開記錄；其價值在於協作澄清 scope 和 acceptance criteria。

例如「使用者可以預約時段」不足以直接推出「同一時段只能有一筆預約」。後者只有在 domain 確認該資源容量為一、不能重疊等條件後，才是本案例的規則。

因此教材不能把教學案例中的 booking rule 泛化成所有預約系統。

### C3. 可觀察行為先描述業務結果，不先塞入技術解法

好的需求例子應描述 domain 中的人、事件、日期、數量與結果，而不是預先寫成「Redis lock 成功」「Kafka event 已發出」。

技術機制屬於後續 System Design 的解法層。如果把技術寫進需求，學習者會失去比較不同方案的空間。

### C4. Functional requirement 與 quality / operational constraints 共同影響架構

「能建立預約」只描述功能的一部分。設計還需要知道：

- workload：平均／尖峰請求、資料量、成長；
- latency / responsiveness：哪些操作需要即時回應；
- availability / recovery：可以停多久、可以遺失多少資料、如何恢復；
- security / privacy：誰能讀／改哪些資料，哪些資料敏感；
- operability：誰部署、監控、處理事故，團隊能承擔多少運維複雜度；
- cost / complexity：哪些成本與額外元件是可接受的。

這些不是要求每個小系統都先填一張企業級 NFR 表，而是只追問會實際改變設計選擇的條件。

### C5. 「不知道」是合法的設計狀態；假設必須可見

早期需求不完整很正常。未確認的資訊應記成 question 或 explicit assumption，而不是讓設計者或 AI 默默補齊。

假設至少要能回答：

- 這是來源已確認的規則，還是暫時假設？
- 如果假設改變，哪些設計決策需要重新評估？
- 在做不可逆或高風險決策前，是否必須先求證？

### C6. Security 與 operations 從需求階段開始

安全不是最後才加上的 review checklist。需求階段就需要辨認 actor、資料敏感度、允許／禁止操作與 trust assumptions。

同樣地，可部署、可觀察、可恢復也不是「DevOps 之後再處理」。如果系統有 availability、incident response 或 audit 要求，這些會回頭影響 architecture。

### C7. AI 是需求探索協作者，不是需求來源

AI 可以：

- 從已有需求提出漏問的問題；
- 產生 boundary / failure / unauthorized examples；
- 將訪談或規格整理成 rules / examples / questions；
- 比較 constraint 改變時可能受影響的設計。

AI 不應：

- 把常見業界做法冒充成這個 domain 的已確認規則；
- 在沒有 workload evidence 時自行宣稱需要特定 scale architecture；
- 因為能產生完整架構圖就跳過需求求證。

學習者需要把 AI 產出的內容標成「來源已確認」「推論／假設」「待求證」。

## Reasoning chain

本單元建立以下 reusable chain：

```text
模糊需求
  ↓
actor / situation / action / observable outcome
  ↓
rules + concrete examples + open questions
  ↓
functional behavior + quality / operational constraints
  ↓
explicit assumptions
  ↓
system design questions
```

後續單元才回答這些 design questions 要用什麼 data model、boundary、workflow、failure handling、observability 與 deployment mechanism。

## Required terminology

### Functional behavior
系統在指定情境下需要提供的可觀察行為。不是 UI 控件清單，也不是內部實作方法。

### Business rule / invariant
在明確 scope 與條件下，系統／業務狀態必須維持的規則。本課程會使用 invariant 來幫助推演 concurrency 與 failure，但不把所有 acceptance criteria 都稱為 invariant。

### Constraint
限制可採方案或改變設計取捨的條件，例如 workload、延遲、資料敏感度、成本、法規或維運能力。

### Quality attribute / non-functional requirement
描述系統品質或運行特性的要求，例如 availability、latency、reliability、security、operability。名稱不是重點；要求需要盡可能具體，才能影響設計與後續驗證。

### Assumption
目前尚未由可靠來源確認、但暫時用來推進設計的條件。必須可見並可被推翻。

### Acceptance criteria
用來澄清某項需求何時符合預期的條件。它與後續自動測試相關，但不等於特定測試框架或 Gherkin 語法。

## Classic teaching case A — Ticket / Booking System

### Initial prompt

「使用者可以選擇場次並預訂座位。」

不要立即加入 database、lock、queue。

### Questions the case should expose

- 一張票是否對應指定座位，還是只限制場次總容量？
- 選座到付款之間是否需要暫時保留？多久？
- 兩個人同時選到最後一個座位時，業務期待什麼結果？
- 付款失敗／逾時後，座位何時釋放？
- 使用者是否可以替別人取消？
- 尖峰是否集中在開賣瞬間？
- 系統暫時無法服務時，業務影響是什麼？

### What Unit 1 stops before

本單元只確認這些問題會影響設計，**不在此單元教 transaction、lock、queue、cache 的答案**。這些機制留到 Unit 3–5、7。

## Classic comparison case B — URL Shortener

### Initial prompt

「輸入長網址，取得短網址；之後造訪短網址會導向原網址。」

與 Ticket Booking 對比：

- 核心 domain rule 較少，但 ID uniqueness、redirect behavior、expiry / deletion policy 仍需確認；
- read/write ratio 可能與 booking 完全不同；
- latency、traffic、abuse / unsafe URL、availability 可能比 concurrency on one scarce seat 更重要；
- 因此兩個系統不能因為都能畫成 client → API → DB 就使用相同設計優先順序。

本單元不需要把 URL Shortener 擴成完整面試解答。

## Transfer target — Sim-sik-style booking

Transfer 使用合成資料，參考心理師／場地預約型工作，不使用真實個案資料。

只給：

「個案可以預約心理師；系統同時需要處理心理師行程與場地。」

不提示 transaction、Calendar sync 或 source of truth。

學習者應提出類似：

- 心理師與場地是各自獨立資源嗎？
- 一次預約是否必須同時取得兩者？
- 哪些行程來源是 authoritative？
- 外部 Calendar 是業務資料來源、同步投影，還是通知／檢視層？
- 哪些角色可以建立、修改、取消？
- 哪些情況需要人工處理？
- 什麼才算預約成立？

Transfer 成功的標準不是問題清單與範例完全相同，而是能辨認「哪些未知條件會改變後續設計」。

## Misconceptions and boundary cases

### M1. 「System Design 就是先畫 high-level architecture」
修正：沒有需求、constraints 與假設，架構圖無法判斷是否適用。

### M2. 「NFR 都是越高越好」
修正：availability、latency、durability 等目標通常伴隨成本與複雜度；需要依 business need 決定。

### M3. 「BDD = Given / When / Then」
修正：BDD 重點包含透過協作與例子建立共同理解；Gherkin 是可能的表達／automation 工具，不是 BDD 全部。

### M4. 「example 就是 requirement」
修正：example 幫助理解 rule；單一例子未必定義完整規則。

### M5. 「AI 列出的 edge cases 就是需求」
修正：AI 可以提出候選問題；domain 規則仍需可靠來源或 stakeholder 確認。

### M6. 「一開始不知道數字就不能設計」
修正：可以用標明的估計／範圍推進，但要知道哪些決策對估計敏感，何時需要重新量測或求證。

### Boundary: prototype / very small internal tool
即使系統很小，也需要知道核心行為、資料與權限；但不需要為不存在的 scale 或 availability 需求提前增加分散式元件。

## Transferable principle

> **先把「要做什麼」變成有範圍、有例子、有約束、有未知事項的問題，再討論「系統怎麼做」。架構的複雜度必須能追溯到需求、風險或量測，而不是追溯到一張常見架構圖。**

## Claim-level source mapping

| Claim | Source | Status |
| --- | --- | --- |
| 具體例子可用來探索 domain；rules / examples / questions 應分開 | Cucumber Example Mapping | verified from official docs, 2026-09-25 |
| BDD 例子應具體並避免把技術細節寫成 domain example | Cucumber BDD Examples | verified from official docs, 2026-09-25 |
| architecture 應從 business needs 出發並平衡 functional / non-functional requirements | Azure Architecture Center — Build for business needs / Design Principles | verified from official docs, 2026-09-25 |
| operations 需求包含 deployment、monitoring、incident response；logging / tracing 應在設計時考慮 | Azure Architecture Center — Design for operations | verified from official docs, 2026-09-25 |
| security 應包含 least privilege、traceability、defense in depth、data protection | AWS Well-Architected — Security design principles | verified from official docs, 2026-09-25 |
| workload 應提供營運所需資訊並透過 feedback 持續改善 | AWS Well-Architected — Operational Excellence | verified from official docs, 2026-09-25 |
| System Design 教材需涵蓋 application / network / data / reliability / security-observability / infrastructure-deployment 等問題 | user-provided ByteByteGo archive — System Design Topic Map | source located; detailed content review pending |
| Ticket Booking 與 URL Shortener 的具體教學設定 | synthetic teaching cases | instructor-created; must remain internally consistent |

## Sources for Content Review

- Cucumber, Example Mapping: https://cucumber.io/docs/bdd/example-mapping/
- Cucumber, Examples: https://cucumber.io/docs/bdd/examples/
- Azure Architecture Center, Design principles: https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/
- Azure Architecture Center, Build for business needs: https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/build-for-business
- Azure Architecture Center, Design for operations: https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/design-for-operations
- AWS Well-Architected Framework, Security design principles: https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-design.html
- AWS Well-Architected Framework, Operational Excellence
- User-provided `Bytebytego_Big_Archive_System_Design_2025.pdf`

## Pending validation before Content Review passes

1. 固定 Azure Design Principles 實際引用頁與更新日期，避免只引用聚合頁。
2. 對 ByteByteGo archive 中 NFR / System Design Topic Map 的教學簡化做交叉檢查；它是 source-informed，不是唯一權威。
3. Canonical Content 若加入 SLA / SLO、RTO / RPO 的精確定義與量化方法，再增加 SRE / cloud reliability 的一手來源；v0.1 暫不教其公式與正式計算。
4. Unit 1 不提前教 transaction、locking、queue 等機制；若 Content Review 發現 prerequisite 不足，只補理解 Unit 1 所需的最小背景。
