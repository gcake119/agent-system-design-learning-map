# Unit 6：這次讀到的，是哪一份資料？

> Flow canonical v0.4；2026-10-01。取代目前主教材的舊 unit 編號含義；舊檔案僅歷史參考。

## Central Question

這次讀到的，是哪一份資料？

## Learning Objectives

追資料版本及讀取分支，依需求判斷短暫落後。

## Prerequisites

Unit 4–5；知道副本與非同步傳遞。

## Core Claims／Reasoning／Required Terminology

### 寫入端與讀取端可能不同

主資料庫（primary）儲存本案例已確認的新版本。讀取複本（read replica）複製同一資料以服務查詢；衍生檢視（projection）把資料轉成別的查詢形式。瀏覽器、快取、複本及衍生檢視是不同讀取路徑，不是每次依序經過的管線。

### 落後是否可接受，要看用途

本模型在主資料寫入 v3 後，選一條讀取路徑及傳遞延遲，再前進觀察時間。延遲到期後副本追到 v3。在要求立即看新值的畫面，讀 v2 不合要求；若產品明示允許五秒傳遞，五秒內讀到 v2 可能符合約定。

### 修正須回到實際路徑

讀主資料可以避開這份副本落後，但增加主資料來源負載。重新整理錯的副本不會修好實際讀到的另一份。確認預約時的寫入規則仍由權威端保護；僅在畫面看到 v3，不證明所有業務規則都成立。

## Teaching Cases

主資料更新 v3，比較不同讀取分支與傳遞時間。

## Misconceptions／Boundary Cases

- 本模型只示範一次變更與可完成的傳遞，不承諾 eventual consistency 自動修好。
- 資料一致性不等於所有副本在所有時刻相同。

## Transfer Case

行事曆：預約已儲存，衍生行事曆檢視稍後才更新。

只示範教學用資料傳遞，不連線真實 Calendar。

## Transferable Principle

說清楚容許多久，以及超過多久需要調查。

## Source Mapping

- [Azure：Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)：Problems and considerations；2026-09-25 canonical 核讀紀錄，10/01 live fetch 503，未宣稱重新核讀。
- [Azure：Queue-Based Load Leveling](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling)：Solution／Problems and considerations；2026-10-01 核讀。

公式、數字、延遲、case ID 與資料版本是本課自撰的合成教學假設，不是來源提供的 benchmark。HTTP background 補充沿 source strategy 的官方機制檔案角色，未增加新主題。

## Content Review

PASS WITH LIMITATIONS：保留上述來源範圍與模型邊界；不把合成數字當產品保證，不宣稱來源全文精讀或 Human Learning Review 通過。
