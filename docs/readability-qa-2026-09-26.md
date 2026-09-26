# 介面易讀性 Technical QA

日期：2026-09-26。基準：`6c7e9057d774bbf84fe3454cbea1badafca78ba6`，開始時工作目錄乾淨。

## 現行規範與決策核對

- 本 worktree 未找到 AGENTS.md、DESIGN.md、PRODUCT.md、docs/decisions 或 openspec；遵守交接及使用者提供的全域 AGENTS.md。
- 依 README、docs/interaction-redesign-v0.2.md 與 docs/implementation.md 的 simulator-linked learning 方向，保留操作 → 系統變化 → 反思的流程與教學用合成模型。
- 現行入口為 `#/`，實作在 `learning/`。文件內的 v2 branch／路徑描述含歷史狀態，不恢復已移除的 legacy 介面。
- Decision context：Level 1，套用現有風格的呈現改善；不新增架構、工作流程或教材決策，不需 ledger／ADR／archive 回填。
- codebase-memory architecture 查詢回報 Transport closed；未重建或上傳外部索引。

## 渲染發現與修正

- 原輔助標籤多為 10～12px；提高到 14px，控制標籤／按鈕為 15px，按鈕至少 44px 高。反思選項為 16px，指標值為 22px。
- 維持紙色／綠色／珊瑚色語彙，加深輔助文字與警示文字，增加行距、分組間距及清楚的鍵盤焦點。
- 正文限制閱讀寬度，手機標題使用 32px／1.4 行高，導覽及操作列能換行。
- 手機系統圖改為直排並旋轉既有箭頭，保留節點順序與單向／雙向關係。Final 在窄桌面也直排。
- Desktop Evidence 的圖原有 732px 內容塞入 677px 容器；證據面板移至圖下方後，圖的內容／容器均為 1034px。
- Rollout 的 10% 區段無法容納原文字；將相同比例文字移到條外，0% 與 100% 亦完整可讀。模型及輸入值未修改。

## 驗證

- `pnpm install --frozen-lockfile`：通過。首次 sandbox 安裝遇 DNS 限制；允許的套件安裝重試成功，最後再次驗證通過。
- `pnpm test`：49／49 通過。
- `pnpm build`：通過，37 modules；`git diff --check`：通過。
- 真實 Codex in-app browser：Desktop 1280×800、Mobile 390×844；首頁、八章首段、Final 皆渲染。頁面寬度未超出 viewport，控制與圖表標籤至少 14px。
- Desktop 與 Mobile 皆透過「注入下一個事故」依序走完 concurrent → unknown → backlog → provider → version；無頁面水平溢出。
- Narrow desktop 900×700：Final 圖內容與容器均為 845px，無隱藏節點。
- 操作：自由入場更新容量規則；Final 條件式更新將不合法狀態 1 → 0；rollout 滑桿鍵盤 Home／End 顯示 v1／v2 的 100／0 與 0／100。
- 瀏覽器 error logs：空。截圖位於 `artifacts/readability/`，含 desktop／mobile 各代表頁及手機五事故。
- 本次是呈現與基本操作 Technical QA；不是 Human Learning Review，也不是部署驗收。

## 保留為發現

- CONTRIBUTING.md 描述跨主題的 Skill repo，與目前 course repo 定位不一致。
- docs/implementation.md 部分歷史 QA 與舊路由敘述未同步現行 main；須另行整理，不能直接當成現行驗收結果。
- Final 的 hotspots 依事故固定標示，並未隨控制項解除；提示要求觀察「指標和節點狀態是否一起改善」，兩者可能有語意落差。本次保留模型與教學文案，未判定學習效果。

上述 QA checkpoint 時尚未 commit、push、merge 或 deploy；未開始 Human Learning Review。

## 授權交付

使用者於同日授權 commit、push、merge。推送前再次執行 frozen-lockfile 安裝、49／49 tests、build 與 diff check，全部通過。介面修正提交為 `8ad6aa5`；QA 紀錄與截圖另作獨立提交。合併 main 將觸發既有 GitHub Pages workflow；實際 PR、合併與 workflow 結果以 GitHub 紀錄為準。Human Learning Review 未開始。
