# Agent System Design 互動式學習地圖

Vue 互動學習介面 + Slidev 簡報，共用章節資料與紙白／低彩度視覺。首頁提供獨立探索地圖；本輪完成 Agent Loop 的「設定 → 執行 → 回饋 → 回到地圖」情境。其他章節目前只有簡報預覽，不宣稱已具備完整互動課程。

- `/`、`/#/map`：探索地圖
- `/#/loop`：Agent Loop 情境實驗
- `/slides/`：原有 21 張簡報

## 本機執行

使用 Node.js 22 與 pnpm 11.19.0（版本固定於 `packageManager`）。

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` 啟動學習介面；`pnpm dev:slides` 獨立啟動 Slidev。跨模式連結以正式部署路徑為準，本機整合檢查請使用建置結果。

## 建置

```bash
pnpm test
pnpm build
```

輸出位於 `dist/`。推送到 `main` 後，GitHub Actions 會自動建置並部署 GitHub Pages。

建置會產生 `404.html`，讓 GitHub Pages 的章節網址重新整理時仍能載入簡報。

## 驗收

`pnpm test` 檢查情境執行引擎、96 組條件的有限終止、學習完成判定、既有 Context／Profiler 與簡報導航。詳細流程見 `docs/interactive-pilot.md`。測試與建置通過不等於產品體驗驗收。

互動介面的「情境已通過」需安全完成或交接，並答對結果理解題；只表示這個練習通過，不代表掌握整章。舊簡報的「已瀏覽」獨立計算，不會轉成完成紀錄。進度僅保存於此瀏覽器 localStorage。所有案件、回應、費用與延遲皆為教學假設，不連接真實 API。

## 內容架構

- `learning/`：Vue 學習介面與可測試的情境執行引擎
- `vite.learning.config.mjs`：學習網站建置
- `data/topics.mjs`：雙模式共用章節資料
- `slides.md`：簡報主線與每頁文案
- `components/`：互動式教學元件
- `style.css`：整套視覺系統
- `.github/workflows/deploy.yml`：GitHub Pages 部署

## 互動元件

- Agent Loop 模擬器
- Context Window 模擬器
- Reliability 故障實驗室
- Agent Trace Viewer
- Evaluation 分類題
- Cost / Latency Profiler

## GitHub Pages 設定

第一次部署前，請在 repository 的 **Settings → Pages → Build and deployment** 將 Source 設成 **GitHub Actions**。
