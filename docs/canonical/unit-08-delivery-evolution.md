# Unit 8 Canonical Content v0.1 — 安全交付版本，維持資料與服務相容

> 狀態：Canonical Content v0.1 方向已由使用者確認（2026-09-25）；待 subject-matter Content Review。
> 本文件定義 Unit 8 必須正確傳達的 instructional meaning；不是 GitHub Actions、Docker、Kubernetes、Terraform 或特定雲端部署教學。

## Central question

**當新版程式、舊版程式、既有資料與外部 consumers 同時存在時，怎麼讓系統從版本 A 安全走到版本 B？如果新版本有問題，哪些東西真的能 rollback？**

Unit 1–7已定義 requirements、boundaries、state、workflow、failure、evidence 與 performance。Unit 8 把這些設計放進 change lifecycle：build / test / artifact / release / deploy、contract compatibility、schema migration、rollout、rollback / forward fix、configuration / secrets、post-deploy verification。

## Learning objectives

學完後，學習者應能：

1. 區分 source change、build、test / checks、artifact、release、deployment 與 runtime configuration，說明 CI/CD pipeline 每一步提供的 evidence / automation scope。
2. 推演 API / event / data schema 改動對同時存在的新舊 producers / consumers / app versions 的影響，設計 backward / forward compatibility window。
3. 將 database migration 視為 code + data + version coexistence 問題，而不是單一 DDL 指令；安排 expand / migrate / contract 或等價的 staged change。
4. 比較 rolling / canary / blue-green 等 rollout strategy 的 traffic exposure、capacity、observability、rollback cost，而不是背「哪個最好」。
5. 區分 application rollback、configuration rollback、traffic rollback、data rollback / restore；辨認 irreversible / external effects 何時需要 forward fix / compensation。
6. 為 deploy 定義 pre-deploy checks、health / business verification、stop / rollback criteria 與 evidence。
7. 說明 configuration / secrets / environment differences 是 deployment design 的一部分，避免把 secret 放進 artifact / source。
8. 面對 AI 產生 CI/CD pipeline 時，能追問「這一步驗證什麼？失敗時阻止什麼？artifact 是否可重現？資料 migration 如何相容？」。

## Core claims

### C1. CI/CD 是 change delivery system，不是 System Design correctness 的替代品

概念層：

- **Continuous Integration**：頻繁整合 changes，透過 automated build / tests / checks 提供早期 feedback。
- **Continuous Delivery**：讓通過 pipeline 的 change 維持可部署狀態；production release 可以有人為決策。
- **Continuous Deployment**：通過 pipeline 的 change 自動進 production（依組織定義與 controls）。

不同工具可能使用略有差異的名詞；本課程重點是 pipeline stage / evidence / promotion semantics，而不是品牌。

CI passing 只代表指定 checks 通過，不證明 production requirement 永遠成立（延續 Unit 6）。

### C2. Build once / promote artifact 能降低環境間「實際跑的不是同一份東西」的風險

理想上，同一 immutable / versioned artifact 從較低環境逐步 promotion，runtime configuration / secrets 外部注入。

如果每個 environment 都重新 build，不同 dependency / build input 可能讓 artifact 漂移。

本課程不要求 container image；artifact 可以是 package、binary、image、static bundle 等。

### C3. Backward compatibility 是 rollout 期間的時間問題

Rolling / canary deployment 代表一段時間內可能同時存在 old / new versions。

因此 contract change 要問：

- old consumer 能不能讀 new producer output？
- new consumer 能不能處理 old data / message？
- external clients 是否仍使用舊 API？
- deploy order 是什麼？
- compatibility window 多久？

「API versioning」只是其中一種 mechanism，不是所有 change 都要新增 URL version。

### C4. Database schema migration 必須考慮 code / schema coexistence

直接 rename / drop column 可能讓仍在執行的 old app version 失敗。

典型 staged reasoning：

1. **expand**：先加入 backward-compatible schema / field；
2. deploy code that can work across transition；
3. migrate / backfill data；
4. switch reads / writes；
5. verify；
6. **contract**：確認沒有 old consumers 後才移除舊 schema。

這是教學 pattern，不宣稱每次 migration 都固定六步。

### C5. Rollout strategy 改變 blast radius，不消除 defect

- rolling：逐步替換 instances；
- canary：先讓少部分 traffic / users 使用新版本，根據 evidence 擴大；
- blue-green：維持兩套環境／版本並切換 traffic；
- feature flag：可把 feature exposure 與 binary deployment 分離，但 flag 本身有 lifecycle / testing complexity。

選擇依 capacity、state、session、database compatibility、cost、traffic control、observability、rollback requirement。

### C6. Rollback application code 不等於 rollback data / external effects

如果新版已：

- 修改 data schema / data；
- 發送 messages；
- 呼叫 external API；
- 產生 irreversible business effects；

切回舊 binary 可能無法恢復原狀，甚至舊版已無法讀新資料。

因此 deployment plan 要預先定義：

- 哪些 changes reversible；
- 哪些需要 backward-compatible data；
- 哪些用 restore；
- 哪些只能 forward fix / compensate。

### C7. Deployment verification 需要 technical health + business behavior

Health check / process running 只能證明局部 runtime condition。

部署後還要依 risk 檢查：

- error / latency / saturation；
- key business flow；
- data state / migration completeness；
- authorization / security；
- background jobs；
- external dependency；
- regression / synthetic checks。

Stop / rollback criteria 應在 rollout 前定義，而不是事故發生後臨時猜。

### C8. Configuration 與 secrets 是 deployment input，不應硬編碼進 source / artifact

不同 environment 需要不同 endpoint、credentials、feature config、capacity settings。

需要：

- version / change tracking；
- access control；
- secret storage / rotation；
- validation；
- rollback / audit。

Unit 8 不教特定 secret manager；只建立 separation of code / artifact / config / secret。

### C9. Deployment automation 要保留 human decision 的位置

高風險 migration / production release 可以要求 approval；低風險 change 可以高度自動化。

「成熟 CI/CD = 完全無人」不是本課程立場。目標是 repeatable、observable、auditable、bounded change。

### C10. Change 本身是 System Design workload

一個只能在「所有 component 同時瞬間升級」才正確的 distributed system，通常有很高 deployment coordination risk。

Design for evolution 意味著 contract / data / state 能容忍 staged rollout、版本 coexistence 與 rollback / forward-fix path。

## Reasoning chain

```text
change requirement
  ↓
identify code / contract / data / config impact
  ↓
define compatibility window + deploy order
  ↓
build + verify versioned artifact
  ↓
prepare migration / config / secrets
  ↓
roll out to bounded traffic / instances
  ↓
observe technical + business evidence
  ↓
promote / stop / rollback traffic or code / forward-fix
  ↓
contract old schema / remove compatibility only after evidence
```

## Required terminology

### Build
把 source / dependencies / build inputs 轉成可部署 artifact 的過程。

### Artifact
可被 versioned / promoted / deployed 的 build output。

### Release
一個 change / artifact 被批准或標記為可提供給某環境／使用者的決策／狀態；不同組織名詞可能不同。

### Deployment
把 artifact / configuration 實際放到 target runtime environment 的動作。

### Backward compatibility
新版 provider / data / system 在指定 compatibility scope 下仍能支援舊 consumer / expectation。

### Migration
將 schema / data / config / state 從舊形態移到新形態的受控 change。

### Rollout
逐步把新版本暴露給 instances / traffic / users 的過程。

### Rollback
把某個 change dimension 回到先前版本／狀態；必須明說是 code、traffic、config 還是 data，不能只說「rollback 系統」。

### Forward fix
不回復舊版本，而發布新的修正版來處理已存在的 incompatible / irreversible state。

## Classic teaching case A — Web Service + Database Migration

Initial system：

App v1 reads/writes `customer.full_name`.

Desired v2：

改成 `first_name` + `last_name`。

Naive：

1. rename/drop old column；
2. deploy v2。

問題：

- rolling deploy 時 v1 還在；
- rollback v1 還能不能讀？
- existing rows 怎麼 backfill？
- write during migration 怎麼處理？
- 哪個 step 可逆？

Learner 要提出 staged compatibility plan，而不是背 migration tool command。

## Classic comparison case B — Service API Evolution

Provider 原本回：

```json
{ "status": "paid" }
```

新版希望增加 richer payment state / metadata。

比較：

- additive field；
- changing enum semantics；
- rename / remove field；
- external consumer；
- async event consumer。

讓 learner 看見「JSON parse 得過」不等於 semantic compatibility。

## Transfer target — Multi-repo case system deployment

Synthetic architecture：

- frontend；
- backend；
- document-processing service；
- PostgreSQL；
- reverse proxy；
- CI pipeline。

Change：

「backend 將 document job status 從兩種擴充成四種，frontend 要顯示進度；DB schema 新增欄位；document engine 會開始回傳新狀態。」

Learner 應推演：

- 哪個 contract 先擴充？
- 舊 frontend 遇到新 enum 會怎樣？
- backend 是否先支援 old + new？
- DB migration 在哪一步？
- document engine / backend deploy order？
- CI 各 repo 通過是否能證明 cross-repo compatibility？
- E2E / contract test 放哪裡？
- canary / rolling 時如何判斷新狀態正常？
- rollback backend 時 DB / document engine state 怎麼辦？

不使用真實 production config / secrets / government data。

## Misconceptions and boundary cases

### M1. 「CI 綠燈 = 可以安全上 production」
修正：CI evidence 有 scope；production config、traffic、data、external dependency 與 migration 仍需 rollout verification。

### M2. 「rollback 就是 deploy 舊版」
修正：code rollback 不會自動撤銷 data / external effects。

### M3. 「database migration 在 deploy 前跑完就好」
修正：若 old/new versions coexist，schema change 必須支援 compatibility window。

### M4. 「canary 保證新版本安全」
修正：canary 只限制 exposure；若 sample 不代表風險、telemetry 不足或 shared DB migration 已破壞相容，仍會失敗。

### M5. 「blue-green 可以 instant rollback 所以最好」
修正：雙環境有成本；shared state / DB changes 仍可能讓 rollback 不簡單。

### M6. 「API schema 相容就代表 semantic 相容」
修正：field meaning / enum / side effects / ordering 變化也可能破壞 consumer。

### M7. 「CD 就是每次 commit 自動 production」
修正：Continuous Delivery 與 Continuous Deployment 要區分；組織也可以有 production approval gate。

### M8. 「secrets 用 environment variable 就全部解決」
修正：還需要 storage、access、rotation、audit、leak prevention；env var 只是 delivery mechanism 之一。

## Transferable principle

> **部署不是把新程式複製上去，而是讓 code、contracts、data、configuration 與 traffic 在一段時間內安全地從舊狀態演進到新狀態。任何 rollout 都要先知道相容範圍、可逆範圍與判斷繼續／停止的 evidence。**

## Claim-level source mapping

| Claim | Source | Status |
| --- | --- | --- |
| CI / continuous delivery / continuous deployment distinctions | GitHub / Google Cloud / Martin Fowler primary-ish sources to validate | pending |
| design for evolution / operations / deployment | Azure Architecture Center Design Principles | official source; previously reviewed |
| deployment patterns / canary / blue-green | Azure / AWS architecture docs + ByteByteGo coverage | official source review pending |
| expand / contract database migration | Martin Fowler / Prisma / AWS / Azure authoritative sources to validate | pending |
| immutable / versioned artifact promotion | supply-chain / CI/CD official guidance to validate | pending |
| secrets / config separation | Twelve-Factor + OWASP Secrets Management / cloud guidance | pending |
| Web/API/multi-repo cases | synthetic teaching cases | assumptions explicit |

## Sources for Content Review

- Azure Architecture Center — Design for operations / evolution
- Azure Architecture Center / AWS Prescriptive Guidance — deployment strategies
- GitHub Docs — CI/CD concepts as tool-neutral supporting source
- Google Cloud — CI/CD / deployment strategy guidance where useful
- Martin Fowler — Continuous Delivery / database refactoring references if appropriate
- OWASP Secrets Management Cheat Sheet
- ByteByteGo archive — CI/CD / deployment visual coverage, supplemental only

## Pending validation before Content Review passes

1. 固定 Continuous Integration / Delivery / Deployment 的來源與用詞，避免不同 vendor 定義混用。
2. 核實 canary / blue-green / rolling 的 trade-offs，不把特定 platform implementation 當通用定義。
3. 找可靠來源支持 expand / migrate / contract 的 staged database change；若來源不足，改寫為一般 compatibility sequence，不命名 pattern。
4. 核實 build-once / artifact promotion 的 supply-chain / delivery rationale。
5. Secrets management 要避免把 Twelve-Factor 的 config guidance誤教成完整 secrets security。
6. Transfer 的 multi-repo topology 只作 synthetic case，不描述真實 production deployment details。
