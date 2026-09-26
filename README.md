# System Design 互動式學習地圖

用互動模擬學 System Design。改變需求、系統元件與參數，直接觀察資料正確性、等待時間、失敗、瓶頸與版本相容性如何跟著改變。

課程主體是 **System Design reasoning**；AI 可以協助整理需求、提出假設、比較方案與驗證設計。

## 直接使用

不需要安裝 Skill，也不需要先會寫程式。

課程從八個問題展開：

1. 到底要做到什麼？
2. 這件事誰負責？
3. 兩個人同時改資料會怎樣？
4. 誰要等到哪一步？
5. 出錯後，我現在到底知道什麼？
6. 我憑什麼說做到了？
7. 到底是哪裡撐不住？
8. 新版怎麼換上去，舊東西才不會壞？

每章都有小型 simulator。你會改 workload、元件或 policy，再觀察 system state、metrics 與 trade-off 如何改變。最後用新的案例做 Transfer，不靠背固定架構答案。

## Fork 後可以做什麼？

Fork 後可以：

- 換成你熟悉的案例；
- 針對不懂的概念增加說明與實驗；
- 調整課程順序與深度；
- 加入自己的專案作 Transfer；
- 搭配 [learning-map Skill](https://github.com/gcake119/learning-map)，依實際學習回饋持續重構教材。

個人的 Learning Handoff、學習紀錄或 Agent 對學習狀況的判斷，建議留在 private repo／私人檔案，不要 commit 到公開 fork。

## 本機執行

需要 Node.js 22、pnpm 11.19.0。

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

## 教材與設計來源

主要內容參考 ByteByteGo Big Archive — System Design 2025 Edition、*Designing Data-Intensive Applications*、System Design Primer、MIT 6.5840、CMU 15-440、AWS Well-Architected 與 Azure Architecture Center。

互動方式參考 [system-design-simulator](https://github.com/gcake119/system-design-simulator)，但本課程使用簡化、deterministic 的 synthetic teaching models；模擬數字不代表真實產品 benchmark。

完整來源角色與驗證方式見 `docs/source-strategy.md`。

## Repo 結構

- `learning/v2/`：目前課程與 simulator 實作
- `tests/v2-learning-map.test.mjs`：simulation 與 learning-flow tests
- `docs/canonical/`：Canonical Content 與 Content Review
- `docs/curriculum-proposal.md`：課綱與學習目標
- `docs/source-strategy.md`：教材來源
- `docs/interaction-redesign-v0.2.md`：互動設計
- `docs/implementation-v2.md`：Technical QA 紀錄

## License

MIT License。
