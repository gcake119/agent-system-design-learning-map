# Unit 5：工作收到了，就算做完了嗎？

> Flow canonical v0.4；2026-10-01。取代目前主教材的舊 unit 編號含義；舊檔案僅歷史參考。

## Central Question

工作收到了，就算做完了嗎？

## Learning Objectives

說明等待位置與業務完成不同，推算有限視窗的工作累積。

## Prerequisites

Unit 1、3；知道請求可以等待別的工作。

## Core Claims／Reasoning／Required Terminology

### 改的是誰先拿到回應

同步是這次呼叫等待指定結果再回應；非同步是先接收工作，最終結果稍後追蹤。佇列（queue）儲存待處理工作；工作者（worker）在背景取件處理。HTTP 202 在本案例只代表接收，不能讓畫面顯示檔案已完成。

### 不會憑空增加產能

每件 PDF 固定 30 秒；一個工作者每秒平均完成 1／30 件。若有兩個工作者，平均服務能力是 2／30 件。從空佇列開始的 60 秒簡化流量模型：未完成工作＝max（到達率 − 處理能力，0）× 60。工作者失敗時，此視窗的有效處理能力為零。

### 等待與完成都要追蹤

這是連續平均量的教學模型；未完成包含執行中工作，並非精確離散 queue depth，也不推算最老工作的年齡。同步路徑的未完成工作在請求端等待；非同步則需要工作識別碼與完成狀態。加工作者增加能力也增加成本，且真實下游可能限制總能力。

## Teaching Cases

PDF 固定三十秒處理，切換等待位置與處理能力。

## Misconceptions／Boundary Cases

- 本模型沒有重試、重複 delivery 或資料持久化故障。
- 把工作移出請求不代表同一個工作的完成時間縮短。

## Transfer Case

音訊轉錄：每份音訊需 60 秒，使用者需要稍後拿到結果。

初始沒有舊工作；下游足夠，才可按工作者數估算能力。

## Transferable Principle

區分接收回應、產物、累積未完成工作。

## Source Mapping

- [Azure：Queue-Based Load Leveling](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling)：Solution／Problems and considerations；2026-10-01 核讀。

公式、數字、延遲、case ID 與資料版本是本課自撰的合成教學假設，不是來源提供的 benchmark。HTTP background 補充沿 source strategy 的官方機制檔案角色，未增加新主題。

## Content Review

PASS WITH LIMITATIONS：保留上述來源範圍與模型邊界；不把合成數字當產品保證，不宣稱來源全文精讀或 Human Learning Review 通過。
