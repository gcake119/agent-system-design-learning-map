# Course refactor review：流程調查課綱 v0.4

> 日期：2026-10-01。工作起點：origin/main `2b1f028`。
> 方法：learning-map main `9e62bb771573f27360e869d8ab2f5db7dedd267d`。
> 使用者已委派本次課程重構決策；保留 2026-09-30 已確認的最高層 outcome 與八章順序。

## Highest-level learning outcome

面對 Web／SaaS 的可見問題，能重建請求及資料路徑，用各層輸入、輸出與證據縮小異常範圍；區分症狀、直接原因與尚待查證的根因；比較設計修改的機制及代價，提出涵蓋使用者結果與業務狀態的驗證。

「第一個異常」依目前可觀察路徑及證據判斷，不保證是根因，也不是所有分支都能由單一直線巡覽找出。

## Learner baseline（可修訂的教學假設）

沒有找到本 repo 的私人 Learning Handoff 或前置課程完成證據。課綱受眾描述與使用者確認的 AI 協作開發背景支援以下保守假設；不把教材提交、看過頁面或用過工具當成掌握證明。公開檔案只保留通用受眾，不儲存個人學習歷史。

| 分類 | 工作假設 | 教學處理 |
| --- | --- | --- |
| Already knows | 能以自然語言提出需求、使用 AI 協助工作 | 不重教 AI 操作、prompt 寫作或 Skill 安裝；銜接時提醒來源與判斷責任 |
| Familiar but needs support | 使用者畫面、前後端／資料庫角色、測試與 CI 名稱 | 補角色差異及證據範圍，不假設已會追請求或解讀資料版本 |
| New / unfamiliar | HTTP 請求回應、跨層調查、關鍵路徑、快取時效、非同步交接、資料副本與證據選擇 | 先用例子建立機制，定義術語；必要 READ 後才要求獨立 Transfer |

## Scope contract

- **Learn now**：請求／回應及資料路徑、各層責任與證據、異常定位、延遲比較、快取的來源負載與時效、工作接收／完成及處理能力、讀取版本與使用情境、未知外部結果、設計代價與重新驗證。
- **Skip because already known**：如何開始 AI 對話、基本需求描述與協作工具操作；不宣稱 BDD、SQL 或系統設計已掌握。
- **Defer / not now**：交易隔離與競態保護完整課、共識／分割演算法、多區域架構、服務拆分、CDN、circuit breaker、完整 retry／冪等工程、資料遷移與部署策略。核心只提示未知結果與重送風險，不要求設計進階機制。
- **Out of scope**：模型訓練、RAG／MCP／多 Agent 編排、雲端認證、面試評分、真實 provider 呼叫、框架語法、部署操作。

延後專案不放進核心 deep dive。舊八單元內容儲存為歷史參考，不再作目前 instructional source of truth。

## Curriculum pyramid 與逐章 review

最高層能力由「重建路徑 → 用證據定位 → 理解機制 → 修改並驗證」支撐。

| Unit／learning question | 學完能做什麼 | prerequisite | Review／處置 |
| --- | --- | --- | --- |
| 1 一個按鈕到底發生了什麼？ | 指出送出、儲存、回應、畫面更新各自的證據 | 無；內嵌最短前後端 bridge | 保留；明示回程，避免把 DB 寫入畫成整條流程結束 |
| 2 問題到底壞在哪一層？ | 用輸入／輸出排除候選位置，保留根因假設 | 1 | 保留；情境名稱不洩漏答案；合法拒絕不等於 API 故障 |
| 3 系統為什麼會變慢？ | 在固定序列路徑比較耗時，先找受限段再選方案 | 1–2 | 保留；加入可調耗時與不變條件，並限制公式適用範圍 |
| 4 為什麼要快取？ | 比較來源負載與回傳資料時效 | 1–3 | 保留；hit 不等於新資料；加入引數與讀取分支 |
| 5 為什麼要佇列？ | 區分接收與完成，推演處理不足的累積工作 | 1–3 | 保留；同步路徑不能畫成已經 enqueue；不重教全套 failure framework |
| 6 資料為什麼看起來不一致？ | 指出實際讀哪一份資料，依時效要求判斷是否違反需求 | 4–5 | 保留；副本是分支，不能串成必經五層；短暫落後不一律判錯 |
| 7 系統出錯時怎麼知道？ | 選擇能區分假設的證據，指出證據盲區 | 1–6 | 保留；同一事故換證據不能換成另一事故；必要說明持續可讀 |
| 8 找到問題以後，要怎麼改？ | 在混合限制下比較修改、代價及驗證範圍 | 1–7 | 保留；由詞彙清單改成同一模型上的設計實驗 |

Unit 2 定位一個問題，Unit 7 統整證據選擇；Unit 3 定位耗時，Unit 4／5 才處理特定讀取或等待問題；Unit 4 計算快取收益，Unit 6 檢查版本／用途。重訪具有新問題，沒有新增同義 Unit。

## Learning modes 與案例

每章保留三個直接可進入的小節：INTERACT（觀察）→ READ（必要機制閱讀，並繼續操作同一模型）→ TRANSFER（不同 domain、自己的假設與驗證）。Transfer 換需求、資料與證據，不只是換標題。READ 不隱藏在 tooltip／accordion，也不拆成揭露段落的按鈕。

Teaching：儲存表單、讀取列表、熱門文章、PDF 產製、更新資料、背景通知。
Transfer：預約建立、匯出報表、商品清單、可預約時段、音訊轉錄、行事曆、發布結果；全部合成資料。最後整合案件檔案處理，在同一架構加入五個限制，不提示章節或 pattern。

## Gates

Curriculum review：PASS（無 learning outcome 重大變更）。接著先完成 `canonical/flow/` 的各章內容與 source mapping，再實作 storyboard／copy；Technical QA 與 Human Learning Review 分開報告。

## 歷史決策

2026-09-25 三篇八單元（需求、邊界、併發、等待、失敗、證據、效能、交付）已由 2026-09-30 的 [Flow Investigation Curriculum](curriculum-flow-investigation.md) 取代。本版不推翻該次學習定位，只使 baseline、scope、內容與可用教材一致。
