# Implementation Plan — Learning Map v2

> 日期：2026-09-25
> 狀態：Implementation started
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
