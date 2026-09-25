# System Design 互動式學習地圖

用互動模擬學 System Design：改變需求、系統元件與參數，直接觀察資料正確性、等待時間、失敗、瓶頸與版本相容性如何跟著改變。

課程以 **System Design** 為主體；AI Agent 是協助整理需求、提出假設、比較方案與驗證設計的工具。

> v2 目前在 `learning-map-v2` branch 開發與 Technical QA，入口為 `#/v2`。正式合併前，`main` 的舊版教材仍保留。

## 直接使用

如果只是想學習，不需要安裝 Skill，也不需要先會寫程式。

課程從八個問題展開：

1. 到底要做到什麼？
2. 這件事誰負責？
3. 兩個人同時改資料會怎樣？
4. 誰要等到哪一步？
5. 出錯後，我現在到底知道什麼？
6. 我憑什麼說做到了？
7. 到底是哪裡撐不住？
8. 新版怎麼換上去，舊東西才不會壞？

每章會讓你操作一個小型 system simulator。改變 workload、元件或 policy 後，系統狀態與 metrics 會一起改變。沒有計分，也不需要先背架構圖。

## Fork 後可以做什麼？

Fork 這個 repo 後，可以把它變成自己的學習版本：

- 修改或增加案例；
- 針對不懂的概念增加說明與練習；
- 調整課程順序與深度；
- 加入自己的專案作 transfer 練習；
- 搭配 `learning-map` Skill，讓 Agent 依實際學習回饋持續修改教材。

`learning-map` Skill：  
https://github.com/gcake119/learning-map

個人的學習紀錄、Learning Handoff 或 Agent 對學習狀況的判斷，建議保存在 private repo 或私人檔案，**不要 commit 到公開 fork**。

## 教材來源

主要參考：

- ByteByteGo Big Archive — System Design 2025 Edition
- *Designing Data-Intensive Applications*
- System Design Primer
- MIT 6.5840 / CMU 15-440 Distributed Systems
- AWS Well-Architected / Azure Architecture Center

互動方式參考 `gcake119/system-design-simulator`，但本課程使用的是簡化、可重現的教學模型；所有 simulator 數字都是 synthetic assumptions，不代表真實產品 benchmark。

完整來源角色、使用範圍與內容驗證方式見 `docs/source-strategy.md`。

## 本機執行

需要 Node.js 22、pnpm 11.19.0。

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

新版入口：`#/v2`

## 專案文件

- `docs/curriculum-proposal.md`：課綱與學習目標
- `docs/canonical/`：Canonical Content 與 Content Review
- `docs/source-strategy.md`：教材與參考來源
- `docs/interaction-redesign-v0.2.md`：Simulator-linked interaction 設計
- `docs/implementation-v2.md`：實作與 QA 狀態

## License

MIT License。可以 Fork、修改與再發布；請保留原始授權聲明。

若修改來自私人 Learning Handoff，公開回饋或 PR 前請先移除個人資訊。
