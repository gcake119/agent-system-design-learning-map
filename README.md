# Agent System Design 互動式學習地圖

以 Slidev 製作的互動式簡報，從 Agent Loop 開始，依序理解 Context Management、Reliability、Observability、Evaluation、Optimization 與 Multi-Agent。

## 本機執行

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

輸出位於 `dist/`。推送到 `main` 後，GitHub Actions 會自動建置並部署 GitHub Pages。

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
