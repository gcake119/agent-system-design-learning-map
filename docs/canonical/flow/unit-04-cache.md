# Unit 4：重複讀取，怎麼減少來源壓力？

> Flow canonical v0.4；2026-10-01。取代目前主教材的舊 unit 編號含義；舊檔案僅歷史參考。

## Central Question

重複讀取，怎麼減少來源壓力？

## Learning Objectives

解釋命中率如何改變來源讀取量，以及副本時效代價。

## Prerequisites

Unit 3；知道查詢負載與資料來源。

## Core Claims／Reasoning／Required Terminology

### 先看重複工作

快取（cache）儲存一份可重新取得的資料副本。命中（hit）是找到可用副本；未命中（miss）則回原始來源查詢。一次讀取不是依序經過快取再讀資料庫：命中會走副本分支，未命中才走來源分支。

### 負載轉移，資料也可能落後

本模型固定每秒讀取量，來源讀取量＝到達量 × 未命中比例；例如 1000 次讀取、90％命中，來源約收到 100 次。命中率只影響去哪裡讀，不保證資料是新版本。權威資料（authoritative state）是對這項業務事實具有最後判定責任的資料。

### 重新整理也是工作

失效處理（invalidation）是來源改變後讓舊副本不能繼續被當成可用結果。這裡用「副本已更新」切換來代表完成重新整理，不模擬實際同步時間與競態。快取可能減少查詢，但增加時效、失效與維護問題；確認最後一個名額仍須回到能保護規則的權威寫入端。

## Teaching Cases

熱門文章列表，同一讀取量改命中與時效。

## Misconceptions／Boundary Cases

- miss 不一定是故障，hit 也不一定符合時效要求。
- 不模擬 同時未命中造成來源流量突增、淘汰、並行重新整理或真實延遲。

## Transfer Case

可預約時段：很多人看名額，但確認預約不能只相信列表副本。

到達量是列表讀取，不是預約寫入。

## Transferable Principle

分開比較顯示負載與確認決策的責任。

## Source Mapping

- [Azure：Cache-Aside](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)：Problems and considerations；2026-09-25 canonical 核讀紀錄，10/01 live fetch 503，未宣稱重新核讀。

公式、數字、延遲、case ID 與資料版本是本課自撰的合成教學假設，不是來源提供的 benchmark。HTTP background 補充沿 source strategy 的官方機制檔案角色，未增加新主題。

## Content Review

PASS WITH LIMITATIONS：保留上述來源範圍與模型邊界；不把合成數字當產品保證，不宣稱來源全文精讀或 Human Learning Review 通過。
