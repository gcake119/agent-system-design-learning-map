# Unit 3：慢到底累積在哪裡？

> Flow canonical v0.4；2026-10-01。取代目前主教材的舊 unit 編號含義；舊檔案僅歷史參考。

## Central Question

慢到底累積在哪裡？

## Learning Objectives

在固定負載及結果要求下比較各段耗時，說明修改為何改善。

## Prerequisites

Unit 1–2；知道路徑由多個工作段組成。

## Core Claims／Reasoning／Required Terminology

### 一次要等多久

延遲（latency）是一次操作到指定結果所花的時間；吞吐量（throughput）是單位時間完成多少工作。兩者不同。本模型把前端、網路、後端、查詢、外部查詢放在一條序列路徑，總時間是各段加總。

### 先定位，再選修改

關鍵路徑（critical path）是決定整體完成時間的相依路徑。本模型只有一條序列路徑；真實系統有平行工作時，要按相依關係算，不能把所有 trace 段相加。瓶頸是目前限制表現的地方，不一定等於 CPU 最高的機器。

### 比較時保留相同條件

只降低資料查詢時間，可以看到總時間少了多少；其他段仍保留。若網路才佔主要等待，加後端機器未必有效。這些可調數字是合成耗時，不是特定索引、硬體或雲端服務的保證收益。

## Teaching Cases

列表序列載入，固定其他段只改一段耗時。

## Misconceptions／Boundary Cases

- 平均延遲不代表每個人的等待；本模型沒有分佈或 p95。
- 負載、並行與排隊另有影響，不由這個加總模型推算。

## Transfer Case

商品列表：資料查詢很快，但商品圖片摘要服務變慢。

相同列表與需求；只改單一耗時，再解釋對總時間的影響。

## Transferable Principle

用量測段落說理由，不以增加元件當答案。

## Source Mapping

- [Google SRE：Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)：Symptoms Versus Causes／The Four Golden Signals；2026-10-01 核讀。

公式、數字、延遲、case ID 與資料版本是本課自撰的合成教學假設，不是來源提供的 benchmark。HTTP background 補充沿 source strategy 的官方機制檔案角色，未增加新主題。

## Content Review

PASS WITH LIMITATIONS：保留上述來源範圍與模型邊界；不把合成數字當產品保證，不宣稱來源全文精讀或 Human Learning Review 通過。
