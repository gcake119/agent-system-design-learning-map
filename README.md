# Agent System Design 互動式學習地圖

一套 Vue 互動教材，地圖只負責章節導航，不另設純簡報模式。

七個章節、36 個教學頁面：Agent Loop、Context Management、Reliability / Guardrails、Observability、Evaluation、Cost / Latency、Multi-Agent。Tool Calling、State、Retrieval / RAG 納入對應章節。

每頁包含：具體問題 → 情境圖解 → 一個主要操作或兩個可比較選項 → 結果與白話說明。術語在體驗後介紹。全部章節自由閱讀，不計分、不解鎖、不使用控制台式參數設定。

操作按鈕直接執行動作並更新圖解，沒有上一頁／下一頁按鈕或方向鍵翻頁。結果下方呈現接續情境與可執行動作。「回到上一步」依操作歷史還原圖解、回饋與選擇，包括跨情境、跨章及比較選項。切換地圖／直接網址或重新整理會清空這段暫存操作歷史。

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

- `learning/chapters.mjs`：共用章節、場景、操作與回饋資料。
- `learning/App.vue`：地圖、動作驅動情境、回到上一步及閱讀位置。
- `learning/interaction.mjs`：動作轉移與可還原的互動狀態。
- `learning/style.css`：紙白底、低彩度、響應式圖解。
- `tests/chapters.test.mjs`：內容契約、書籤與單一模式驗證。

首頁為地圖；`#/learn/loop/1` 等 hash 網址可直接分享。閱讀位置使用 `agent-reading-position-v2` 保存，不沿用舊版評分／解鎖紀錄。刷新會重設本頁操作，保留閱讀位置。資料全部為教學假設，不連接真實 API。

舊版 Slidev 與實驗控制台原始檔暫留作歷史參考，但不再建置或公開提供入口；新版以本文件及 `docs/guided-learning.md` 為準。
