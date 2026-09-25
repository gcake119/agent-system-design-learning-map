# 貢獻指南 / Contributing Guide

## 中文

感謝你想改善 `learning-map`。

這個 repo 定義的是跨主題可重用的教材設計與學習陪跑方法。適合提交到這裡的變更，應該能對不同主題或不同教材產生共通價值。

### 適合貢獻的內容

- Curriculum Design、Canonical Content、Interaction Design 等共用流程改善。
- 新的通用 interaction pattern。
- Learning Handoff 與個人化學習流程改善。
- README、範例、安裝與使用說明。
- 能跨主題使用的 QA、accessibility 或 implementation guidance。
- 修正文意不清、矛盾或不可執行的 Skill 規則。

### 不適合直接放在這個 repo

- 某一門課專屬的教材內容。
- 個人 Learning Handoff、學習紀錄或 Learner Path。
- 只適用單一學習者的教材調整。
- 未取得適當授權的第三方教材、圖片、文字或其他資產。

單一課程的改善應提交到該 course repo。個人學習資料應留在 private storage。

### 建議流程

1. 先開 issue 說明問題、使用情境或希望改善的地方；小型修正可直接開 PR。
2. Fork 本 repo 並建立清楚命名的 branch。
3. 修改時保持 `SKILL.md` 為跨主題通用核心；domain-specific 規則應以 optional overlay 或範例呈現。
4. 若修改 Skill 行為，也同步檢查 README 是否需要更新。
5. PR 請說明：
   - 問題是什麼；
   - 修改了什麼；
   - 為什麼具有跨主題可重用性；
   - 是否影響既有 workflow；
   - 如何驗證。
6. 避免在 PR、issue、fixture 或 screenshot 中加入私人學習紀錄。

### 從個人學習經驗回饋

如果某個改善來自自己的 Learning Handoff：

1. 先判斷它是個人需求還是可泛化的方法問題。
2. 移除姓名、學習歷史、私人 repo 資訊及其他可識別內容。
3. 將問題重新描述成一般化的教材／Skill 問題。
4. 只提交理解改善所必要的證據。

### 授權

提交貢獻代表你同意你的貢獻依本專案的 MIT License 發布，並確認你有權提交相關內容。

---

## English

Thank you for contributing to `learning-map`.

This repository defines reusable, topic-agnostic methods for curriculum design, interactive learning, and learning handoff. Contributions here should provide value across multiple subjects or courses.

### Good contributions

- improvements to reusable curriculum/content/interaction workflows;
- general interaction patterns;
- Learning Handoff and personalized-learning workflow improvements;
- documentation and examples;
- cross-domain QA, accessibility, or implementation guidance;
- fixes for unclear, contradictory, or impractical skill rules.

### Keep elsewhere

Do not commit:

- course-specific teaching content that belongs in a course repository;
- personal Learning Handoffs, learner history, or Learner Paths;
- adaptations useful only to one learner;
- third-party material or assets you do not have the right to redistribute.

### Suggested workflow

1. Open an issue for substantial changes; small fixes may go directly to a PR.
2. Fork the repository and create a focused branch.
3. Keep `SKILL.md` topic-agnostic. Put domain-specific guidance in optional overlays or examples.
4. Update README when user-facing behavior changes.
5. In the PR, explain the problem, change, cross-topic value, workflow impact, and validation.
6. Do not include private learning records in issues, PRs, fixtures, or screenshots.

### Learning-derived contributions

When an improvement comes from a private Learning Handoff, de-identify it and restate it as a reusable course/skill problem before contributing.

### License

By contributing, you agree that your contribution will be licensed under this project's MIT License and confirm that you have the right to submit it.
