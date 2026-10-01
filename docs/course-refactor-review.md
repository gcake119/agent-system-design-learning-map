# Course refactor review — 2026-10-01

Skill：learning-map main `9e62bb7`；base：`2b1f028`。Decision context：Level 2，共用課程導航／互動契約。沒有 repo AGENTS、DESIGN 或 ADR index；採確認的 flow curriculum 與當前使用者委派。新契約記在課綱、storyboard、implementation；不建立多餘 ADR／Spectra migration。

## Review findings 與修正責任

| 分類 | Finding | 處理層 |
| --- | --- | --- |
| CURRICULUM | proposal、README、canonical 仍描述 9/25 舊課綱 | 先更新 proposal，保留 9/30 outcome，再建立 flow canonical |
| SUBJECT-MATTER | 線性圖暗示 cache、DB、replica、projection 是依序必經；API 合法驗證拒絕被稱為 API 異常 | 修內容與模型：有標籤的實際分支／回程、輸入責任及合法拒絕 |
| SUBJECT-MATTER | 沒有產物不能推出工作已失敗；副本落後不能一律判錯 | 區分未知結果與失敗；加入時效需求 |
| LEARNING UX | 情境按鈕直接寫故障位置；Transfer 仍載入原 teaching case | 情境用中性編號，Transfer 換需求及證據；閱讀後才推理 |
| IMPLEMENTATION | stage 未傳給 flow lab；缺重設／實驗儲存；Final 固定熱點與舊進階機制 | 分離內容、純模型、儲存、view；統一 Final 的模型與回退 |
| LEARNING UX | 許多術語及長篇 node 說明同時出現 | 必要 prose 靠近模型；聚焦選定節點，不用假互動隱藏說明 |

## Reference inspected

system-design-simulator main `a212e3713520a58d93c392d236d1895d25b61550`。讀取 README、SimulationControls、MetricsDisplay：設定進入 store，執行後 node metrics／longest path 更新。轉譯為有限 controls、可計算 state、區域性 consequence、focused evidence。沒有複製評分、palette、benchmark 或 exact UI。

## Human review preparation

讓 learner 說出正常路徑，再操作一個變數，指出變化及原因；選下一份能區分假設的證據；讀完必要機制後換 domain。記錄看不懂的具體句子、太早的術語、無法看見的結果、無法完成的 Transfer。私人回饋留在 private handoff；只去識別化後回寫公開課程。Technical checks 不代表理解通過。
