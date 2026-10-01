# Flow Investigation — current handoff

> 2026-10-02。已完成 course refactor implementation；當前判定與證據見 `technical-qa.md`。

9/30 確認的最高學習能力與八單元順序保留。新的 learner baseline、scope contract 及逐單元檢查以 `curriculum-proposal.md` 為準。Canonical source of truth 是 `canonical/flow/`。

## 已完成

- 內容、模型、儲存與 view 分離，替換固定 scenario 按鈕式體驗。
- 有限 controls 改變節點輸出、實際關係方向及可比較量測。
- 觀察 → 必要閱讀 → 換題應用；逐步開放 controls，同一 teaching state 保留。
- Transfer 換 domain、需求與證據；Final 使用同一設計面，加入五個現象。
- 證據位置聚焦，正常輸入／異常輸出／合法拒絕／未知結果分開。
- 導航、重設、reload、本機筆記、儲存失敗提示與 reduced motion。
- tests 驗證教學因果與儲存隔離；production build 與 Chromium 檢查。

## Human Learning Review

不可用點擊或造訪判定理解。逐章要求 learner 畫出正常路徑、指出第一個異常輸出、說明需要哪份證據與證據不能證明什麼。再檢查能否解釋設計收益／代價，以及換 domain 後能否自己推理。

重點觀察：節點與有方向的關係清單能否建立 mental model；必要閱讀長度是否適合；Final 的中性現象是否仍暗示答案；合成數字是否被誤當真實效能。真人回饋與專案私密資訊保留私人 Learning Handoff，只將去識別化的課程 finding 回寫公開 repo。
