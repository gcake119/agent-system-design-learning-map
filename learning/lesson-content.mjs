// Learner-facing explanations derived from docs/canonical/flow/.
export const lessonContent={
  "flow": {
    "question": "一個按鈕到底發生了什麼？",
    "objective": "指出請求送出、資料儲存、回應及畫面更新的不同證據。",
    "prerequisite": "無；只需要知道在畫面按下儲存。",
    "reading": [
      {
        "title": "畫面與儲存是兩件事",
        "text": "你在表單打字時，資料可能還只存在瀏覽器的記憶體。前端是負責互動與畫面更新的程式；後端是接收請求、檢查業務條件並操作資料的程式。資料庫負責儲存與查詢資料。這些是責任角色，不一定是不同機器。"
      },
      {
        "title": "請求有去程，也有回程",
        "text": "HTTP（Hypertext Transfer Protocol，超文字傳輸協定）約定了使用者端與伺服器交換訊息的方式。request（請求）帶著要做的事與資料送出；response（回應）把處理結果送回。API（Application Programming Interface，應用程式介面）是彼此約定的操作入口。資料庫儲存後，後端仍要回應，前端仍要更新自己的 state（目前畫面資料）並 render（把資料呈現成畫面）。"
      },
      {
        "title": "分開驗證，才知道做到哪裡",
        "text": "Network（瀏覽器的網路請求面板）看到送出，只支援已送出請求；資料列存在，支援該次儲存；畫面出現新值，才支援畫面已更新。HTTP 200 是依介面約定的成功回應，不會自動證明每個外部動作都已完成。"
      }
    ],
    "boundaries": [
      "送出請求不等於已儲存。",
      "本課示範單一操作，不模擬所有 HTTP 細節。"
    ],
    "transfer": {
      "title": "預約建立",
      "problem": "預約建立：表單填好了，但要確認重新開啟頁面仍能讀到預約。",
      "assumptions": "一次建立需要回傳預約識別碼；不涉及付款。"
    },
    "principle": "依去程與回程分別找證據。",
    "sources": [
      {
        "title": "MDN：HTTP 請求與回應",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
        "section": "Components of HTTP-based systems／HTTP flow；2026-10-01 核讀"
      }
    ]
  },
  "locate": {
    "question": "同樣沒反應，問題到底在哪一層？",
    "objective": "比較正常與實際輸入／輸出，縮小異常範圍並保留根因假設。",
    "prerequisite": "Unit 1 的去程與回程。",
    "reading": [
      {
        "title": "先固定你期待的結果",
        "text": "症狀（symptom）是使用者看見的現象，例如按儲存沒反應。先寫出正常路徑，再檢查實際走到哪裡。若沒有送出請求，先查畫面事件；若已送出但儲存失敗，才沿後端與資料庫查。"
      },
      {
        "title": "異常位置不是根因結論",
        "text": "直接原因（direct cause）是緊鄰結果的因素，例如沒有執行儲存事件。根因（root cause）是更深的形成原因，例如改版後沒有把事件接回按鈕；這需要另外的版本或重現證據。第一個可見異常只縮小調查範圍。證據缺失不等於該節點沒做事。"
      },
      {
        "title": "拒絕不一定代表 API 壞掉",
        "text": "如果前端漏送必填欄位，API 回傳 400 拒絕，可能正是正確行為。應回看送出的資料，而不是把拒絕當成後端故障。相反地，有效請求遇到資料庫無法連線，才需要查資料庫及相依環境。"
      }
    ],
    "boundaries": [
      "合法衝突或許可權拒絕不是系統元件故障。",
      "複雜分支或缺少紀錄時，不能保證線性找出根因。"
    ],
    "transfer": {
      "title": "匯出報表",
      "problem": "匯出報表：畫面沒有下載，但工作可能根本沒送出，也可能已儲存結果。",
      "assumptions": "報表識別碼 R-17；不涉及真實檔案或外部系統。"
    },
    "principle": "先提出假設，再選一層能排除它的證據。",
    "sources": [
      {
        "title": "MDN：HTTP 請求與回應",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
        "section": "Components of HTTP-based systems／HTTP flow；2026-10-01 核讀"
      },
      {
        "title": "Google SRE：Monitoring Distributed Systems",
        "url": "https://sre.google/sre-book/monitoring-distributed-systems/",
        "section": "Symptoms Versus Causes／The Four Golden Signals；2026-10-01 核讀"
      }
    ]
  },
  "latency": {
    "question": "慢到底累積在哪裡？",
    "objective": "在固定負載及結果要求下比較各段耗時，說明修改為何改善。",
    "prerequisite": "Unit 1–2；知道路徑由多個工作段組成。",
    "reading": [
      {
        "title": "一次要等多久",
        "text": "延遲（latency）是一次操作到指定結果所花的時間；吞吐量（throughput）是單位時間完成多少工作。兩者不同。本模型把前端、網路、後端、查詢、外部查詢放在一條序列路徑，總時間是各段加總。"
      },
      {
        "title": "先定位，再選修改",
        "text": "關鍵路徑（critical path）是決定整體完成時間的相依路徑。本模型只有一條序列路徑；真實系統有平行工作時，要按相依關係算，不能把所有 trace 段相加。瓶頸是目前限制表現的地方，不一定等於 CPU 最高的機器。"
      },
      {
        "title": "比較時保留相同條件",
        "text": "只降低資料查詢時間，可以看到總時間少了多少；其他段仍保留。若網路才佔主要等待，加後端機器未必有效。這些可調數字是合成耗時，不是特定索引、硬體或雲端服務的保證收益。"
      }
    ],
    "boundaries": [
      "平均延遲不代表每個人的等待；本模型沒有分佈或 p95。",
      "負載、並行與排隊另有影響，不由這個加總模型推算。"
    ],
    "transfer": {
      "title": "商品列表",
      "problem": "商品列表：資料查詢很快，但商品圖片摘要服務變慢。",
      "assumptions": "相同列表與需求；只改單一耗時，再解釋對總時間的影響。"
    },
    "principle": "用量測段落說理由，不以增加元件當答案。",
    "sources": [
      {
        "title": "Google SRE：Monitoring Distributed Systems",
        "url": "https://sre.google/sre-book/monitoring-distributed-systems/",
        "section": "Symptoms Versus Causes／The Four Golden Signals；2026-10-01 核讀"
      }
    ]
  },
  "cache": {
    "question": "重複讀取，怎麼減少來源壓力？",
    "objective": "解釋命中率如何改變來源讀取量，以及副本時效代價。",
    "prerequisite": "Unit 3；知道查詢負載與資料來源。",
    "reading": [
      {
        "title": "先看重複工作",
        "text": "快取（cache）儲存一份可重新取得的資料副本。命中（hit）是找到可用副本；未命中（miss）則回原始來源查詢。一次讀取不是依序經過快取再讀資料庫：命中會走副本分支，未命中才走來源分支。"
      },
      {
        "title": "負載轉移，資料也可能落後",
        "text": "本模型固定每秒讀取量，來源讀取量＝到達量 × 未命中比例；例如 1000 次讀取、90％命中，來源約收到 100 次。命中率只影響去哪裡讀，不保證資料是新版本。權威資料（authoritative state）是對這項業務事實具有最後判定責任的資料。"
      },
      {
        "title": "重新整理也是工作",
        "text": "失效處理（invalidation）是來源改變後讓舊副本不能繼續被當成可用結果。這裡用「副本已更新」切換來代表完成重新整理，不模擬實際同步時間與競態。快取可能減少查詢，但增加時效、失效與維護問題；確認最後一個名額仍須回到能保護規則的權威寫入端。"
      }
    ],
    "boundaries": [
      "miss 不一定是故障，hit 也不一定符合時效要求。",
      "不模擬 同時未命中造成來源流量突增、淘汰、並行重新整理或真實延遲。"
    ],
    "transfer": {
      "title": "可預約時段",
      "problem": "可預約時段：很多人看名額，但確認預約不能只相信列表副本。",
      "assumptions": "到達量是列表讀取，不是預約寫入。"
    },
    "principle": "分開比較顯示負載與確認決策的責任。",
    "sources": [
      {
        "title": "Azure：Cache-Aside",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside",
        "section": "Problems and considerations；2026-09-25 canonical 核讀紀錄，10/01 live fetch 503，未宣稱重新核讀"
      }
    ]
  },
  "queue": {
    "question": "工作收到了，就算做完了嗎？",
    "objective": "說明等待位置與業務完成不同，推算有限視窗的工作累積。",
    "prerequisite": "Unit 1、3；知道請求可以等待別的工作。",
    "reading": [
      {
        "title": "改的是誰先拿到回應",
        "text": "同步是這次呼叫等待指定結果再回應；非同步是先接收工作，最終結果稍後追蹤。佇列（queue）儲存待處理工作；工作者（worker）在背景取件處理。HTTP 202 在本案例只代表接收，不能讓畫面顯示檔案已完成。"
      },
      {
        "title": "不會憑空增加產能",
        "text": "每件 PDF 固定 30 秒；一個工作者每秒平均完成 1／30 件。若有兩個工作者，平均服務能力是 2／30 件。從空佇列開始的 60 秒簡化流量模型：未完成工作＝max（到達率 − 處理能力，0）× 60。工作者失敗時，此視窗的有效處理能力為零。"
      },
      {
        "title": "等待與完成都要追蹤",
        "text": "這是連續平均量的教學模型；未完成包含執行中工作，並非精確離散 queue depth，也不推算最老工作的年齡。同步路徑的未完成工作在請求端等待；非同步則需要工作識別碼與完成狀態。加工作者增加能力也增加成本，且真實下游可能限制總能力。"
      }
    ],
    "boundaries": [
      "本模型沒有重試、重複 delivery 或資料持久化故障。",
      "把工作移出請求不代表同一個工作的完成時間縮短。"
    ],
    "transfer": {
      "title": "音訊轉錄",
      "problem": "音訊轉錄：每份音訊需 60 秒，使用者需要稍後拿到結果。",
      "assumptions": "初始沒有舊工作；下游足夠，才可按工作者數估算能力。"
    },
    "principle": "區分接收回應、產物、累積未完成工作。",
    "sources": [
      {
        "title": "Azure：Queue-Based Load Leveling",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling",
        "section": "Solution／Problems and considerations；2026-10-01 核讀"
      }
    ]
  },
  "consistency": {
    "question": "這次讀到的，是哪一份資料？",
    "objective": "追資料版本及讀取分支，依需求判斷短暫落後。",
    "prerequisite": "Unit 4–5；知道副本與非同步傳遞。",
    "reading": [
      {
        "title": "寫入端與讀取端可能不同",
        "text": "主資料庫（primary）儲存本案例已確認的新版本。讀取複本（read replica）複製同一資料以服務查詢；衍生檢視（projection）把資料轉成別的查詢形式。瀏覽器、快取、複本及衍生檢視是不同讀取路徑，不是每次依序經過的管線。"
      },
      {
        "title": "落後是否可接受，要看用途",
        "text": "本模型在主資料寫入 v3 後，選一條讀取路徑及傳遞延遲，再前進觀察時間。延遲到期後副本追到 v3。在要求立即看新值的畫面，讀 v2 不合要求；若產品明示允許五秒傳遞，五秒內讀到 v2 可能符合約定。"
      },
      {
        "title": "修正須回到實際路徑",
        "text": "讀主資料可以避開這份副本落後，但增加主資料來源負載。重新整理錯的副本不會修好實際讀到的另一份。確認預約時的寫入規則仍由權威端保護；僅在畫面看到 v3，不證明所有業務規則都成立。"
      }
    ],
    "boundaries": [
      "本模型只示範一次變更與可完成的傳遞，不承諾 eventual consistency 自動修好。",
      "資料一致性不等於所有副本在所有時刻相同。"
    ],
    "transfer": {
      "title": "行事曆",
      "problem": "行事曆：預約已儲存，衍生行事曆檢視稍後才更新。",
      "assumptions": "只示範教學用資料傳遞，不連線真實 Calendar。"
    },
    "principle": "說清楚容許多久，以及超過多久需要調查。",
    "sources": [
      {
        "title": "Azure：Cache-Aside",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside",
        "section": "Problems and considerations；2026-09-25 canonical 核讀紀錄，10/01 live fetch 503，未宣稱重新核讀"
      },
      {
        "title": "Azure：Queue-Based Load Leveling",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling",
        "section": "Solution／Problems and considerations；2026-10-01 核讀"
      }
    ]
  },
  "evidence": {
    "question": "下一份證據，能幫我排除什麼？",
    "objective": "針對假設選證據，區分已觀察、未觀察與業務結果。",
    "prerequisite": "Unit 2–6；知道請求及背景工作。",
    "reading": [
      {
        "title": "同一事故，換一個角度看",
        "text": "事件紀錄（log）記某次發生的事；指標（metric）把一段時間數值彙整；追蹤（trace）把同次操作跨元件的片段連起來。切換證據是換觀察角度，不是更換事故。先說你要區分哪些可能，再選觀察位置。"
      },
      {
        "title": "證據都有邊界",
        "text": "worker 紀錄已送出通知、trace 顯示等待逾時，支援呼叫方沒有按時收到回應。它不能證明對方沒有執行。狀態查詢或外部收據才能進一步確認實際效果；指標顯示整體失敗率，也不能直接解釋某一筆工作。"
      },
      {
        "title": "完成不是一個綠燈",
        "text": "業務狀態是按需求定義的進度或結果；缺少產物只支援目前沒有查到，可能失敗、仍在跑或查錯位置。測試通過只涵蓋跑過的範圍，不等於真實 provider 或使用者收到了。紀錄應避免秘密與敏感資料；本課全用合成識別碼。"
      }
    ],
    "boundaries": [
      "缺少 trace／log 不等於沒做事。",
      "未知結果重送可能重複產生效果；完整重試／冪等工程留下一門課。"
    ],
    "transfer": {
      "title": "文章發布",
      "problem": "文章發布：呼叫方逾時，不能直接認定文章沒發出去。",
      "assumptions": "只查看合成操作 P-17；外部效果需要另一份結果查證。"
    },
    "principle": "說出證據支援的範圍與仍需查證的問題。",
    "sources": [
      {
        "title": "Google SRE：Monitoring Distributed Systems",
        "url": "https://sre.google/sre-book/monitoring-distributed-systems/",
        "section": "Symptoms Versus Causes／The Four Golden Signals；2026-10-01 核讀"
      },
      {
        "title": "Azure：Retry",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/retry",
        "section": "Context and problem／Solution；2026-10-01 核讀"
      }
    ]
  },
  "redesign": {
    "question": "找到問題後，修改還會影響哪裡？",
    "objective": "在同一系統限制下比較方案、指出收益及代價，提出修改後驗證。",
    "prerequisite": "Unit 1–7。",
    "reading": [
      {
        "title": "先說要改善哪個結果",
        "text": "設計取捨（trade-off）是改善一個條件時，可能增加另一種成本或風險。列表來源過載、檔案處理不足、通知結果未知是不同問題；不能用同一個元件處理全部。先記住現象、路徑與證據，再改一個條件。"
      },
      {
        "title": "在同一模型看跨層影響",
        "text": "儲存讀取副本降低來源查詢，但可能回舊版本；增加處理人力降低未完成工作，但佔更多資源；提前回覆接收讓使用者少等，卻需要稍後查結果。通知逾時依然可能結果未知；上述修改不會自動驗證外部效果。"
      },
      {
        "title": "驗證收益，也驗證新增風險",
        "text": "在相同負載下重新量測，核對原本需要改善的結果；再查資料版本、工作產物與外部收據。證據應跨到真正要求完成的地方。模型能支援的是明示簡化條件下的因果關係；真人能否獨立使用這套推理，須另做 Human Learning Review。"
      }
    ],
    "boundaries": [
      "不推導真實服務容量或部署安全。",
      "完整競態保護、版本演進與限流工程留後續課程。"
    ],
    "transfer": {
      "title": "案件檔案流程",
      "problem": "案件檔案流程：查詢很多、處理較久，外部通知尚未確定。",
      "assumptions": "合成系統；來源上限固定，背景處理不共享讀取容量。"
    },
    "principle": "不猜章節；說出要改什麼、理由、代價與驗證。",
    "sources": [
      {
        "title": "Azure：Cache-Aside",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside",
        "section": "Problems and considerations；2026-09-25 canonical 核讀紀錄，10/01 live fetch 503，未宣稱重新核讀"
      },
      {
        "title": "Azure：Queue-Based Load Leveling",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling",
        "section": "Solution／Problems and considerations；2026-10-01 核讀"
      },
      {
        "title": "Azure：Retry",
        "url": "https://learn.microsoft.com/en-us/azure/architecture/patterns/retry",
        "section": "Context and problem／Solution；2026-10-01 核讀"
      },
      {
        "title": "Google SRE：Monitoring Distributed Systems",
        "url": "https://sre.google/sre-book/monitoring-distributed-systems/",
        "section": "Symptoms Versus Causes／The Four Golden Signals；2026-10-01 核讀"
      }
    ]
  }
};
