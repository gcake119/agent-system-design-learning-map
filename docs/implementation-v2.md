# Implementation Plan — Learning Map v2

> 日期：2026-09-25
> 狀態：Technical QA PASS（2026-09-26）；待 Human Learning Review
> Branch: `learning-map-v2`
> Source of truth: confirmed curriculum → canonical content → cross-unit review → interaction storyboard → learning copy

## Strategy

舊版 production UI 不直接逐段修改。v2 在獨立 branch 重建 learning experience，保留 Vue / Vite / pnpm 與 GitHub Pages 基礎。

第一個 implementation slice 先建立：

1. v2 course shell / map；
2. Unit 1–2 的可操作 lesson flow；
3. shared stage primitives；
4. deterministic synthetic teaching data；
5. route / restart / reduced-motion 基礎；
6. tests 驗證 curriculum metadata、route、interaction state。

通過後再擴到 Unit 3–8 與 final transfer。

## Architecture

```text
learning/
  v2/
    course.mjs          # 8 units + stage metadata
    stage-data.mjs      # synthetic deterministic states
    interaction.mjs     # pure state transitions
    LearningMapV2.vue   # shell / navigation
    StageRenderer.vue   # stage composition
    stages/             # interaction-specific views where needed
    v2.css
```

`RouteShell.vue` 先讓 `#/v2` 路由進新版；舊版路由保留，直到 v2 QA 完成。

## Content / view separation

- learner-facing wording 由 `course.mjs` / data files 提供；
- interaction state transitions 優先 pure functions；
- Vue components 負責呈現與事件；
- synthetic numbers / assumptions 明示；
- 不把 canonical research prose 塞進 component template。

## QA gates

### Slice QA
- build；
- node tests；
- direct route；
- back / restart；
- mobile layout；
- keyboard / focus；
- reduced-motion；
- deterministic state transitions。

### Final technical QA
Unit 1–8 + integrated transfer 完成後再跑完整矩陣。

### Human Learning Review
第一版可實際學習後才開始；記錄看不懂、術語太快、操作意圖不清、transfer 卡住的位置。


## First end-to-end implementation checkpoint — 2026-09-25

已完成 learner-facing first pass：

- Unit 1–8 都有至少三個可操作 stages；
- Unit 1–8 皆包含 transfer stage；
- final integrated transfer 已實作五個逐步事故；
- v2 使用獨立 `#/v2` route，不覆蓋 legacy UI；
- first-use terminology 有 plain-language definition；
- automated tests 已加入完整 unit coverage、transfer presence、final route、term definition checks。

### 下一步：local execution + interaction / visual QA

GitHub connector 可以提交程式與檢查 repository state，但本階段需要實際：

1. checkout `learning-map-v2`；
2. `pnpm install --frozen-lockfile`（若 lockfile 已一致）；
3. `pnpm test`；
4. `pnpm build`；
5. 啟動 dev server，逐路由檢查 `#/v2`；
6. desktop / mobile / keyboard / reduced-motion QA；
7. 檢查 Vue template compile、direct-route fallback、GitHub Pages base path；
8. 依實際畫面修正互動密度與視覺層級。

這是適合交接 Codex 的 checkpoint；QA findings 回寫本文件，再決定是否 merge / replace legacy route。


## Interaction architecture correction — 2026-09-26

使用者指出目前 option-card / text-feedback 為主的互動，無法把「單一情境」和「系統參數／元件造成的影響」連結起來。此 finding 接受。

參考 `gcake119/system-design-simulator` 後，互動方向改為 **simulator-linked learning**：

- 情境改變必須進入 simulation model；
- learner 改參數／元件／policy 後，system graph / metrics / state 一起改變；
- consequence 直接標在 node / edge / state；
- trade-off panel 顯示改動帶來的收益與代價；
- 不繼續 polish 現在的選項卡 UI。

新的 reference implementation 先做兩章：
1. Unit 3 Concurrency Simulator；
2. Unit 7 Workload / Bottleneck Simulator。

通過 Human Learning Review 後再擴到其他單元。

詳見 `docs/interaction-redesign-v0.2.md`。


## Technical QA — 2026-09-26

- Repository：`gcake119/agent-system-design-learning-map`。
- Branch：`learning-map-v2`；同步後 QA 基準 HEAD：`0566686`（`origin/learning-map-v2`）。
- 原本本機分支停在 `3077cf7`，落後遠端 73 個提交，另有舊版選項頁與情境圖的未提交修改。經使用者確認捨棄後，於獨立 worktree 驗證遠端版本；未合併 `main`，未刪 legacy UI。
- `pnpm install --frozen-lockfile`：PASS。
- `pnpm test`：94／94 PASS（基準 91／92；修正後新增 2 項回歸檢查）。
- `pnpm build`：PASS，64 modules transformed；`git diff --check`：PASS。

### Browser QA matrix

| 範圍 | 實際檢查 | 結果 |
| --- | --- | --- |
| Desktop 1280×800 | `#/v2`、Unit 1–8 各代表 stage、Final 五個事故；逐一改控制項並比較可見結果 | PASS；13／13 代表情境有 system state／metric 變化，無水平溢出 |
| Narrow desktop 900×700 | Unit 1–8 初始 stage、Final 五事故；滑桿的 accessible name | PASS；無水平溢出或無名滑桿 |
| Mobile 390×844 | Unit 1–8 全部 31 個 stages（含八個 Transfer）、Final 五事故與逐步控制項 | PASS；36／36 routes 有畫面，無水平溢出；Transfer 換 domain context |
| Interaction | Unit 5 將 timeout 調至 10%，進下一段保留 10%；再設定 retry＝3，provider calls 1000→1300、重複效果 0→50 | PASS；各章控制項逐段解鎖，Final 直接使用 simulator |
| Routing／鍵盤 | 直接開 `#/v2` 與 stage、reload、錯誤 route；換頁後焦點進新 h1；滑桿鍵盤 End；按鈕狀態 | PASS；未知 route 有返回地圖入口 |
| Reduced motion／Pages | 瀏覽器模擬 `prefers-reduced-motion: reduce` 後 transition 為 0s；build 的 JS／CSS 使用 `/agent-system-design-learning-map/` base，`404.html` 與 `index.html` 相同 | PASS；文字與結果仍可見 |

### 修正

1. `labFor()` 補回 unit 的 simulator component，消除 metadata 契約造成的測試失敗。
2. 修正 Queue／Rollout UI 自動替換殘留的 `s.arrival`、`s.schema` 字面文字；Range 加入可讀標籤。
3. 第五章首段移除提前透露 retry／冪等的說明，後續控制項依 stage 出現。
4. 未知 v2 route 改為明確錯誤頁；hash 導覽後焦點移至主標題。
5. Transfer 開場不直接提示機制答案；Transfer 不再顯示選項卡式答案，學習者改操作同一組 simulation primitives 並自行回應問題。
6. 修正 rollout 合成模型：在明示的均勻流量混合假設下，不相容契約只影響「舊版流量 × 新版暴露」的交集；共用 schema 提前收縮則影響仍在運作的舊版。移除缺乏依據的固定 35% 新版受影響比例，並補 parameter→consequence 測試。

### Remaining findings／判定

- **Technical QA：PASS。** 此判定只涵蓋本地程式、路由、模擬器基本因果、可操作性與上述瀏覽器矩陣，不等於教學內容已通過真人理解測試，也不等於正式部署驗收。
- 非 Transfer 段落仍保有選項式 reflection，雖然 simulator 是主要操作面，但其題目與上方參數變化是否足夠連動，需要 Human Learning Review 觀察。不要以自動測試將此判成學習效果 PASS。
- Rollout 模型假設舊版使用者比例與新版流量比例互補、流量均勻混合；真實系統的舊 consumer、共享資料和路由策略可能不同。畫面與測試數值僅是 deterministic synthetic teaching model，不代表真實部署故障率或雲端產品效能。
- 請真人逐章觀察：學習者是否知道要改哪個控制項、能否說出 metrics 與 reflection 的關係、術語是否仍過密，以及 transfer 能否在沒有選項答案時獨立推理。完成本次 Technical QA 後停止，等待 Human Learning Review。
