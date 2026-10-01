# Unit 1：一個按鈕到底發生了什麼？

> Flow canonical v0.4；2026-10-01。取代目前主教材的舊 unit 編號含義；舊檔案僅歷史參考。

## Central Question

一個按鈕到底發生了什麼？

## Learning Objectives

指出請求送出、資料儲存、回應及畫面更新的不同證據。

## Prerequisites

無；只需要知道在畫面按下儲存。

## Core Claims／Reasoning／Required Terminology

### 畫面與儲存是兩件事

你在表單打字時，資料可能還只存在瀏覽器的記憶體。前端是負責互動與畫面更新的程式；後端是接收請求、檢查業務條件並操作資料的程式。資料庫負責儲存與查詢資料。這些是責任角色，不一定是不同機器。

### 請求有去程，也有回程

HTTP（Hypertext Transfer Protocol，超文字傳輸協定）約定了使用者端與伺服器交換訊息的方式。request（請求）帶著要做的事與資料送出；response（回應）把處理結果送回。API（Application Programming Interface，應用程式介面）是彼此約定的操作入口。資料庫儲存後，後端仍要回應，前端仍要更新自己的 state（目前畫面資料）並 render（把資料呈現成畫面）。

### 分開驗證，才知道做到哪裡

Network（瀏覽器的網路請求面板）看到送出，只支援已送出請求；資料列存在，支援該次儲存；畫面出現新值，才支援畫面已更新。HTTP 200 是依介面約定的成功回應，不會自動證明每個外部動作都已完成。

## Teaching Cases

儲存表單，逐步走去程與回程。

## Misconceptions／Boundary Cases

- 送出請求不等於已儲存。
- 本課示範單一操作，不模擬所有 HTTP 細節。

## Transfer Case

預約建立：表單填好了，但要確認重新開啟頁面仍能讀到預約。

一次建立需要回傳預約識別碼；不涉及付款。

## Transferable Principle

依去程與回程分別找證據。

## Source Mapping

- [MDN：HTTP 請求與回應](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)：Components of HTTP-based systems／HTTP flow；2026-10-01 核讀。

公式、數字、延遲、case ID 與資料版本是本課自撰的合成教學假設，不是來源提供的 benchmark。HTTP background 補充沿 source strategy 的官方機制檔案角色，未增加新主題。

## Content Review

PASS WITH LIMITATIONS：保留上述來源範圍與模型邊界；不把合成數字當產品保證，不宣稱來源全文精讀或 Human Learning Review 通過。
