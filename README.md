# System Design：沿著系統路徑，理解問題與設計

一套可直接學習的 HTML 課程。從畫面看到的現象開始，追蹤請求與資料，用證據縮小問題範圍，再操作模型比較設計的機制、收益、代價與驗證。

## 八個問題

1. 一個按鈕到底發生了什麼？
2. 問題到底壞在哪一層？
3. 系統為什麼會變慢？
4. 為什麼要快取？
5. 為什麼要佇列？
6. 資料為什麼看起來不一致？
7. 系統出錯時怎麼知道？
8. 找到問題以後，要怎麼改？

每章有觀察操作、必要機制閱讀與另一個領域的 Transfer；最後在案件文件流程中加入五組現象，整合設計判斷。導航完全開放，沒有分數或解鎖。

## 學習範圍

現在學：請求與回應、輸入／輸出與證據、等待、讀取副本、工作交接、資料版本、設計代價及重新驗證。

已接觸 AI 協作的學習者不需重學工具操作；HTTP、快取、佇列與資料傳遞仍會解釋。完整交易隔離、重試／冪等工程、共識、分割、多區域、遷移與部署策略留後續課程。AI 協作、模型訓練、RAG／MCP、雲端認證及面試評分不構成本課核心。

模擬數字與資料都是合成教學假設，不代表真實產品效能；不連接真實 API。

## 本機執行

需要 Node.js 22、pnpm 11.19.0。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm exec vite preview --config vite.learning.config.mjs
```

網址使用 `/agent-system-design-learning-map/#/`。例如 `#/cache/reason` 可直接進入必要閱讀；重新載入保持可用入口及已保存的實驗。

實驗設定、基準、自由筆記與造訪位置只保存在目前瀏覽器；不傳到伺服器，不把造訪當學會。重設僅影響目前案例。Teaching 與 Transfer 分開保存；Final 的設計選擇跨現象保留，也能整體重開。私人 Learning Handoff 請留 private storage，不 commit 到公開課程。

## 文件與實作

- `docs/curriculum-proposal.md`：現行 baseline、scope、八章學習問題與 review。
- `docs/canonical/flow/`：現行 instructional source of truth。根層舊 canonical briefs 僅歷史參考。
- `docs/source-strategy.md`：來源角色、核讀範圍與限制。
- `docs/interaction-storyboard.md`、`docs/learning-copy.md`：互動與文案契約。
- `docs/implementation.md`：架構與 Technical QA／Human Learning Review 狀態。
- `learning/course.mjs`、`lesson-content.mjs`：課綱與畫面內容。
- `learning/experiment-model.mjs`：純函式模型及有限控制項。
- `learning/experiment-storage.mjs`：瀏覽器實驗保存與安全回退。
- `learning/components/FlowInvestigationLab.vue`：局部證據、狀態、關係及比較介面。
- `tests/`：可觀察的參數→狀態→後果、資料保存及路由契約。

方法依 [learning-map](https://github.com/gcake119/learning-map) main `9e62bb7`；互動參考 [system-design-simulator](https://github.com/gcake119/system-design-simulator)，不複製評分、完整元件庫或 UI。

Technical QA 不是教學效果證明。下一步是實際 Human Learning Review。

## License

MIT。
