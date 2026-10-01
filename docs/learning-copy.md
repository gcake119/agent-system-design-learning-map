# Learning Copy — Flow v0.4

來源：`canonical/flow/` → `interaction-storyboard.md`。螢幕文字集中在 `learning/course.mjs`、`lesson-content.mjs` 與 `experiment-model.mjs`，不是直接整段搬 canonical。

- 開場：具體現象 → 觀察指定位置 → 說明機制 → 術語及例子 → 改條件 → Transfer。
- 觀察：「改一個條件，先看哪個節點的輸出改變，再用證據說明。」
- 節點：「收到／送出／可核對證據」，狀態用「尚未到達、等待、已確認、結果未知、符合／不符合時效」。
- 必讀：「為什麼會這樣」，每段處理一件事，讓 reasoning 與限制連續可讀。
- 比較：「儲存現在作基準」、「與基準比較」，保留同一個問題的模型。
- 回饋：顯示後果與證據，沒有「答對／答錯」或 AI 正確答案。
- 重設：「重設目前實驗」，說明不刪其他章及造訪位置。
- Transfer：「換一個問題」，只給需求、狀態與限制，不先寫該用哪個 pattern。
- 最終整合：「下一個現象」，不用「這是某章題」。

術語首次在必要閱讀用白話定義；不假設 learner 已懂 HTTP、latency、throughput、cache hit、queue、worker、replica、projection、log、metric、trace。進階 term 不以 optional deep dive 塞回 scope。

不寫「找到第一個異常＝找到根因」、「HTTP 200＝業務全部完成」、「沒產物＝一定失敗」、「命中＝最新」。數字標示合成假設。瀏覽紀錄不稱理解程度。
