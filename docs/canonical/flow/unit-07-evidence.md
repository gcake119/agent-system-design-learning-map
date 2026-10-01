# Unit 7：下一份證據，能幫我排除什麼？

> Flow canonical v0.4；2026-10-01。取代目前主教材的舊 unit 編號含義；舊檔案僅歷史參考。

## Central Question

下一份證據，能幫我排除什麼？

## Learning Objectives

針對假設選證據，區分已觀察、未觀察與業務結果。

## Prerequisites

Unit 2–6；知道請求及背景工作。

## Core Claims／Reasoning／Required Terminology

### 同一事故，換一個角度看

事件紀錄（log）記某次發生的事；指標（metric）把一段時間數值彙整；追蹤（trace）把同次操作跨元件的片段連起來。切換證據是換觀察角度，不是更換事故。先說你要區分哪些可能，再選觀察位置。

### 證據都有邊界

worker 紀錄已送出通知、trace 顯示等待逾時，支援呼叫方沒有按時收到回應。它不能證明對方沒有執行。狀態查詢或外部收據才能進一步確認實際效果；指標顯示整體失敗率，也不能直接解釋某一筆工作。

### 完成不是一個綠燈

業務狀態是按需求定義的進度或結果；缺少產物只支援目前沒有查到，可能失敗、仍在跑或查錯位置。測試通過只涵蓋跑過的範圍，不等於真實 provider 或使用者收到了。紀錄應避免秘密與敏感資料；本課全用合成識別碼。

## Teaching Cases

同一次通知逾時，切換證據角度並查外部結果。

## Misconceptions／Boundary Cases

- 缺少 trace／log 不等於沒做事。
- 未知結果重送可能重複產生效果；完整重試／冪等工程留下一門課。

## Transfer Case

文章發布：呼叫方逾時，不能直接認定文章沒發出去。

只查看合成操作 P-17；外部效果需要另一份結果查證。

## Transferable Principle

說出證據支援的範圍與仍需查證的問題。

## Source Mapping

- [Google SRE：Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)：Symptoms Versus Causes／The Four Golden Signals；2026-10-01 核讀。
- [Azure：Retry](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry)：Context and problem／Solution／Idempotency；2026-10-01 核讀。

公式、數字、延遲、case ID 與資料版本是本課自撰的合成教學假設，不是來源提供的 benchmark。HTTP background 補充沿 source strategy 的官方機制檔案角色，未增加新主題。

## Content Review

PASS WITH LIMITATIONS：保留上述來源範圍與模型邊界；不把合成數字當產品保證，不宣稱來源全文精讀或 Human Learning Review 通過。
