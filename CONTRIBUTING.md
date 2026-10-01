# 課程貢獻指南

這是 System Design course repo；教材、互動、文案與可泛化課程改善放這裡。跨主題方法變更請到 [learning-map](https://github.com/gcake119/learning-map)。

先閱讀 `docs/curriculum-proposal.md` 的 baseline／scope，依 canonical → content review → storyboard → copy → implementation 的順序修改。不得以 UI workaround 掩蓋教材含義問題；必要術語與模型限制須明示。

行為改變測參數、狀態與可見後果。提交前執行 `pnpm install --frozen-lockfile`、`pnpm test`、`pnpm build`，並依 `docs/implementation.md` 做實際瀏覽器 QA。未測項標 `NOT TESTED`。Technical QA 不代替 Human Learning Review。

公開 repo 不保存個人學習史、真實個案、secrets 或未授權第三方原檔。案例與 QA 資料使用合成內容；私人回饋先留私人 handoff，再去識別化成課程 finding。
