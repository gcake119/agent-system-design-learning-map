# Learning Map 重製：教材來源架構

> 狀態：已確認（2026-09-25）
>
> 本文件記錄重新製作 Agent System Design Learning Map 時的教材來源角色與使用邊界。課程主題是 **System Design**；AI Agent 是學習者在系統設計過程中的協作者，不是課程主體。

## 使用原則

本次重製遵循 `learning-map` Skill 的來源角色規則。既有課程不是 locked curriculum；舊課綱、教材與互動實作都需要重新審查。

來源分成三層。不同來源可以同時具有內容來源與 presentation reference 角色，但不能因為某來源涵蓋某主題，就自動把該主題加入核心課綱。所有內容都必須支撐確認後的 System Design 學習目標。

## 第一層：System Design 主體

### ByteByteGo / System Design 教材

角色：`Source-informed + Presentation reference`

用途：

- System Design 全貌與常見架構；
- scalability、data、cache、load balancing、messaging 等常見設計問題；
- 案例與 trade-off；
- 圖解語言、架構圖、資訊視覺化與教學呈現。

ByteByteGo 的內容可以作為課程內容來源，不只作為視覺參考。

### Designing Data-Intensive Applications (DDIA)

角色：`Source-informed`

用途：

- 資料系統的核心原理；
- replication、partitioning、transactions、consistency；
- batch / stream；
- distributed-system failure；
- 設計選擇背後的 trade-off。

主要用於補足概念深度與機制，不要求依原書章節組織課程。

### System Design Primer

來源：https://github.com/donnemartin/system-design-primer

角色：`Source-informed + curriculum coverage reference`

用途：

- 檢查 System Design 基礎範圍是否缺漏；
- scalability、latency / throughput、availability / consistency；
- DNS、CDN、load balancing、database、cache、replication、sharding 等；
- System Design 解題流程與案例。

## 第二層：系統原理與工程驗證

### MIT 6.5840 Distributed Systems

角色：`Source-informed / subject-matter validation`

用途：

- distributed systems 原理；
- fault tolerance、replication、consistency；
- RPC、共識、distributed transactions 等需要更嚴謹原理時的驗證來源。

不直接照大學課程深度教學；依本課程目標降階成適合學習者的 canonical content。

### CMU 15-440 Distributed Systems

角色：`Source-informed / curriculum coverage validation`

用途：

- distributed systems 的問題空間；
- resource scarcity、concurrency、communication、failure、security、instrumentation / monitoring 等；
- 檢查課程是否只介紹元件，而漏掉系統設計問題與限制。

### AWS Well-Architected Framework

來源：https://docs.aws.amazon.com/wellarchitected/latest/framework/

角色：`Source-informed / architecture review framework`

用途：

- Operational Excellence；
- Security；
- Reliability；
- Performance Efficiency；
- Cost Optimization；
- Sustainability；
- 完成架構後的品質與 trade-off 檢查。

不把課程改造成 AWS 服務教學。

### Azure Architecture Center

來源：https://learn.microsoft.com/azure/architecture/

角色：`Source-informed / pattern reference`

用途：

- architecture styles；
- cloud design patterns；
- technology decision guides；
- reference architectures；
- reliability、scalability 與 distributed-system patterns。

優先採用 technology-agnostic 的設計原則與 pattern，不把課程綁定 Azure 產品。

## 第三層：AI 協作者層

AI Agent 在本課程中用來協助學習者理解問題、整理需求、提出假設、比較方案、找風險、取得證據與驗證設計。這一層不決定 System Design 主課綱。

### 深入理解 AI Agent：設計原理與工程實踐

來源：https://github.com/bojieli/ai-agent-book

角色：`Source-informed`

用途：

- Agent 基本架構；
- context engineering；
- memory / RAG；
- tool use；
- Agent evaluation；
- multi-agent collaboration；
- 可重現實驗與工程案例。

使用時要轉譯成「AI 如何協助 System Design reasoning」，不直接把原書十章變成本課程章節。

### Stanford CS329Z — Engineering AI Agents

來源：https://cs329z.stanford.edu/

角色：`Source-informed`

用途：

- workflow 與 agent 的區分；
- compound AI systems；
- decomposition；
- tool use；
- evaluation；
- cost / latency trade-off；
- AI 協作方式的概念框架。

## Presentation / Interaction references

### ByteByteGo

除內容來源外，同時參考其圖解、架構圖與資訊視覺化方式。

### System Design Simulator

來源：https://github.com/vijaygupta18/system-design-simulator

角色：`Presentation / Interaction reference`

只參考互動、模擬與操作方式，不作為 subject-matter correctness 的主要依據。

## 既有課程

來源：https://github.com/gcake119/agent-system-design-learning-map

角色：舊版教材、課綱、案例與實作的審查對象。

規則：

- 不視為 locked curriculum；
- 不預設沿用原章節；
- 不預設沿用原互動方式；
- 舊內容可在 Subject Model 與新課綱確認後分類為保留、調整、移動或刪除；
- 舊實作不能反過來限制新的學習結構。

## 後續流程

依 `learning-map` Skill：

1. Sources and references（本文件）
2. Subject Research / Subject Model
3. Pyramid-based curriculum design
4. Scope and depth confirmation
5. Learning Objectives
6. Canonical Content
7. Content Review / subject-matter validation
8. Interaction Storyboard
9. Learning Copy
10. Implementation
11. Technical QA
12. Human learning review

目前進度：進入 **Subject Research / Subject Model**。