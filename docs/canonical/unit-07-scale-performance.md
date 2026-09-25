# Unit 7 Canonical Content v0.1 — 依負載與瓶頸改善效能

> 狀態：**Content Review PASS（2026-09-25）**。Canonical Content v0.1 方向已確認；以下修訂納入 subject-matter validation。
> 本文件定義 Unit 7 必須正確傳達的 instructional meaning；不是「高流量架構元件清單」或雲端 sizing 教學。

## Central question

**系統變慢或 workload 增加時，真正受壓的是哪一條路徑、哪個資源？增加 cache、worker、replica 或 server 到底改善什麼，又把問題移到哪裡？**

前六單元已建立 requirements、state、workflow、failure 與 evidence。Unit 7 要求 learner **先量測／估算，再改設計**，避免看到「scale」就加入固定元件。

## Learning objectives

學完後，學習者應能：

1. 用明示 assumptions 建立 workload model：request / job rate、peak / average、data volume、read/write ratio、object size、processing time、growth。
2. 區分 latency、throughput、concurrency、utilization / saturation、queue depth / wait，找出瓶頸而不是只看平均 response time。
3. 沿 critical path / data path 找出 network、compute、database、external dependency、storage / bandwidth 等可能 bottleneck。
4. 比較 query / index、cache、batch、parallelism、queue / workers、vertical / horizontal scaling、replication / partitioning 等 intervention 的作用與 trade-off。
5. 說明 cache freshness / invalidation、replica lag、partitioning / hotspot、parallelism / rate limit 等新問題。
6. 用相同 correctness / reliability / latency / cost evidence 比較 before / after，定義撤回或重新評估條件。
7. 面對 AI 建議「Redis + Kafka + Kubernetes」時，能要求它指出 measured bottleneck、capacity assumption 與每個元件的必要性。

## Core claims

### C1. Scalability 是 workload 改變時仍滿足要求的能力，不等於「能部署很多 server」

先說清楚 workload：

- 什麼 operation 增加？
- peak 與 average 差多少？
- reads / writes / background jobs 比例？
- payload / media size？
- data set / retention？
- traffic 是否 bursty / seasonal？
- 哪些 operation 有 latency / freshness / availability target？

同一個「10 倍使用者」可能壓到 DB writes、media bandwidth、queue workers、third-party quota 或完全不同資源。

### C2. Latency 與 throughput 是不同觀察維度

- latency：一個 operation 從某觀察點完成需要多久；
- throughput：單位時間能完成多少 work。

提高 throughput 不一定降低單次 latency；parallelism 也可能因 contention 讓 tail latency 變差。

平均值會隱藏 distribution / tail。Unit 7 至少要求 learner 看 peak / percentile 或 range，不只 average。

### C3. Bottleneck 是限制目前 throughput / latency / capacity 的 constrained resource / stage

先找瓶頸，再選 intervention。

例如：

- DB query CPU / I/O → index / query / data model；
- repeated read → cache；
- independent slow calls → bounded parallelism；
- bursty background work → queue + worker capacity；
- static / media delivery bandwidth → CDN / edge cache；
- single stateless app capacity → horizontal replicas；
- one partition / key hot → partition strategy / hotspot handling。

不能因為某 pattern 常見就假設它是瓶頸。

### C4. Cache 是以 freshness / complexity 換取 read latency / load 改善

Cache 需要回答：

- cache what；
- where；
- key；
- TTL / invalidation；
- miss behavior；
- stale tolerance；
- stampede / penetration / failure impact；
- sensitive data / deletion requirements。

Cache-Aside 讓 application 在 miss 時從 authoritative store 取資料再填 cache；cache 與 store 可能暫時不一致。

「加 Redis」不是需求；「降低 repeated expensive reads，同時可容忍 X freshness」才是設計理由。

### C5. Parallelism 只改善可並行的工作，並受 downstream capacity 限制

若 A / B 互不依賴，parallel execution 可能降低 critical-path latency；但會增加 simultaneous load、connection / rate-limit pressure、partial failure。

若 downstream 已 saturated，增加 callers / workers 可能只增加 queueing。

Unit 4 的 dependency graph 在這裡變成 performance tool。

### C6. Queue + workers 可以吸收 burst / scale processing，但 backlog 是 capacity signal

增加 workers 可以提升 processing throughput，直到碰到下一個 bottleneck。

需要看：

- arrival rate；
- service rate；
- queue depth / age；
- worker utilization；
- downstream quota；
- retry load。

若 backlog 長期成長，代表 capacity / admission / workload 需要改變，不是 queue「成功承受流量」。

### C7. Replication 與 partitioning 解不同問題，而且都引入新的 trade-offs

概念層：

- replication：保有多份資料，可用於 availability / read capacity / locality 等；代價包括 replication lag / consistency / failover complexity。
- partitioning / sharding：把 data / workload 分到不同 partitions，增加容量；代價包括 key choice、hotspot、cross-partition query / transaction / rebalancing。

Unit 7 不深入 consensus / shard algorithm，但要求 learner 不把 replication 與 partitioning 當同義的「scale DB」。

### C8. Stateless compute 較容易 horizontal scale，但 state 並沒有消失

把 application instance 做成可替換／不持有必要 local session state，通常更容易加 replicas；但 business state、session / cache / files 仍需放到適當 shared / durable systems。

「stateless」不是整個系統沒有 state。

### C9. Optimization 必須保留 correctness / reliability baseline

任何 performance improvement 都要重新檢查：

- Unit 1 behavior / constraints；
- Unit 3 data correctness / freshness；
- Unit 5 failure behavior；
- Unit 6 evidence。

例如 cache 讓 latency 降低，但若顯示過期資料導致錯誤 business decision，不能只因 P95 改善就宣稱成功。

### C10. Cost / complexity 是 design metric，不是事後採購問題

多一個 cache、queue、replica、region、worker pool 都增加 operational surface。

小 workload 的合理設計可能是：

> one app + one database + object storage / CDN

而不是把大型平台 reference architecture 縮小複製。

## Reasoning chain

```text
workload + target
  ↓
measure / estimate baseline
  ↓
trace critical path / resource usage
  ↓
identify bottleneck
  ↓
choose one justified intervention
  ↓
predict effect + new trade-offs
  ↓
measure same correctness / latency / throughput / cost signals
  ↓
keep / revert / reassess
```

## Required terminology

### Workload
系統需要處理的 requests、jobs、data、users / devices、payload 等負載型態與分布。

### Latency
一次 operation 從指定 observation point 到完成的時間。

### Throughput
單位時間完成的 work 數量／資料量。

### Concurrency
同時處於進行中的 operations 數量。

### Saturation
某 resource 接近／達到 capacity，使新增 work 產生等待、拒絕或 degradation 的狀態。

### Bottleneck
目前限制 system performance / capacity 的 resource / stage。

### Cache
為了降低 latency / origin load 保存可再取得／重建資料 copy 的 mechanism；freshness / invalidation 是其設計的一部分。

### Replication
維持同一 logical data 的多份 copies。

### Partitioning
把 data / workload 分散到不同 partitions / nodes。

### Backpressure
沿用 Unit 4：downstream capacity 不足時限制／延後 upstream work。

## Classic teaching case A — Twitter / News Feed

Synthetic workload：

- reads 遠高於 writes；
- users 讀 timeline；
- posts / follows 會改變 feed；
- celebrity account 可能有大量 followers；
- timeline freshness 有明示 tolerance。

用來比較：

- read-time composition vs precomputed / fan-out style projection；
- cache；
- read replicas；
- async feed update；
- hotspot / celebrity fan-out；
- correctness / freshness / cost trade-off。

Unit 7 不要求實作 Twitter，也不宣稱真實 Twitter architecture。

## Classic comparison case B — Video Delivery + URL Shortener

### Video delivery

主要 pressure 可能是：

- object size；
- bandwidth；
- geographic latency；
- transcoding jobs；
- storage / CDN。

用來顯示「request count 不一定是最重要 scale dimension」。

### URL Shortener

主要 pressure 可能是：

- very high read ratio；
- small objects；
- redirect latency；
- ID / key lookup；
- hot links。

用來對比相同 read-heavy label 下，media delivery 與 tiny-key lookup 的 architecture 完全不同。

## Transfer target — Self-hosted Podcast Hosting

Synthetic workload based on a small podcast platform：

- 約數百集；
- audio objects 約數 GB；
- 新內容低頻寫入；
- listener reads / downloads 遠多於 writes；
- RSS / metadata 相對小；
- audio 可透過 object storage / CDN delivery；
- admin interface traffic 很低。

Learner 應回答：

- bottleneck 比較可能是 application CPU、DB write，還是 media delivery / bandwidth？
- static / object storage + CDN 能處理哪些需求？
- download counter 是否需要跟 audio delivery 同一 consistency path？
- RSS freshness 與 audio object caching requirement 是否相同？
- 什麼 workload change 才值得增加 queue / worker / database replica？
- Kubernetes / microservices 在目前 assumption 下解決哪個已知問題？

不使用真實 listener analytics / private infrastructure data。

## Misconceptions and boundary cases

### M1. 「Scale = microservices」
修正：scaling strategy 應對 bottleneck；monolith 也可 horizontal scale，microservices 也可能有 bottleneck。

### M2. 「加 cache 一定更快」
修正：miss、invalidation、serialization、network、stampede、small data 等可能讓收益有限或增加 complexity。

### M3. 「多開 worker 就能清 queue」
修正：直到 downstream / CPU / DB / quota 成為下一瓶頸；workers 也會增加 contention。

### M4. 「replica = sharding」
修正：replication 是 copies；partitioning 是分割 data/workload。目的與 failure / consistency trade-offs 不同。

### M5. 「平均 latency 降低就是成功」
修正：要看 distribution / tail、correctness、error、throughput、cost；平均可能掩蓋最慢 users。

### M6. 「先設計給一百萬使用者比較專業」
修正：沒有 workload evidence 的 capacity 是 assumption；overdesign 會增加 cost / operations surface。

### M7. 「CDN / cache 代表資料永遠一致」
修正：cache freshness / invalidation 是設計的一部分。

## Transferable principle

> **先量測或明示估計，再找瓶頸；每個 scale 元件都必須回答「它改善哪個受限資源、代價是什麼、如何知道真的改善」。複雜度只有在 requirement / workload / evidence 支持時才值得加入。**

## Claim-level source mapping

| Claim | Source | Status |
| --- | --- | --- |
| workload / scaling / stateless / partitioning / caching design principles | Azure Architecture Center design principles | official source; review pending |
| cache-aside freshness / expiration / consistency trade-offs | Azure Cache-Aside | official source; reviewed Unit 3, deeper review pending |
| queue buffering / worker capacity / backlog | Azure Queue-Based Load Leveling + Competing Consumers | official sources; reviewed Unit 4 |
| replication / partitioning trade-offs | DDIA selected source + ByteByteGo coverage; exact primary review pending |
| latency / throughput / percentiles | Google SRE / performance primary sources to validate | pending |
| feed / video / URL shortener examples | synthetic teaching cases inspired by common system-design cases | not claims about real companies |
| Podcast transfer | synthetic workload based on user-experienced system type | no private analytics |

## Sources for Content Review

- Azure Architecture Center — Design principles / Design to scale out
- Azure Cache-Aside
- Azure Queue-Based Load Leveling
- Azure Competing Consumers
- Google SRE Book / Workbook — monitoring / latency / capacity sections as appropriate
- DDIA — Replication / Partitioning, only if actual edition / text available
- ByteByteGo archive — system design / caching / database scaling as supplemental source

## Content Review — 2026-09-25

### Result: PASS

Unit 7 的 workload → baseline → bottleneck → intervention → re-measure 推理鏈通過內容審查。

### Validation decisions

1. **Latency / throughput 分開教。** Google SRE 將 latency、traffic、errors、saturation 列為核心 monitoring signals；latency 需要看 successful / failed requests 與 distribution，不只 average。Canonical Content 保留 percentile / tail 的概念，但不在 v0.1 教統計公式。
2. **Saturation / bottleneck 必須連回 resource。** CPU、memory、I/O、connections、queue age / depth、external quota 都可能限制 workload；「慢」不是單一 architecture diagnosis。
3. **Cache trade-off 成立。** Azure Cache-Aside 明確指出 cache / store 可能暫時不一致，expiration / eviction / invalidation / local-vs-shared cache 都會影響設計。ByteByteGo archive 只作 coverage / visual reference。
4. **Queue / workers 的 scale boundary 延續 Unit 4。** Queue 可以 buffer burst；Competing Consumers 可以增加 processing instances，但 downstream capacity、ordering、contention、failure 仍限制 throughput。
5. **Replication / partitioning 保持概念層。** Replication = 同一 logical data 的多 copies；partitioning = 將 data / workload 分到 partitions。用途可以重疊於 scale / availability，但 mechanisms / trade-offs 不同。v0.1 不教 leader election、consensus、consistent hashing 或 shard rebalancing algorithm。
6. **Stateless 只描述 compute-instance property。** Business state 並未消失；它被移到 durable / shared state systems。避免「stateless architecture = system has no state」。
7. **Synthetic cases 明示。** Twitter / video / URL shortener 不描述真實公司 production architecture；Podcast workload 只用合成範圍，不使用 private analytics。
8. **不加入 Little's Law。** 目前 learning objective 不需要 queueing formula；若未來增加 quantitative capacity planning，再建立獨立 canonical subsection 與來源。

### Remaining non-blocking work

- Storyboard 的 performance comparison 必須固定 workload / correctness target，不能用不同條件的兩組數字製造「方案 B 比較快」。
- 如果後續 Learning Copy 使用 P95 / P99 實際數值，必須標成 synthetic measurements，不暗示 benchmark。
- Unit 8 要把 performance / observability evidence 接進 rollout decision，但不把「deployment 成功」等同 performance requirement 已通過。
