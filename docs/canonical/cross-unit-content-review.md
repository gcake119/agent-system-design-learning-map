# Cross-unit Content Review — Flow v0.4

日期：2026-10-01。結果：PASS WITH LIMITATIONS。

Unit 1 建立去回程；2 用證據定位；3 看序列等待；4 比較來源讀取與副本；5 分開接收與完成；6 依用途追版本；7 統整證據盲區；8 修改並重驗。

- Unit 2 的第一個異常不是根因結論；合法拒絕不稱元件故障。
- Unit 3 耗時加總只限明確序列路徑，沒有推導並行 trace 的總耗時。
- Unit 4 的命中減少來源讀取，Unit 6 才根據時間和要求判版本是否可接受。
- Unit 5 的未完成工作包含執行中工作；不假冒精確 queue depth 或 queue age。
- Unit 7 切換證據不改事故，未知結果不等於失敗。Unit 8 回用它而非引入未教進階 mechanism。
- baseline 沒有掌握證據時按 New／needs support 教；不宣稱已學會 BDD、DB theory 或部署。
- 僅保留當前 outcome 需要的術語；共識、完整事務隔離、重試工程、遷移與部署 taxonomy 延後。
- 每章 Transfer 換需求與資料，不能只換標題；Final 不提示章節與方案答案。

原始碼 prose 由 `lesson-content.mjs` 管理，源於各 brief；view 不承載私有學習史。模型標明 synthetic assumptions，來源角色保持分離。Cache-Aside 本次取回失敗，使用舊核讀範圍，屬於透明來源限制。

Human Learning Review 待進行：請檢查 learner 是否能獨立重畫路徑、提出下一份證據、解釋引數後果、保留未知並完成遷移推理。
