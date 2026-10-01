# Technical QA — course refactor v0.4

> 2026-10-02。Branch：`codex/course-refactor-review`。基準：origin/main `2b1f028`。
> Technical QA：**PASS WITH FINDINGS**。Ready for Human Learning Review：**YES**。
> Current gate：Human Learning Review（尚未執行）。沒有 merge 或正式部署驗收。

## 實際執行

| 項目 | 結果與範圍 |
| --- | --- |
| Install | PASS；`pnpm install --frozen-lockfile`；Node 22.23.2、pnpm 11.19.0 |
| Tests | PASS；`pnpm test`，15／15；參數→輸出／關係、未知結果、容量與時效、儲存隔離／損壞／禁用、路由與造訪紀錄 |
| Build | PASS；`pnpm build`，21 modules；GitHub Pages base `/agent-system-design-learning-map/`；產出的 index／404 HTML 相同 |
| Diff | PASS；`git diff --check` |
| Browser | PASS；Chromium，local production preview 4173；31 routes × 1440×960／900×800／390×844＝93 組 |
| Route／reload | 首頁、24 小節、5 Final 現象、未知路由；直接進入、reload、前後導航及章節入口 |
| Reading／responsive | 全部 READ 有持續閱讀區、Transfer 有案例；各路由無 horizontal overflow；desktop／mobile 截圖實際檢視 |
| Keyboard／focus | 新 context 首次 Tab→跳至教材→Enter；小節 link Enter→h1；slider End 修改量測 |
| Reduced motion | 模擬 reduce；節點 animation／transition＝0s，版本變化仍可觀察 |
| State | cache 參數、基準、筆記跨 stage／reload；Transfer 分開、重設不刪 teaching；Final 跨現象與 reload 保留設計，重開恢復預設 |
| Progressive controls | 觀察不顯示進階命中比例，必要閱讀後出現 |
| Evidence copy | 點選節點並複製，實際顯示「已複製」；等待非同步結果 |
| Failure／storage | 禁止 localStorage 的獨立 context 仍可操作，顯示不能保存，reload 回預設；同步 worker 失敗不預測成功回應時間 |
| Transfer／Final | 換 domain 與不同工作耗時；同一 Final 設計在五個現象中保留；沒有答案選項或分數 |

瀏覽器腳本及結果：`output/playwright/browser-qa.js`／`browser-qa-results.json`、`browser-qa-supplement.*`、`browser-qa-failure.*`。它們透過 playwright CLI 的 run-code 執行；不是 CI 自動部署驗收。截圖：`desktop-consistency.png`、`mobile-transfer.png`。第一輪檢查曾太早斷言焦點／複製、使用錯誤 label；修正檢查後重跑，不以未完成檢查報 PASS。

## Findings

### BLOCKER

無未解阻斷事項。

### IMPLEMENTATION

已修：資料寫入步驟缺 edge、禁用 storage getter 造成錯誤／儲存提示、同步工作失敗仍顯示正常處理秒數。參數與可見後果已有回歸檢查。

### LEARNING UX

待真人確認：有方向的關係清單能否建立 mental model、閱讀密度、聚焦證據是否容易操作、Final 是否仍暗示方案，以及無選項 Transfer 是否可獨立完成。Technical QA 不判定理解 PASS。

### SUBJECT-MATTER

Cache-Aside 兩次 live fetch 503；沿用 9/25 canonical 已核讀的有限主張，未聲稱本輪重新核讀。模型是合成、有限、確定性的教學關係，不代表真實容量、延遲或外部效果。

### CURRICULUM

已解：9/25 proposal／canonical 與 9/30 confirmed outcome 不一致。保留八章順序；進階機制明確延後。baseline 沒有私人 Handoff／前置完成證據，使用保守可修訂假設；真人開始後再補具體學習證據。

## NOT TESTED

Human Learning Review、正式 GitHub Pages 部署、遠端 CI、Safari／Firefox、實機手機、screen reader、真實 provider 呼叫、真實學習成效及來源全書覆蓋。以上不是此次本機 PASS 的推論範圍。

## Human Learning Review 下一步

由第一章開始：說出正常路徑→改一個條件→指出輸出及證據→說出還不能證明什麼→讀機制→換題。記下具體句子／操作卡點；最終整合前確認 learner 不把「第一個異常」當根因、把「接收」當完成或把命中當新資料。回饋留私人 Handoff，只回寫去識別化 finding。
