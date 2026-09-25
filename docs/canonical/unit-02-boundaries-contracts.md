# Unit 2 Canonical Content v0.1 — 劃清系統邊界、責任與契約

> 狀態：Draft，待使用者確認與 Content Review。
> 本文件定義 Unit 2 必須正確傳達的 instructional meaning；不是 UI、互動或 API 設計規範。

## Central question

**一次操作經過哪些責任邊界？每一邊負責什麼、能看／能改什麼、對下一邊承諾什麼？**

Unit 1 已把需求、規則、constraints 與 assumptions 顯性化。Unit 2 不急著選 microservices，而是先建立「責任與契約」模型，再判斷哪些東西需要成為獨立 module / process / deployable service。

## Learning objectives

學完後，學習者應能：

1. 沿著一個 user / data / system flow，指出 client、application/domain logic、data store、external dependency 的責任與資料流。
2. 為關鍵互動描述輸入、輸出、錯誤、授權與版本／語意契約，避免 consumer 依賴 provider 的內部實作。
3. 區分邏輯模組、執行程序與可獨立部署服務；說明「拆得更細」不是預設目標。
4. 從 domain responsibility、data ownership、security boundary、change / deploy / scale needs 與 coordination cost 比較 boundary 選擇。
5. 面對 AI 產生的服務切分，能要求它說明每條 boundary 解決哪個 requirement，而不是接受「microservices best practice」作理由。

## Core claims

### C1. 先畫責任與 flow，再決定部署單位

一個架構圖上的 box 可能代表 domain responsibility、module、process、database、external system 或 deployable service；它們不是同一層概念。

教學時先問：

- 這一步的業務責任是什麼？
- 它需要哪些資料與權限？
- 誰可以改這份 state？
- 上游需要它承諾什麼？
- 失敗時誰負責處理？
- 它是否真的需要獨立部署／擴展／演進？

只有最後一組需求成立時，才進一步討論 service deployment boundary。

### C2. Service boundary 應由 domain 與 architecture requirements 導出，不由技術 layer 或組織圖直接決定

Azure 的 domain analysis guidance 明確建議 microservices 圍繞 business capabilities，而不是 data access / messaging 等 horizontal technical layers；同時也要求考慮 team、data、technology、scale、availability、security 等 nonfunctional factors。

本課程採用的較一般化原則是：

> **把會一起維持規則、共享語意與一起變更的責任先視為同一候選邊界，再用部署、擴展、安全、資料一致性與團隊需求檢查是否需要拆分。**

這不是宣稱 DDD 有一個機械公式能算出唯一正確 boundary。

### C3. API / message 是跨邊界契約，不應暴露不必要的內部實作

Consumer 應依賴 domain-level semantics，而不是 provider 的資料表形狀或內部類別。

契約至少要釐清：

- operation / event 的業務意義；
- required input 與 identity / authorization context；
- successful outcome；
- error / unknown outcome；
- compatibility / version expectation；
- 是否有 side effect，以及重複呼叫的語意（深入機制留 Unit 5、8）。

Unit 2 不把 REST 當唯一形式；HTTP API、message、file exchange 都可能是 contract。

### C4. Data ownership 與 source of truth 必須能說清楚

當多個 component 都能直接修改同一份資料時，責任與規則容易散落。

本單元要求學習者至少能回答：

- 哪個責任邊界擁有修改這份 business state 的規則？
- 其他 component 取得的是 authoritative state、projection、cache 還是外部 copy？
- 誰可以寫入？
- 同步失敗時，哪一份資料仍然決定業務結果？

「每個 microservice 一個 database」不是本單元的通用答案；是否拆 service 尚未決定。重點是 ownership 與 write authority 清楚。

### C5. Authentication 與 authorization 不能只靠 client UI

Client 可以隱藏按鈕改善 UX，但真正的授權邊界必須由可信任的 server / service side enforcement 支持。

需求與契約應攜帶足夠的 actor / tenant / permission context，讓負責修改 state 的 component 能判斷是否允許操作。

Unit 2 只建立 trust boundary 與責任；OAuth、JWT、RBAC 等具體方案不是本單元主題。

### C6. Microservices 有真實收益，也增加 distributed-system complexity

獨立部署、獨立擴展、fault isolation、team autonomy 等可能是拆分理由；代價包括 interservice communication、data consistency、transaction management、testing、deployment / monitoring complexity。

因此：

> **Monolith / modular monolith 不是「尚未進化」；microservices 也不是 System Design 成熟度分數。**

對小型或高度耦合 workload，保持較少 deployment units 可能更符合需求。

### C7. Boundary 是可演進的設計，不是一次永久決定

需求、流量、團隊 ownership 或安全要求改變後，原 boundary 可能需要合併或拆分。

所以應保存：

- boundary 的責任；
- 依賴與 contract；
- 當初選擇的理由；
- 何種變化會觸發重新評估。

## Reasoning chain

```text
Unit 1 confirmed behavior / constraints
  ↓
trace one user / data / system flow
  ↓
identify responsibilities + state + trust
  ↓
define interaction contracts
  ↓
group cohesive responsibilities
  ↓
evaluate deployment / scale / security / data / team trade-offs
  ↓
choose boundary with explicit rationale
```

## Required terminology

### Responsibility
一個 component / module / service 對 domain 或 system behavior 負責的工作與規則。

### Boundary
把 responsibility、state、trust 或 deployment 隔開的設計界線。不同種類 boundary 不應混稱為 microservice。

### Contract
跨 boundary 互動時，雙方依賴的 observable semantics：input、outcome、error、authorization / identity context、compatibility 等。不是只指 OpenAPI file。

### Coupling
一方改變時迫使另一方一起改、一起部署或一起理解內部細節的程度。

### Cohesion
放在同一 boundary 內的 responsibility 是否圍繞同一清楚目的／domain concern。

### Data ownership
哪個責任邊界對 business state 的修改規則與 authoritative write 負責。它不等於「只有這個 process 可以物理讀到資料」。

### Trust boundary
資料／操作跨過後，需要重新驗證 identity、authorization、integrity 或 sensitivity assumptions 的界線。

## Classic teaching case A — E-commerce Order System

### Initial scope

「顧客送出訂單；系統記錄訂單，確認商品與付款狀態，之後安排出貨。」

先不預設 Order Service / Payment Service / Inventory Service 都是 microservices。

### Questions to expose

- 「建立訂單」和「扣庫存」是不是同一個 business responsibility？
- payment provider 是系統內部還是 external dependency？
- Order 可以直接修改 Inventory database 嗎？如果可以，誰維持庫存規則？
- shipping 需要知道完整 payment implementation 嗎，還是只需要已付款的 business outcome？
- 哪些操作需要 actor / authorization context？
- 如果 inventory 的 scale 或 availability requirement 與 order 不同，boundary 是否需要改變？
- 如果拆成獨立 services 後產生 data consistency / deployment coordination，收益是否足以負擔？

Unit 2 只設計責任、ownership、trust 與 contract；跨服務 transaction / saga 留後續單元。

## Classic comparison case B — Notification System

「其他系統要求發送 email / SMS / push notification。」

這個案例用來顯示 boundary 可能來自不同理由：

- provider integration 是外部 dependency；
- channel 有不同 payload / failure semantics；
- caller 應依賴「request notification」而不是 SMTP / vendor SDK 細節；
- 是否拆成獨立 deployable service，要看 reuse、scale、failure isolation、team ownership 等 requirements。

不要因為 notification 常畫成 service，就宣稱所有小系統都必須有 Notification Service。

## Transfer target — Case tracking multi-repo system

使用 synthetic workflow，參考 frontend / backend / document-processing / database 的系統型態。

給學習者：

- browser UI 顯示案件；
- backend 管理案件 workflow；
- document engine 處理 PDF / spreadsheet；
- database 保存案件資料；
- 文件處理可能耗時且失敗。

不提示「四個 repo = 四個 services」。

應能提出：

- 哪個 component 擁有案件狀態轉移規則？
- document engine 回傳的是業務完成狀態還是處理結果？
- frontend 能不能直接決定案件進入下一階段？
- document engine 是否應直接修改 case tables？
- API contract 要帶哪些 job / case identity 與 error state？
- 為什麼 document processing 值得獨立 process / deployment？如果不值得，合併有什麼影響？
- DB 是 persistence mechanism；它本身不等於 domain owner。

## Misconceptions and boundary cases

### M1. 「一個 box 就是一個 microservice」
修正：box 可能只是責任、module、process 或 external system。先說清楚 diagram abstraction level。

### M2. 「microservices 越多越 scalable」
修正：獨立 scaling 是可能收益，但拆分同時增加 network、coordination、consistency、testing、deployment 與 observability complexity。

### M3. 「frontend 已經 disabled，所以操作被禁止」
修正：client-side state 不是可信任的 authorization boundary；負責 state mutation 的可信任端仍需 enforcement。

### M4. 「API contract = request / response JSON schema」
修正：schema 是 contract 一部分；business semantics、errors、side effects、authorization、compatibility 同樣重要。

### M5. 「database 是 source of truth，所以所有 service 都可以直接寫」
修正：storage authority 與 domain write responsibility 要分開理解。共享寫入可能讓規則散落。

### M6. 「每個 microservice 一定只能有一張獨立 database server」
修正：課程討論的是 logical ownership / schema / write boundary，不把 deployment topology 當定義。

### Boundary: small internal app
若一個小團隊、一個 workload、相同 scale / availability requirement，modular monolith + 清楚 module boundaries 可能已足夠。Unit 2 不要求為未出現的 independent deployment need 提前拆 distributed services。

## Transferable principle

> **先讓責任、資料 ownership、trust 與 contract 清楚，再決定哪些 boundary 值得成為獨立部署服務。拆分的理由必須能追溯到 domain 或 architecture requirement，並同時計算 coordination cost。**

## Claim-level source mapping

| Claim | Source | Status |
| --- | --- | --- |
| workload 可依 user / data / system flows 分解，不同 flow 可有不同 quality requirements | Azure Build for business needs | verified 2026-09-25 |
| microservice 應圍繞 business capability / bounded context，並考慮 NFR | Azure Microservices architecture + Domain analysis | verified 2026-09-25 |
| boundary 沒有機械式唯一答案；需考慮 domain、requirements、architecture characteristics | Azure Domain analysis | verified 2026-09-25 |
| microservices 的收益包含 independent deployment / scale / fault isolation；代價包含 complexity / consistency / testing / communication | Azure Microservices architecture style | verified 2026-09-25 |
| API 是 service-consumer contract，不應暴露 internal implementation / DB schema；需考慮 compatibility | Azure API design | verified 2026-09-25 |
| REST API 的 loose coupling 讓 client / service 可獨立演進 | Azure Web API design best practices | verified 2026-09-25 |
| least privilege、authorization、traceability、data protection 是安全設計要求 | AWS Well-Architected Security design principles | verified in Unit 1 review |
| E-commerce / Notification / case tracking 細節 | synthetic teaching cases | instructor-created; Content Review must check consistency |

## Sources for Content Review

- Azure Architecture Center — Build for business needs
- Azure Architecture Center — Microservices architecture style
- Azure Architecture Center — Use domain analysis to model microservices
- Azure Architecture Center — Identify microservice boundaries
- Azure Architecture Center — API design
- Azure Architecture Center — Web API design best practices
- AWS Well-Architected — Security design principles
- System Design Primer / ByteByteGo archive as coverage and comparison references

## Pending validation before Content Review passes

1. 檢查 C2 是否過度把 microservice-specific DDD guidance 泛化到所有 module boundaries；Canonical Content 應保持「一般原則」與「microservice-specific evidence」的區分。
2. 補一手 authorization source，確認 C5 的 server-side enforcement 表述；AWS security principle 支持 least privilege，但還需 application/API-level authority。
3. 檢查 data ownership 的教學簡化，避免誤教成「physical database 必須完全分離」。
4. 檢查 Order case 是否在 Unit 2 偷渡 Unit 3/4 的 consistency / async 解法；本單元只能提出 boundary consequence。
5. Content Review 通過前，不把 microservices 當預設 reference architecture。
