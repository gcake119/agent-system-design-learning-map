# Agent System Design 互動式學習地圖

一套 Vue 互動教材，地圖只負責章節導航，不另設純簡報模式。

七個單元、79 個互動情境：完整系統、任務推進、適當資訊、可控失敗、證據驗收、量測改善、分工取捨。以「能完成、能信任、能改善」組織課程，Observability 與 Evaluation 整合為證據驗收。

採金字塔原理：先給單元結論與學習目標，再透過情境操作理解理由。每小節有具體學習目標，每單元以新情境檢查能否運用。全部單元自由閱讀，不計分、不解鎖。

操作按鈕直接執行動作並更新圖解，沒有上一頁／下一頁按鈕或方向鍵翻頁。結果下方呈現接續情境與可執行動作。「回到上一步」依操作歷史還原圖解、回饋與選擇，包括跨情境、跨章及比較選項。切換地圖／直接網址或重新整理會清空這段暫存操作歷史。

深入內容依「原則 → 機制 → 比較 → 邊界 → 設計」編排，提供 24 個方案比較案例與 7 份單元設計。可展開證據、預測結果，並在部分案例切換條件。

每單元可保存方案、四項設計規則、理由、代價與重新評估條件。`#/design` 彙整七份設計並下載 Markdown；筆記只存於目前瀏覽器，切換主題前需按保存。資料不會傳到伺服器。

## 開發與部署

使用 Node.js 22、pnpm 11.19.0。

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

`main` 經 GitHub Actions 部署 `dist/` 至 GitHub Pages，Pages Source 必須為 GitHub Actions。

## 結構

- `learning/curriculum.mjs`：課綱、結論、單元與小節目標、應用情境。
- `learning/chapters.mjs`：案例庫、課程組合與舊書籤相容。
- `learning/App.vue`：地圖、動作驅動情境、回到上一步及閱讀位置。
- `learning/interaction.mjs`：動作轉移與可還原的互動狀態。
- `learning/style.css`：紙白底、低彩度、響應式圖解。
- `tests/chapters.test.mjs`：內容契約、書籤與單一模式驗證。

首頁為地圖；`#/learn/loop/1` 等 hash 網址可直接分享。閱讀位置使用 `agent-reading-position-v2` 保存，不沿用舊版評分／解鎖紀錄。刷新會重設本頁操作，保留閱讀位置。資料全部為教學假設，不連接真實 API。

舊版 Slidev 與實驗控制台原始檔暫留作歷史參考，但不再建置或公開提供入口；新版以本文件及 `docs/guided-learning.md` 為準。
