export const course={title:'System Design',subtitle:'從「做得出來」到「知道為什麼這樣設計」',intro:'先看到問題，再認識工程名詞。每一章都會改變一個條件，看看原本的設計還成不成立。'};
export const units=[
{id:'requirements',number:1,title:'到底要做到什麼？',summary:'先把需求、假設和限制分清楚，再談技術。',stages:[
{id:'enough',eyebrow:'先別畫架構',title:'「可以訂票」夠不夠？',intro:'需求只有一句：「使用者可以選場次並預訂座位。」先挑出如果不知道答案，後面的設計可能會不同的問題。',prompt:'哪些事情現在應該先問？',options:[
{label:'一張票是指定座位，還是只限制總人數？',feedback:'這會改變系統真正要守的規則。指定座位與總容量，資料與衝突方式不一樣。'},
{label:'開賣瞬間會不會同時湧入大量使用者？',feedback:'這是會影響後續效能設計的限制條件。現在不必先決定怎麼擴充。'},
{label:'先加 Redis，避免系統太慢',feedback:'Redis 是可能的解法。現在還不知道瓶頸是不是重複讀取，所以先不要把解法當需求。'}],term:{name:'Constraint（限制條件）',plain:'會讓某些設計變得可行或不可行的條件。'}},
{id:'rule',eyebrow:'改變一個條件',title:'同樣叫預約，規則會一樣嗎？',intro:'把「預約」換成三種情境，看看哪一條規則真的不能被破壞。',prompt:'切換預約方式。',options:[
{label:'指定座位',feedback:'容量為 1 時，同一場次的同一座位不能同時有兩筆有效預約。'},
{label:'自由入場',feedback:'不需要守「同一座位唯一」，但仍要守場次總容量。'},
{label:'可候補',feedback:'除了容量，還要定義候補如何轉成正式名額，以及順序是否重要。'}],term:{name:'Business rule（業務規則）',plain:'在這個業務情境裡，系統必須遵守的規則。'}},
{id:'transfer',eyebrow:'Transfer 練習',title:'換成心理師＋場地預約',intro:'一次預約同時要處理心理師行程和場地。這裡不提示 transaction、Calendar sync 或任何架構元件。',prompt:'哪一個問題最值得先確認？',options:[
{label:'一次預約是否必須同時取得心理師與場地？',feedback:'這會直接影響「預約成立」的定義，以及後面要維持哪些規則。'},
{label:'先決定用哪一套行事曆 API',feedback:'API 是後面的實作選擇。先確認哪一份行程最後算數、哪些資源必須一起取得。'},
{label:'先拆成三個 microservices',feedback:'目前還沒有獨立部署或擴展的需求證據。先把責任與規則問清楚。'}]}]},
{id:'boundaries',number:2,title:'這件事誰負責？',summary:'先分責任、資料和信任邊界，再決定要不要拆服務。',stages:[
{id:'responsibility',eyebrow:'先分責任',title:'先不要切 microservices',intro:'一筆訂單會碰到訂單、庫存、付款和出貨。先看每一塊到底負責什麼。',prompt:'哪一種切法比較有理由？',options:[
{label:'依業務責任分：訂單／庫存／付款／出貨',feedback:'先用責任分界，之後再看哪些部分真的需要獨立部署、擴展或隔離。'},
{label:'依技術分：Controller／Service／Repository 各一個服務',feedback:'這是程式技術層次，不會自動形成好的業務邊界。'},
{label:'每張資料表都做成一個服務',feedback:'資料表不是責任邊界。先問誰負責維持這份資料的業務規則。'}],term:{name:'Boundary（邊界）',plain:'這件事到哪裡算誰負責。'}},
{id:'contract',eyebrow:'跨過邊界',title:'兩邊到底約好了什麼？',intro:'付款元件不需要知道訂單資料表長什麼樣；它需要知道這次付款代表什麼、成功和失敗怎麼表達。',prompt:'哪一項才是跨邊界真正需要的約定？',options:[
{label:'輸入、結果、錯誤、權限與行為語意',feedback:'這些是另一邊會依賴的外部行為。內部 class 或資料表可以在不破壞契約時改變。'},
{label:'Provider 內部使用的資料表名稱',feedback:'把內部資料形狀暴露出去，會讓兩邊更難各自修改。'}],term:{name:'Contract（契約）',plain:'跨過邊界時，兩邊約好要給什麼，以及成功、失敗代表什麼。'}},
{id:'trust',eyebrow:'信任邊界',title:'把按鈕藏起來就安全了嗎？',intro:'前端把「取消別人的訂單」按鈕藏起來。現在有人自己送出同樣的 request。',prompt:'真正應該在哪裡擋下來？',options:[
{label:'負責修改訂單狀態的可信任端',feedback:'前端可以改善操作體驗，但 request 可以被自行修改。真正改資料的一端仍要檢查身分與權限。'},
{label:'前端已經藏按鈕，不需要再檢查',feedback:'UI 不是可信任的授權邊界。未信任的 client 仍可能直接送 request。'}],term:{name:'Trust boundary（信任邊界）',plain:'跨過這條線後，不能直接相信傳進來的身分、權限或資料。'}},
{id:'transfer',eyebrow:'Transfer 練習',title:'四個 repo，就等於四個服務嗎？',intro:'一個案件系統有 frontend、backend、document engine 和 database。先不要照 repo 數量切服務。',prompt:'哪個問題最能幫你判斷責任？',options:[
{label:'誰負責案件狀態能不能往下一階段？',feedback:'這會找到真正的業務規則 owner。Document engine 可以回傳處理結果，不一定應直接修改案件狀態。'},
{label:'每個 repo 都各自有 CI，所以一定是獨立服務',feedback:'Repo 和 deployment boundary 可以不同。要回到責任、資料、部署與擴展需求判斷。'}]}]},
{id:'concurrency',number:3,title:'兩個人同時改資料會怎樣？',summary:'找到不能被破壞的規則，再看同時操作怎麼繞過它。',stages:[
{id:'race',eyebrow:'把時間拆開看',title:'兩個人都看到最後一個座位',intro:'A 和 B 幾乎同時查詢，都看到座位還空著。單看每個 request 都很合理，問題會出在哪裡？',prompt:'哪一種執行順序最容易留下兩筆都成功的預約？',options:[
{label:'A 讀取 → B 讀取 → A 寫入 → B 寫入',feedback:'A、B 都根據同一個舊狀態做決定。若寫入端沒有再保護「座位只能有一筆有效預約」，最後就可能違反規則。'},
{label:'A 完整做完，再讓 B 開始',feedback:'這個順序不會暴露同樣的衝突；但真實系統不能假設 request 永遠乖乖排隊。'}],term:{name:'Race condition（競態條件）',plain:'結果會因為同時操作的先後順序不同而改變，並可能破壞原本的規則。'}},
{id:'authority',eyebrow:'最後相信誰',title:'畫面說有位子，就真的能賣嗎？',intro:'畫面或快取可能還顯示「可預約」，但另一個 request 已經先完成寫入。',prompt:'真正建立預約前，最後應由哪裡判斷？',options:[
{label:'負責這項預約規則的權威寫入端',feedback:'顯示用的副本可以稍微落後；真正寫入時仍要回到能維持規則的地方判斷。'},
{label:'相信使用者剛剛看到的畫面',feedback:'畫面是稍早讀到的狀態。它可以用來顯示，不能單獨保證寫入當下仍然成立。'}],term:{name:'Authoritative state（權威狀態）',plain:'真的要做決定時，具有最後判定責任的資料。'}},
{id:'mechanism',eyebrow:'保護規則',title:'用了 transaction 就不會衝突嗎？',intro:'Transaction 可以把資料操作放進一個處理範圍，但真正能不能擋住 race，還要看隔離方式、constraint 和實際寫法。',prompt:'哪個說法比較完整？',options:[
{label:'先指出要保護的規則，再選 constraint／conditional update／locking／isolation',feedback:'這些機制可以單獨或組合使用。重點是知道它在哪一步阻止不合法狀態，以及衝突時怎麼回應。'},
{label:'只要包 transaction，所有 concurrency 問題都解決',feedback:'Transaction 本身沒有說明兩個同時進行的操作彼此能看到什麼，也沒有自動表達所有業務規則。'}],term:{name:'Isolation（隔離）',plain:'兩個同時進行的 transaction，彼此可以看到、影響到什麼。'}},
{id:'transfer',eyebrow:'Transfer 練習',title:'心理師和場地都要同時有空',intro:'一次 appointment 需要一位心理師和一間場地。兩種資源都可能被其他預約搶走。',prompt:'現在最重要的是先找什麼？',options:[
{label:'預約成立時，哪些資源規則必須一起成立？',feedback:'先定義不能被破壞的規則，再看資料是不是由同一個 authority 管理，才能決定 transaction 或其他協調方式。'},
{label:'先用 Redis distributed lock',feedback:'Lock 是候選機制。先確認 authority、資料位置和要保護的規則，才知道額外 lock service 是否必要。'}]}]},
{id:'async',number:4,title:'誰要等到哪一步？',summary:'先定義完成到哪裡，再決定同步、非同步或排隊。',stages:[
{id:'wait',eyebrow:'先定義完成',title:'下單成功要等 Email 寄完嗎？',intro:'訂單已經保存，接下來要寄通知。使用者現在還需要一直等嗎？',prompt:'哪個問題應該先決定？',options:[
{label:'「下單成功」是否包含通知已送達？',feedback:'先定義使用者真正需要等到哪個結果。只有在通知是成功條件時，才有理由把它留在同一等待路徑。'},
{label:'先放一個 message queue',feedback:'Queue 是後面的協調工具。先定義完成語意，才知道工作能不能晚一點做。'}],term:{name:'Asynchronous（非同步）',plain:'先把工作收下來，最終結果稍後再取得。'}},
{id:'states',eyebrow:'「收到」不是「完成」',title:'工作現在走到哪一步？',intro:'通知可能經過「API 收到 → 進 queue → worker 取到 → provider 接受 → 最終結果」。每一步知道的事情都不同。',prompt:'如果畫面只顯示「已送出」，最安全的解讀是？',options:[
{label:'系統只承諾已接受這份工作，完成狀態要另外確認',feedback:'Accepted、queued、processed 和 business completed 是不同狀態。介面要說清楚目前承諾到哪一步。'},
{label:'既然已送出，就代表收件者一定收到',feedback:'上游接受工作不能證明後面的 worker、provider 或收件結果。'}],term:{name:'Queue（佇列）',plain:'可以先把工作收下來排隊；工作進 queue 不代表工作已完成。'}},
{id:'pressure',eyebrow:'後面做不完',title:'Queue 越來越長代表什麼？',intro:'每分鐘進來 1000 件工作，worker 每分鐘只能完成 500 件。',prompt:'多一個 queue 能讓問題自己消失嗎？',options:[
{label:'不會；長期處理速度不足，backlog 仍會一直長',feedback:'Queue 可以吸收短暫尖峰，但不會創造處理能力。系統還要限制流入、增加合理 capacity 或接受更長等待。'},
{label:'會；有 queue 就等於可以無限承受流量',feedback:'Queue 只把等待保存起來。長期 arrival rate 大於 processing rate，問題只會延後。'}],term:{name:'Backpressure（背壓）',plain:'後面處理不完時，系統需要限制、延後或拒絕前面繼續送進來的工作。'}},
{id:'transfer',eyebrow:'Transfer 練習',title:'轉錄完成，摘要失敗，要全部重跑嗎？',intro:'音檔處理依序產生 transcript、speaker 資訊、summary 和 export。',prompt:'哪個設計最有助於從中間接續？',options:[
{label:'保存可辨認版本的中間產物與 job state',feedback:'知道哪些步驟已完成，就能只重做失敗後的部分；也要確認後一步是否真的依賴前一步。'},
{label:'任何一步失敗都從原始音檔全部重跑',feedback:'這可能重做昂貴工作，也失去已經確認完成的結果。'}]}]},
{id:'failure',number:5,title:'出錯後，我現在到底知道什麼？',summary:'先判斷已知、未知與已發生的副作用，再決定是否重試。',stages:[
{id:'timeout',eyebrow:'先判斷已知程度',title:'Timeout 等於付款失敗嗎？',intro:'付款 request 已送出，但 caller 在期限內沒有拿到 response。',prompt:'現在最安全的結論是？',options:[
{label:'不知道付款效果是否已經發生',feedback:'Request 可能沒到、還在處理，也可能已扣款但 response 遺失。Timeout 描述的是等待結果，不是遠端效果。'},
{label:'付款一定失敗，可以直接再扣一次',feedback:'如果遠端其實已完成付款，直接重送可能產生第二次副作用。'}],term:{name:'Unknown outcome（結果未知）',plain:'目前證據不足以判定這次操作的效果是否已經發生。'}},
{id:'retry',eyebrow:'重試也有副作用',title:'現在直接再試一次會怎樣？',intro:'假設第一次其實已經扣款，只是 response 遺失。',prompt:'怎麼讓重送比較安全？',options:[
{label:'用同一個 logical operation identity，先查證或讓重送不多產生一次效果',feedback:'這需要系統真的保存／辨認同一次操作；不是單純多帶一個 UUID 就完成。'},
{label:'每次 retry 都產生新的付款操作',feedback:'這會讓系統把同一件事當成不同操作，無法阻止 duplicate charge。'}],term:{name:'Idempotency（冪等）',plain:'同一件事被重送時，不應多產生一次定義範圍外的效果。'}},
{id:'recover',eyebrow:'不是所有事情都能倒轉',title:'Email 已寄出，還能 rollback 嗎？',intro:'某些外部效果已經發生，資料庫 rollback 也收不回對方收到的 Email。',prompt:'這時比較合理的思路是？',options:[
{label:'保留已發生的事，再做一個修正動作',feedback:'有些流程需要取消、退款、更正或人工處理。修正動作本身也可能失敗，所以仍需要 state 和 evidence。'},
{label:'把 local transaction rollback，就當作 Email 沒寄過',feedback:'Local database state 不能撤銷已發生的 external effect。'}],term:{name:'Compensation（補償）',plain:'事情已經發生、無法直接倒轉時，再做一個新的動作修正結果。'}},
{id:'transfer',eyebrow:'Transfer 練習',title:'按下「發表」後 timeout',intro:'Browser automation 點下發表後沒有看到成功頁面。平台是否已經接受操作，目前不知道。',prompt:'下一步先做什麼？',options:[
{label:'找文章 ID、公開列表或後台狀態，先查證是否已發表',feedback:'先找 authoritative evidence，再決定 retry。若平台的重複操作語意未知，就不能假設重按一定安全。'},
{label:'馬上再按一次發表',feedback:'這是在 unknown outcome 下直接重做有副作用的操作，可能產生重複結果。'}]}]},
{id:'evidence',number:6,title:'我憑什麼說做到了？',summary:'先問要證明什麼，再選 test、log、metric 或 trace。',stages:[
{id:'scope',eyebrow:'證據有範圍',title:'API 回 200，能證明什麼？',intro:'同一筆訂單還牽涉資料庫、付款、通知與權限。HTTP response 只看得到其中一部分。',prompt:'哪個說法最準確？',options:[
{label:'至少證明這次 interaction 收到成功 response，其他結果要另外查證',feedback:'Evidence 要帶著範圍理解。200 不會自動證明資料、外部付款或通知都符合需求。'},
{label:'200 就代表整條業務流程全部成功',feedback:'這把一個局部訊號擴大成整個系統的保證。先問這份 evidence 實際觀察到哪裡。'}],term:{name:'Evidence scope（證據範圍）',plain:'一份證據真正涵蓋哪些元件、狀態與條件。'}},
{id:'tests',eyebrow:'測試也有邊界',title:'測試全綠，就代表 production 正確嗎？',intro:'不同 test 可能只跑一個 function、一個 service，或整條使用者流程。',prompt:'理解測試結果時，第一個問題是？',options:[
{label:'這個 test 實際穿過哪些 boundary，哪些 dependency 沒有包含？',feedback:'先看執行範圍，再解讀「通過」能支持什麼結論。名稱是 unit、integration 或 E2E 不是最重要的第一步。'},
{label:'只要叫 E2E，就能證明所有 production 情況',feedback:'E2E 仍有 fixtures、environment、external dependency 與未涵蓋情境。名稱不會取消證據範圍。'}]},
{id:'signals',eyebrow:'同一件事，三種視角',title:'通知沒送到，要看什麼？',intro:'你可能想知道「這一筆發生什麼」、「這一小時失敗多少」或「這次操作經過哪些元件」。',prompt:'如果要追一筆 request 穿過 API、queue、worker 的路徑，最直接的 signal 是？',options:[
{label:'Trace',feedback:'Trace 用來看同一次操作跨多個元件的路徑。Log 適合事件細節，Metric 適合聚合數值。'},
{label:'只看整體失敗率 Metric',feedback:'Metric 能告訴你失敗是否變多，但不一定能還原這一筆操作走過哪條路。'}],term:{name:'Trace（追蹤）',plain:'同一次操作穿過多個元件時，描述整條路徑與時間關係的 telemetry。'}},
{id:'transfer',eyebrow:'Transfer 練習',title:'「資料沒填完不能推進」怎麼留下證據？',intro:'案件畫面已經把下一步按鈕 disabled，但你要確認規則不能被繞過。',prompt:'哪條 evidence chain 比較完整？',options:[
{label:'需求規則 → backend enforcement → automated tests → production transition evidence',feedback:'這條鏈同時回答規則在哪裡被保護、上線前怎麼檢查、上線後怎麼知道真的發生。'},
{label:'只確認畫面按鈕是灰色',feedback:'UI 可以說明操作體驗，但不能證明 API 或其他 caller 無法繞過規則。'}]}]},
{id:'scale',number:7,title:'到底是哪裡撐不住？',summary:'先找 workload 和瓶頸，再加入有理由的複雜度。',stages:[
{id:'workload',eyebrow:'先看工作長什麼樣',title:'三個系統都變成十倍流量',intro:'News Feed、Video Delivery、URL Shortener 都說流量增加十倍，但它們消耗的資源可能完全不同。',prompt:'哪個資訊最能幫你開始判斷？',options:[
{label:'request / job rate、物件大小、讀寫比例、處理時間和尖峰',feedback:'先把 workload 說清楚，才能知道壓力是在 lookup、bandwidth、compute、database 還是別的地方。'},
{label:'先統一加 Redis、Kafka 和 Kubernetes',feedback:'這些工具各自解不同問題。沒有 workload 和 bottleneck，無法判斷是否需要。'}],term:{name:'Workload（工作負載）',plain:'系統實際要處理的 requests、jobs、資料量與流量分布。'}},
{id:'bottleneck',eyebrow:'找到真正受限的地方',title:'慢，不代表所有地方都慢',intro:'一條 request 會經過 app、database、external API。現在只有 database query 長期接近資源上限。',prompt:'第一個改善方向應該對準哪裡？',options:[
{label:'先量測並處理 database query / index / data path',feedback:'先對準目前限制整體表現的 resource。改完後再用同一 workload 重新量測。'},
{label:'先把所有服務都加倍',feedback:'這可能增加成本，但 database 仍是同一個限制點。'}],term:{name:'Bottleneck（瓶頸）',plain:'目前真正限制系統效能或容量的資源或處理階段。'}},
{id:'cache',eyebrow:'改善也有代價',title:'Cache 讓讀取變快，還要擔心什麼？',intro:'常讀的資料先保存一份副本，可以減少回到原始資料來源的次數。',prompt:'哪個問題不能省略？',options:[
{label:'這份副本可以舊多久？什麼時候更新或失效？',feedback:'Cache 的效能收益伴隨 freshness 與 invalidation 問題。關鍵業務決策仍要知道自己依賴哪個 authority。'},
{label:'用了 cache 就可以假設永遠是最新資料',feedback:'Cache 是副本。它和原始資料之間可能有時間差。'}],term:{name:'Cache（快取）',plain:'先保存一份可再取得的資料副本，讓常見讀取不用每次回到原始來源。'}},
{id:'transfer',eyebrow:'Transfer 練習',title:'數百集 Podcast 需要 Kubernetes 嗎？',intro:'低頻發布、下載遠多於寫入，音檔走 object storage / CDN，後台流量很低。',prompt:'目前最合理的判斷是？',options:[
{label:'先維持簡單架構，等量測顯示新的 bottleneck 再增加元件',feedback:'Object storage / CDN 已處理主要媒體傳輸需求。新增 orchestration 要能指出它正在解哪個已知問題。'},
{label:'只要是公開服務，就先做 microservices + Kubernetes',feedback:'這增加部署與維運面積，但目前 workload 沒有提供需要它的證據。'}]}]},
{id:'evolution',number:8,title:'新版怎麼換上去，舊東西才不會壞？',summary:'把改版看成 code、contract、data 和 traffic 的一段轉換過程。',stages:[
{id:'coexist',eyebrow:'部署不是一瞬間',title:'先刪舊欄位，再部署新版？',intro:'v1 讀寫 full_name；v2 改成 first_name + last_name。Rolling deploy 時，新舊版本會同時存在。',prompt:'哪個風險最先出現？',options:[
{label:'v1 仍在跑，卻已經讀不到它需要的舊 schema',feedback:'改版要考慮一段新舊版本共存的時間，而不是假設所有 instance 同時瞬間更新。'},
{label:'沒有風險，只要 v2 tests 通過即可',feedback:'Tests 沒有消除 production 中 old/new versions coexist 的事實。'}],term:{name:'Backward compatibility（向後相容）',plain:'新版上線時，在約定範圍內，舊 consumer 或舊資料仍能一起工作。'}},
{id:'migration',eyebrow:'分階段改資料',title:'怎麼讓新舊版本都有路可走？',intro:'可以先增加新結構，讓程式同時支援過渡狀態，再搬資料、切換並驗證。',prompt:'哪個順序比較安全？',options:[
{label:'先 expand → 相容程式 → backfill / switch → verify → 最後移除舊結構',feedback:'核心不是背固定六步，而是保留 compatibility window，直到確認舊 consumer 不再需要原結構。'},
{label:'先 drop 舊欄位，再處理程式',feedback:'這會先破壞仍在執行的舊版本。'}],term:{name:'Migration（遷移）',plain:'把 schema、資料、設定或狀態，從舊形態安全移到新形態。'}},
{id:'rollback',eyebrow:'Rollback 不是一個按鈕',title:'切回舊版程式，一切就回去了嗎？',intro:'新版已經寫入新格式資料，也可能已呼叫外部 API。',prompt:'哪個說法比較完整？',options:[
{label:'要分清楚 code、traffic、config、data 和 external effect 各自能不能回復',feedback:'Code rollback 不會自動撤銷資料或外部副作用；有些狀況只能 forward fix 或 compensation。'},
{label:'deploy 舊 binary 就等於整個系統回到過去',feedback:'已經發生的 data migration、message 或 external effect 仍然存在。'}],term:{name:'Rollout（逐步發布）',plain:'分批讓新版接觸更多 instances、traffic 或 users，而不是一次全部替換。'}},
{id:'transfer',eyebrow:'Transfer 練習',title:'三個 repo 都綠燈，能一起上線嗎？',intro:'Frontend、backend、document engine 同時改了 job status，DB 也新增欄位。',prompt:'部署前最需要補哪一類證據？',options:[
{label:'跨 repo contract / E2E 相容性，加上 old/new version coexist 的驗證',feedback:'各 repo CI 只能證明各自 checks。跨系統 change 還要確認 contract、schema、deploy order 與 rollback boundary。'},
{label:'每個 repo CI 都綠，所以不用再看整合',feedback:'局部 checks 不會自動證明跨 repo 的語意與版本相容。'}]}]}];
export function unitById(id){return units.find(u=>u.id===id)||units[0]}
export function stageById(unit,id){return unit.stages.find(s=>s.id===id)||unit.stages[0]}