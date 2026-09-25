# Learning Copy v0.1

> 狀態：Working copy，可直接進 implementation；實際學習後再依 Human Learning Review 修訂。
> 來源：confirmed curriculum、Canonical Content、Cross-unit Content Review、Interaction Storyboard。
> 語言：繁體中文；專有名詞第一次出現必須白話定義。

## Course landing

### Title
System Design：從「做得出來」到「知道為什麼這樣設計」

### Intro
你不需要先背一張大型系統架構圖。

這門課從八個問題開始：

1. 到底要做到什麼？
2. 這件事誰負責？
3. 兩個人同時改資料會怎樣？
4. 誰要等到哪一步？
5. 出錯後，我現在到底知道什麼？
6. 我憑什麼說系統真的做到了？
7. 現在到底是哪裡撐不住？
8. 新版怎麼換上去，舊東西才不會壞？

每一章會先讓你看到問題，再介紹解決問題時需要的工程名詞。

AI 可以幫你找漏掉的條件、產生反例、比較方案；最後仍要回到需求、系統行為和證據，判斷答案能不能成立。

### Primary action
開始第一章

## Unit 1｜到底要做到什麼？

### Opening
需求只有一句：

> 使用者可以選場次並預訂座位。

現在可以開始畫架構了嗎？

### Prompt
先不要選資料庫或框架。挑出「如果不知道答案，後面的設計可能會不同」的問題。

### Feedback — solution too early
「先加 Redis」已經是一個解法。

目前還不知道問題是不是出在讀取速度，也不知道這個系統需不需要快取。先把它放到「可能的解法」，繼續確認需求。

### Reveal
目前的資訊可以分成三類：

- **已確認**：需求來源已經說清楚。
- **暫時假設（assumption）**：現在先這樣想，但之後可能被推翻。
- **還不知道**：需要繼續問。

### Term
**Constraint（限制條件）**：會讓某些設計變得可行或不可行的條件。

例如「開賣瞬間會同時湧入大量使用者」，就可能改變後面的效能設計。

### Comparison
同樣叫「預約」，規則不一定相同。

如果是指定座位，一個座位可能只能賣一次；如果是自由入場，系統真正要守的是總容量；如果可以候補，又會多一種狀態。

**Business rule（業務規則）**：在這個業務情境裡，系統必須遵守的規則。

### Unit summary
System Design 的第一步不是挑技術。

先問清楚：

> 誰要做什麼？什麼才算成功？哪些規則不能壞？哪些條件還不知道？

### Transfer
心理師預約同時需要處理場地。

先列出你會追問的問題。這一題不需要提出 transaction、Calendar sync 或任何架構元件。

## Unit 2｜這件事誰負責？

### Opening
一筆訂單從畫面送出後，會經過訂單、庫存、付款和出貨。

先不要把它們畫成四個 microservices。

### Prompt
先分責任：

> 誰負責判斷？誰可以修改資料？誰只是使用別人的結果？

### Term
**Boundary（邊界）**：這件事到哪裡算誰負責。

**Contract（契約）**：跨過邊界時，兩邊約好要提供什麼，以及成功、失敗代表什麼。

### Box lesson
架構圖上的一個框，不一定是一個獨立服務。

它可能只是：
- 一組程式模組；
- 一個執行中的程序；
- 一個資料庫；
- 一個外部系統；
- 一個可以獨立部署的服務。

先說清楚框代表什麼，再討論要不要拆開部署。

### Security prompt
如果前端把「取消別人的訂單」按鈕藏起來，使用者就真的不能取消別人的訂單了嗎？

### Reveal
前端可以被修改，也可以直接送 request。

所以真正會改資料的地方仍然要檢查權限。

**Trust boundary（信任邊界）**：跨過這條線後，不能直接相信傳進來的身分、權限或資料。

### Unit summary
先把責任、資料和信任邊界說清楚，再決定要不要拆服務。

Microservices 是一種部署與協作選擇，不是架構成熟度分數。

## Unit 3｜兩個人同時改資料會怎樣？

### Opening
只剩最後一個座位。

A 查詢：還有。
B 查詢：也還有。

兩個人都準備送出預約。

### Prompt
自己安排 A、B 的「讀取 → 判斷 → 寫入」順序，看看哪些排列會出問題。

### Reveal
A 和 B 單獨看都做了合理的事。

問題出在兩個操作交錯後，系統可能留下兩筆都宣稱成功的預約。

**Race condition（競態條件）**：結果會因為同時操作的先後順序不同而改變，並可能破壞原本的規則。

### Authority
如果畫面、快取和資料庫顯示的內容不一樣，真正決定座位能不能賣的是哪一份？

**Authoritative state（權威狀態）**：真的要做決定時，具有最後判定責任的資料。

### Transaction
**Transaction（交易）**：資料系統用來界定「這一組資料操作怎麼一起處理」的範圍。

有 transaction 不代表所有 race condition 自動消失。

### Isolation
**Isolation（隔離）**：兩個同時進行的 transaction，彼此可以看到、影響到什麼。

### Mechanism feedback
Constraint、conditional update、locking、較強的 isolation 都可能參與保護規則。

這裡沒有「永遠選哪一個」的答案。先問：

> 要保護哪條規則？衝突在哪一步發生？衝突時系統要怎麼回應？

### Unit summary
資料正確性不是「選一個好資料庫」。

先找到不能被破壞的規則，再看同時操作怎麼繞過它，最後才選保護機制。

## Unit 4｜誰要等到哪一步？

### Opening
訂單已經存好了，接下來要寄 Email。

使用者需要等 Email 真的寄出去，畫面才顯示「下單成功」嗎？

### Sync term
**Synchronous（同步）**：這次操作要等到指定結果，才回覆 caller。

### Async term
**Asynchronous（非同步）**：先把工作收下來，最終結果稍後再取得。

非同步不等於「比較快」。總工作量可能完全沒有變。

### Queue timeline
一個通知可能經過：

收到通知工作 → 進入佇列 → worker 取到 → provider 接受 → 收件者收到。

**Queue（佇列）**可以先把工作收下來排隊。

工作進 queue，**不代表工作已完成**。

### Backpressure
如果每分鐘進來 1000 件工作，但後面每分鐘只能做 500 件，queue 會越來越長。

**Backpressure（背壓）**：後面處理不完時，系統需要限制、延後或拒絕前面繼續送進來的工作。

### Unit summary
先定義「誰需要等到哪一步」，再決定同步、非同步、平行或 queue。

## Unit 5｜出錯後，我現在到底知道什麼？

### Opening
付款 request 送出去了。

等太久，timeout。

付款失敗了嗎？

### Answer
現在最安全的答案是：

> **不知道。**

Timeout 只代表「我在期限內沒有拿到結果」。

遠端可能沒收到、還在處理，也可能已經扣款，只是回覆沒有回來。

### Retry
如果現在直接再扣一次，某些情況會成功，某些情況會扣兩次。

所以先問：

> 這次操作有沒有可以辨認的身分？能不能先查到剛才到底發生什麼？

### Idempotency
**Idempotency（冪等）**：同一件事被重送時，不應多產生一次定義範圍外的效果。

加一個 ID 不會自動得到冪等。系統還要知道這個 ID 代表哪一次操作、保存多久、重複時怎麼處理。

### Compensation
Email 已經寄出去，沒有「把那封信從對方信箱收回」的 transaction rollback。

**Compensation（補償）**：事情已經發生，無法直接倒轉時，再做一個新的動作修正結果。

### Unit summary
遇到 failure，先問：

> 我現在知道什麼？哪些事情可能已經發生？有什麼證據？

確認這些之後，才決定 retry、等待、補償或交給人工。

## Unit 6｜我憑什麼說做到了？

### Opening
API 回傳 200。

這能證明「訂單完成」嗎？

### Evidence
200 至少表示這次 HTTP interaction 收到成功 response。

它不會自動證明：
- 資料狀態符合所有規則；
- 外部付款成功；
- Email 已送達；
- 權限檢查一定正確。

### Tests
不要先背測試名稱。

先看這個 test 到底走過哪些東西：

> 只有一個 function？一個 service？真的資料庫？外部 dependency？整條使用者流程？

測試通過，是這個範圍內的可執行證據。

### Signals
**Log（事件紀錄）**：某個時間點發生了什麼。

**Metric（指標）**：一段時間內可以聚合比較的數值，例如失敗率、延遲、queue 長度。

**Trace（追蹤）**：同一次操作穿過多個元件時，整條路徑發生了什麼。

### Verdict
Telemetry 告訴你「發生了什麼」。

Requirement 才告訴你「這樣算不算可以接受」。

### Privacy
不要為了方便 debug 把密碼、token 或完整敏感資料全部寫進 log。

能定位問題的證據，也需要自己的權限和保存規則。

### Unit summary
先問：

> 我要證明哪一件事？

再決定需要 test、log、metric、trace，還是直接檢查 business state。

## Unit 7｜到底是哪裡撐不住？

### Opening
三個系統都說「流量變成十倍」：

- News Feed
- Video Delivery
- URL Shortener

它們需要加一樣的東西嗎？

### Workload
**Workload（工作負載）**：系統實際要處理的 requests、jobs、資料量和流量分布。

先問：
- 一秒多少 request？
- 每個物件多大？
- 讀多還是寫多？
- 工作一次要做多久？
- 尖峰和平均差多少？

### Performance terms
**Latency（延遲）**：完成一件事要等多久。

**Throughput（吞吐量）**：一段時間能完成多少件事。

**Saturation（飽和）**：某個資源快到上限，新的工作開始排隊或變慢。

**Bottleneck（瓶頸）**：現在真正限制系統表現的那個地方。

### Intervention
只有找到 bottleneck，才選解法。

Cache、CDN、worker、replica、partition 都是在解不同問題。

### Cache
**Cache（快取）**：先保存一份可以再取得的資料副本，讓常見讀取不用每次回到原始來源。

代價是：這份副本可能不是最新的。

### Scale reminder
多一個元件，就多一個要部署、監控、失敗和維護的地方。

如果現在的 workload 用一個 app、一個 database 和 object storage 就能滿足需求，那也是完整的 System Design。

### Unit summary
先量測或明確估計，再找 bottleneck。

每加入一個元件，都要回答：

> 它改善哪個受限資源？代價是什麼？我要看什麼證據才知道真的有改善？

## Unit 8｜新版怎麼換上去，舊東西才不會壞？

### Opening
舊版使用：

`full_name`

新版想改成：

`first_name + last_name`

可以先把舊欄位刪掉，再部署新版嗎？

### Compatibility
部署不是一瞬間完成。

一段時間裡，舊版和新版可能同時存在。

**Backward compatibility（向後相容）**：新版上線時，在約定範圍內，舊的 consumer 或資料仍然可以一起工作。

### Migration
**Migration（遷移）**：把 schema、資料、設定或狀態，從舊形態安全移到新形態。

典型思路：

先增加新結構 → 讓新舊版本都能工作 → 搬資料 → 切換 → 驗證 → 確定舊版本不再需要後才移除舊結構。

### CI/CD
**Continuous Integration（持續整合）**：頻繁整合改動，用自動 build、tests 和 checks 盡早發現問題。

**Continuous Delivery（持續交付）**：讓通過 pipeline 的版本維持可部署狀態；正式發布仍可以有人決定。

**Continuous Deployment（持續部署）**：通過 pipeline 的版本自動進入 production。

### Rollout
**Rollout（逐步發布）**：不要一次把所有使用者／instances 都換成新版，而是逐步增加新版的 exposure。

Canary、rolling、blue-green 是不同 rollout strategy，不是安全保證。

### Rollback
「Rollback」一定要說清楚回哪個東西：

- code？
- traffic？
- config？
- data？

切回舊版程式，不會讓已修改的資料或已呼叫的外部 API 自動回到過去。

### Unit summary
部署不是「把新程式複製上去」。

它是在一段時間裡，讓 code、contract、data、configuration 和 traffic 從舊狀態安全走到新狀態。

## Final transfer｜沒有章節提示

你接手一套案件追蹤＋文件處理系統。

它會：

- 批次匯入文件；
- 每件案件獨立處理；
- 自動分派後人工核對；
- 必要資料不完整時不能推進；
- 文件處理可能需要一段時間；
- 完成後通知外部人員。

接下來系統會陸續出現事故。

你不需要先猜「這是哪一章」。

每次只回答：

1. 現在知道什麼？
2. 還缺什麼資訊？
3. 哪條規則可能被破壞？
4. 哪個地方負責？
5. 需要什麼證據？
6. 下一步怎麼做比較安全？

最後整理成一份 System Design handoff，而不是分數。

## Global feedback copy

### When learner picks a plausible but unsupported solution
這個方案可能成立，但目前還少一個關鍵資訊。

先說明：**它要解決哪個已知問題？**

### When learner over-designs
這個元件確實能解某些問題。

目前的需求或量測裡，哪一項需要它？

### When learner confuses evidence with guarantee
你現在有一份證據，但它只涵蓋一部分。

再問一次：**這份證據真正能支持哪個結論？**

### When learner identifies an unknown
這是一個有效的結果。

System Design 不要求一開始什麼都知道；重要的是把未知事項留下來，不要默默把它變成假設。

## Writing constraints for implementation

- 畫面主要段落每段 1–3 句。
- 不使用研究文件式長條列作主要教學畫面。
- tooltip 只補充，不承擔必要概念。
- 專有名詞第一次出現必須有白話定義。
- 同一 screen 新增專有名詞原則上不超過 2 個；若 mechanism 需要更多，拆 stage。
- 英文縮寫第一次展開。
- 避免把 learner feedback 寫成考試式「答對／答錯」；優先顯示 consequence 與 evidence。
