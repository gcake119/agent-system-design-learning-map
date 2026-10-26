# Agent System Design Learning Map Mint CI 遷移

## 決策與範圍

第十六個repo，排除十五個已完成repo後重新取得77個個人repo與全部Actions runs，以實際job開始時間排序。flow-radar目前Windows-only，個人profile是動畫產生，lore-forge三jobs均macOS；下一個Linux CI為本repo，原Pages39399075205的deploy在台北2026-10-20 17:13:36開始。source main5656874f7478f7a5f060a19a4b94b285fb29aa76，原runner清單空；host從真正main c19a7abf49aef0e75b3d7d437a2311a74a26494a隔離checkout。

依CONTRIBUTING、curriculum-proposal、implementation及technical-qa的合成教材、瀏覽器本機保存與Technical QA不等於Human Learning Review界線；不改教材、互動、模型、測試、lockfile或課程產品決策。repo未建立decisions ledger，這次僅CI執行位置與既有發布權限分層，沒有新的產品ADR或Spectra archive。

原CI只有main push/manual Pages workflow，使用Node24、pnpm11.19.0、frozen install、原pnpm test及build（含index到404 fallback）；沒有Docker/GHCR或其他部署。原github-pages environment只允許main。保留原main/manual/concurrency及artifact名github-pages，不改environment分支保護；Pages deploy留hosted且needs完整Mint build/test/exact SHA/artifact，僅deploy job有Pages/OIDC，build降為contents:read。configure-pages移至hosted deploy，本課build未使用其outputs。

新增PR main的非發布QA，執行同一組原install/test/build；同repo可信來源用專屬mint-agent-system-design-learning-map，fork留ubuntu24.04。run steps沿原bash -e/pipefail，pnpm test輸出經tee保存但失敗仍失敗。每個heavy/light步驟有900秒名額等待，job60分鐘；不新增測試retry/skip或刪除原門檻。actions setup/upload不宣稱受slot限制。

共享ci-runner UID995/GID984、rootless、原systemd template；全主機CPU300%/MemoryHigh16GiB/Max20GiB/Tasks4096，heavy/light各一、跨repo Docker鎖沿用。Docker64892449/heavy64915236/light64915240原inode保留，CI無sudo/rootful socket/備份路徑權限。專屬pnpm工具與store以run/attempt隔離；沿現有Node24.22.1 cache，不加APT套件。

新收據核對實際Node spec/TAP summary全部pass、至少原15tests且0fail/cancel/skip/todo、exact SHA/tree/runner、index等於404、dist逐檔SHA256；不改dist網站內容。主CI原本沒有browser gate，收據明記not-run-by-original-CI；本機瀏覽器驗證另外記錄，不能冒充Mint/main或人類學習證據。

## 本機已執行與後續驗收

原frozen install、15/15 tests、21modules build成功。原產品/測試/config及其餘檔案blob不變（以manifest核對）。actionlint、bash/python、9共享控制tests、shell身分/class/環境/退出碼與pipefail負面檢查、實際spec/TAP收據正面及wrong SHA/skip/incomplete/fallback負面檢查通過。

依CONTRIBUTING的local production QA，用Chromium153.0.8010.12實測31routes×1440/900/390三viewport＝93組，含reload/無overflow、必要閱讀/Transfer、teaching保存與Transfer隔離、Final跨現象/reload/restart、clipboard、鍵盤skip/focus/slider、禁用storage仍可操作與reload回預設；errors空。desktop/mobile截圖已檢視。外部檢查腳本最初錯把hash導航當新HTTP response、以及未等Vue換頁就查焦點，已修正檢查同步條件後整套通過；沒有改產品或原測試。

原Pages自動發布是本repo自己的行為；上一輪對cybersecurity-learning-map的授權不延伸至本repo。固定installer及完整設定/必要檢查/獨立只讀review完成後，才請使用者執行本機固定安裝並明確確認本輪既有Pages發布。授權前不合併main、不執行Pages dispatch或其他部署。安裝/候選all checks/普通merge/真正main/實際Pages artifact-deployment與公開四檔readback及中央收尾紀錄目前pending，不預先宣稱成功。Human Learning Review、Firefox/Safari/實機手機/真provider均NOT TESTED。
