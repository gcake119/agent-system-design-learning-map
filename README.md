# Agent System Design 互動式學習地圖

以 Slidev 製作的互動式簡報，從 Agent Loop 開始，依序理解 Context Management、Reliability、Observability、Evaluation、Optimization 與 Multi-Agent。

## 本機執行

使用 Node.js 22 與 pnpm 11.19.0（版本固定於 `packageManager`）。

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

## 建置

```bash
pnpm test
pnpm build
```

輸出位於 `dist/`。推送到 `main` 後，GitHub Actions 會自動建置並部署 GitHub Pages。

建置會產生 `404.html`，讓 GitHub Pages 的章節網址重新整理時仍能載入簡報。

## 驗收

`pnpm test` 檢查迴圈終止、Context 計算、Profiler 組合與章節導航目標。瀏覽器驗收另需檢查封面、地圖跳轉、頁尾導航、互動操作與章節網址重新整理。

學習進度僅記錄於目前瀏覽器的 localStorage，表示「已瀏覽」，不代表通過測驗。模擬器的 token、費用與延遲皆為教學假設，並非實測或供應商報價。

## 內容架構

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
