# Unit 2：同樣沒反應，問題到底在哪一層？

> Flow canonical v0.4；2026-10-01。取代目前主教材的舊 unit 編號含義；舊檔案僅歷史參考。

## Central Question

同樣沒反應，問題到底在哪一層？

## Learning Objectives

比較正常與實際輸入／輸出，縮小異常範圍並保留根因假設。

## Prerequisites

Unit 1 的去程與回程。

## Core Claims／Reasoning／Required Terminology

### 先固定你期待的結果

症狀（symptom）是使用者看見的現象，例如按儲存沒反應。先寫出正常路徑，再檢查實際走到哪裡。若沒有送出請求，先查畫面事件；若已送出但儲存失敗，才沿後端與資料庫查。

### 異常位置不是根因結論

直接原因（direct cause）是緊鄰結果的因素，例如沒有執行儲存事件。根因（root cause）是更深的形成原因，例如改版後沒有把事件接回按鈕；這需要另外的版本或重現證據。第一個可見異常只縮小調查範圍。證據缺失不等於該節點沒做事。

### 拒絕不一定代表 API 壞掉

如果前端漏送必填欄位，API 回傳 400 拒絕，可能正是正確行為。應回看送出的資料，而不是把拒絕當成後端故障。相反地，有效請求遇到資料庫無法連線，才需要查資料庫及相依環境。

## Teaching Cases

同一儲存症狀，五組不同證據；有效／無效輸入分開。

## Misconceptions／Boundary Cases

- 合法衝突或許可權拒絕不是系統元件故障。
- 複雜分支或缺少紀錄時，不能保證線性找出根因。

## Transfer Case

匯出報表：畫面沒有下載，但工作可能根本沒送出，也可能已儲存結果。

報表識別碼 R-17；不涉及真實檔案或外部系統。

## Transferable Principle

先提出假設，再選一層能排除它的證據。

## Source Mapping

- [MDN：HTTP 請求與回應](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)：Components of HTTP-based systems／HTTP flow；2026-10-01 核讀。
- [Google SRE：Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)：Symptoms Versus Causes／The Four Golden Signals；2026-10-01 核讀。

公式、數字、延遲、case ID 與資料版本是本課自撰的合成教學假設，不是來源提供的 benchmark。HTTP background 補充沿 source strategy 的官方機制檔案角色，未增加新主題。

## Content Review

PASS WITH LIMITATIONS：保留上述來源範圍與模型邊界；不把合成數字當產品保證，不宣稱來源全文精讀或 Human Learning Review 通過。
