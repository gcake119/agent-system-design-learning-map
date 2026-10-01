# HTML course implementation — v0.4

> 完成日期：2026-10-02。分支：`codex/course-refactor-review`。
> 依序依據：最新版 learning-map → curriculum-proposal → canonical/flow → storyboard → learning-copy。
> 本文件取代 9/25 v2 的實作計畫。歷史內容保留在 Git；舊 simulator 檔案不在目前入口匯入鏈。

## 架構與資料責任

| 檔案 | 責任 |
| --- | --- |
| `learning/course.mjs` | 八單元、三小節、學習問題與路由 metadata |
| `learning/lesson-content.mjs` | 必要閱讀、第一次術語解釋、來源及換題案例 |
| `learning/experiment-model.mjs` | 有限 controls、參數校正、純模型、節點／方向／量測／限制 |
| `learning/experiment-storage.mjs` | 本機實驗、基準、筆記；teaching／transfer／final 分開 |
| `learning/progress.mjs` | 造訪位置及 Final 位置；不代表理解或通過 |
| `learning/components/FlowInvestigationLab.vue` | 操作、聚焦證據、直接顯示後果與比較 |
| `learning/LearningMap.vue` | 文件式導航、連續閱讀、hash route、換頁焦點 |
| `learning/final-transfer.mjs` | 五個中性整合現象；不提供機制答案或評分 |
| `learning/style.css` | 課程識別、閱讀階層、responsive、focus、reduced motion |

## 教學模型契約

參數變更 → 確定性模型 state → 節點輸出、關係及 metrics 同時更新。數字是明示假設的合成案例，不是效能 benchmark。

- 路徑：分開去程、寫入與回程，不把所有儲存系統排成必經鏈。
- 定位：正常輸入與異常輸出一起判斷；合法拒絕不代表該節點故障。
- 延遲：只在本課明示的串行路徑內加總。
- 副本：命中比例降低來源讀取量；刷新與時效要求另外判斷。
- 背景工作：分開接收與完成；容量改變未完成量，早回覆不會增加處理能力。
- 一致性：選擇讀取來源、更新延遲、觀察時間與時效要求；沒有零延遲保證。
- 證據：換紀錄視角不會改變事故本身；未知結果需要額外收據查證。
- 整合：保持同一設計，加入新現象，再核對收益、代價及外部未知結果。

## 狀態與導航

觀察與必要閱讀共用 teaching state；換題使用獨立 transfer state，避免帶入已解完答案。Final 五個現象保留同一設計，重新開始清除 Final 設定與筆記。當地 storage 被禁止時仍可操作，但明確告知 reload 不保留。

hash 路由可直接開啟與重新載入；production base 為 `/agent-system-design-learning-map/`。章節與小節直接入口、上一段／下一段、返回地圖及重設都有明確行為。換頁焦點移到 h1；跳至內容入口供鍵盤使用。code block 是證據紀錄，提供一鍵複製與失敗提示。

## 驗證與下一關

詳見 `docs/technical-qa.md`。Technical QA 不代表學習成效；下一關是 Human Learning Review。真人應指出看不懂的句子、觀察目標、過早術語、無法獨立完成的換題及模型可能造成的誤解。
