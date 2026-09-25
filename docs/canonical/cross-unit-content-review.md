# Cross-unit Content Review — v0.1

> 日期：2026-09-25
> 結果：**PASS with editorial constraints**
> 範圍：Unit 1–8 Canonical Content v0.1
> 下一 gate：Interaction Storyboard

## 1. Review 結論

八個單元形成完整且沒有重大矛盾的 System Design 學習鏈：

```text
1 先說清楚要做到什麼
  ↓
2 誰負責什麼、邊界在哪
  ↓
3 資料怎麼保持正確
  ↓
4 工作怎麼往下走、誰要等
  ↓
5 出錯／不知道結果時怎麼辦
  ↓
6 用什麼證據確認
  ↓
7 workload 改變後哪裡撐不住
  ↓
8 系統怎麼安全改版
```

沒有需要回到 curriculum gate 的 material issue。可以進 Interaction Storyboard。

但後續 storyboard / Learning Copy 必須遵守本文件的 **plain-language / terminology constraints**，避免 canonical content 裡為了精確而保留的中英混合術語直接搬到 learner-facing UI。

## 2. 跨單元責任邊界

### Unit 1 vs Unit 6

- Unit 1：定義「什麼結果才算符合需求」。
- Unit 6：決定「用什麼 evidence 檢查實作／production 是否符合」。

避免 Unit 6 重新教一次 BDD / requirement discovery。

白話記法：

> Unit 1 是先把「要什麼」說清楚；Unit 6 是回來檢查「我們憑什麼說做到了」。

### Unit 2 vs Unit 4

- Unit 2：誰負責、資料／權限邊界、彼此 contract。
- Unit 4：這些 responsibility 在時間上如何交接、誰要等待到什麼狀態。

避免把「service boundary」與「async queue」綁成固定組合。

### Unit 3 vs Unit 5

- Unit 3：正常 concurrency 下，如何不讓 state 進入不合法狀態。
- Unit 5：dependency failure / timeout / crash / duplicate 下，如何知道已發生什麼並恢復。

Concurrency conflict 不等於 failure；failure recovery 也不能取代 authoritative write rule。

### Unit 4 vs Unit 7

- Unit 4：為什麼要 async / queue、completion semantics。
- Unit 7：arrival / service rate 改變後，queue / worker capacity 是否足夠。

Unit 4 不做 capacity optimization；Unit 7 不重新定義 queued / completed。

### Unit 6 vs Unit 8

- Unit 6：verification / observability 的一般 evidence model。
- Unit 8：把 Unit 6 的 evidence 用在 rollout decision。

Unit 8 不重教 logs / metrics / traces，只問「這次 deployment 要看哪些 evidence 才能繼續」。

### Unit 3 vs Unit 8

- Unit 3：runtime business state correctness。
- Unit 8：schema / data / code version coexistence during change。

Database migration 可以引用 Unit 3 的 authority / transaction 概念，但不能把 migration 教成一般 transaction exercise。

## 3. 跨單元術語一致性

後續 learner-facing copy 固定以下意思：

| Term | 課程內固定意思 | 白話第一句 |
| --- | --- | --- |
| requirement | 系統被要求提供的行為／品質／限制 | 「系統到底被要求做到什麼」 |
| assumption | 尚未確認、暫時用來推進設計的條件 | 「我們現在先這樣假設，但之後可能被推翻」 |
| invariant / business rule | 在指定 scope 下不能被破壞的規則 | 「不管同時來幾個操作，這條規則都不能壞掉」 |
| boundary | 責任、資料、信任或部署的界線 | 「這件事到哪裡算誰負責」 |
| contract | 跨 boundary 彼此可依賴的行為與資料約定 | 「兩邊約好要給什麼、成功／失敗代表什麼」 |
| authoritative state | 對某項 business fact 有最終判定／寫入責任的資料 | 「真的要做決定時，最後相信哪一份資料」 |
| transaction | 資料系統處理一組操作的邊界；實際 guarantee 依系統 | 「這幾個資料動作要用什麼範圍一起處理」 |
| isolation | concurrent transactions 彼此可以看到／影響到什麼的規則 | 「兩個人同時改資料時，彼此會看到什麼」 |
| synchronous | caller 在同一次 interaction 等待指定 outcome | 「這次操作要等到哪一步才回覆」 |
| asynchronous | 最終結果稍後取得，需要另外追蹤工作 | 「先收件，做完再另外告訴你」 |
| idempotency | 同一 logical operation 重送時，不多產生定義範圍外的 effect | 「同一件事重送，不應多做一次」 |
| compensation | 對已發生且不能直接 rollback 的 effect 做後續修正 | 「事情已經發生，只能再做一個動作補救」 |
| observability | 用系統輸出的 evidence 理解內部發生什麼 | 「出問題時，有沒有足夠線索知道卡在哪裡」 |
| latency | 一次 operation 完成花多久 | 「一件事要等多久」 |
| throughput | 單位時間能處理多少 work | 「一段時間能做多少件」 |
| saturation | resource 接近 capacity，新增工作開始排隊／退化 | 「這個地方已經快塞滿了」 |
| artifact | build 後可被版本化、部署的產物 | 「真正要拿去部署的那一份成品」 |
| backward compatibility | 新版本在指定範圍仍能和舊 consumer / data 合作 | 「新版本上線時，舊東西還能不能一起工作」 |
| rollout | 逐步讓新版本接觸更多 instance / traffic / users | 「不要一次全換，分批把新版放出去」 |

同一概念第一次出現採 **白話 → 中文術語／英文 term → 立即用案例**。之後才可以只使用短術語。

## 4. Learner-facing 文案規則

### 4.1 先白話，再專有名詞

不要：

> 定義 authoritative state 與 idempotency boundary。

改成：

> 如果兩份資料不一樣，真正做決定時要相信哪一份？這份具有最後判定責任的資料，這裡叫 **authoritative state（權威狀態）**。

### 4.2 一句只承擔一個新概念

不要在同一句首次引入 transaction、isolation、serializable、locking。

先用 race animation / story 看見問題，再一個一個命名。

### 4.3 英文保留給業界常用詞，但不能只丟英文

第一次：

> **latency（延遲）**：完成一次操作要等多久。

後續可直接用 latency / 延遲。

像 invariant、artifact、backpressure、blast radius 等不應假設初學者已知。

### 4.4 名詞定義要說「它不是什麼」

例如：

> Queue（佇列）可以先把工作收下來排隊；**工作進 queue 不代表工作已完成**。

> Transaction（交易）是資料操作的一個處理範圍；**用了 transaction 不代表所有 race condition 自動消失**。

這種 boundary sentence 優先於字典式定義。

### 4.5 技術名詞只在需要做判斷時出現

不為了顯得完整塞 vocabulary。若 learner 不需要用該 term 做比較／推理／transfer，就放延伸內容。

核心避免提前加入：

- CAP theorem 細節；
- consensus algorithm；
- saga / outbox 作必修名詞；
- Little's Law；
- Kubernetes primitives；
- cloud vendor service names。

### 4.6 使用具體動詞

優先：

- 誰讀？
- 誰改？
- 誰要等？
- 哪一步可能重複？
- 哪一份資料最後算數？
- 失敗後知道哪些事情已經發生？
- 要看什麼證據才敢繼續？

少用：

- 建立 robust architecture；
- optimize scalability；
- enhance reliability；
- ensure consistency；

除非後面立即說清楚具體行為。

### 4.7 圖上的文字也要遵守白話規則

Diagram node 不直接寫：

> Orchestrator / Persistence / Async Processor

若當下還沒教過，可先寫：

> 接收預約 / 保存預約 / 寄送通知

學會 responsibility 後再顯示技術角色名稱。

## 5. 前置知識檢查

### 必要但可內嵌補充

- browser / client 會向 backend 發 request；
- backend 可以讀寫 database；
- external service 是系統外 dependency；
- request / response 基本概念；
- 「資料庫保存資料」的基本理解。

不要求先學：

- SQL transaction isolation；
- message broker；
- distributed systems；
- microservices；
- Docker / Kubernetes；
- observability stack；
- CI/CD syntax。

Storyboard 必須在第一次用到這些概念前提供足夠 visual grounding。

## 6. 案例 progression Review

### 經典案例

案例重訪沒有內容衝突：

- Booking：U1 requirement → U3 concurrency。
- Payment：U3 state → U5 unknown / duplicate effect → U6 evidence。
- Notification / Job：U2 responsibility → U4 async handoff → U5 failure。
- URL Shortener：U1 constraints → U7 read-heavy performance。

重訪時必須顯示「這次換了哪個問題」，避免 learner 誤以為前一章漏教。

### Transfer progression

Transfer 難度合理上升：

1. U1 Sim-sik-style：找未知條件；
2. U2 case multi-repo：找責任；
3. U3 booking / workflow：找 race / enforcement；
4. U4 VocaScript-style：找 dependency / completion；
5. U5 publishing：判斷 unknown / retry；
6. U6 case validation：建立 evidence chain；
7. U7 podcast：判斷合理 complexity；
8. U8 multi-repo change：跨 code / data / contract / rollout。

最後 integrated case 再混合多種問題，不提示是哪一章。

## 7. AI collaboration cross-unit Review

AI 不新增獨立章。每章只安排一種主要協作能力：

| Unit | AI 協作角色 |
| --- | --- |
| 1 | 找漏問的 requirement / edge case，標示 assumption |
| 2 | 對 boundary 提出理由／反例 |
| 3 | 幫忙枚舉 interleaving，但 learner 判斷 invariant |
| 4 | 幫忙整理 dependency graph |
| 5 | 產生 failure branches / recovery options |
| 6 | 產生 test ideas / incident hypotheses，回到 evidence |
| 7 | 比較 interventions，但必須引用 workload / measurements |
| 8 | review compatibility / rollout plan |

AI output 永遠不能直接被標成「正確答案」；教材要讓 learner 有 evidence / requirement 可以判斷。

## 8. Content overlap decisions

以下重複是 intentional spiral：

- requirement：U1 定義，U6 / U8 回用；
- state：U3 定義，U4 / U5 / U8 回用；
- evidence：U6 定義，U7 / U8 回用；
- trade-off：全課使用。

以下不得重複教：

- U4 不重教 Unit 2 service boundary；
- U5 不重教 Unit 3 transaction；
- U6 不重教 Unit 1 BDD；
- U7 不重教 Unit 4 queue semantics；
- U8 不重教 Unit 6 telemetry。

## 9. Gate decision

**Cross-unit Content Review：PASS**

八單元可以進入 Interaction Storyboard。

Storyboard 階段的額外硬性要求：

1. learner-facing copy 先白話再術語；
2. 每個新術語第一次出現必須定義，並有一個具體例子或反例；
3. 不把 canonical content 的中英混合 research prose 原封不動搬到 UI；
4. 每個單元至少有一次「改變 constraint → 原方案需要重評估」；
5. 經典案例負責 teaching，使用者經驗案例只做 transfer；
6. synthetic 數字／資料必須標明為教學假設；
7. 圖像要顯示 mechanism / state change，不只做裝飾；
8. Interaction Storyboard 仍不得修改 production UI。
