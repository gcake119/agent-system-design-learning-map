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
{id:'evidence',number:6,title:'我憑什麼說做到了？',summary:'先問要證明什麼，再選 test、log、metric 或 trace。',stages:[]},
{id:'scale',number:7,title:'到底是哪裡撐不住？',summary:'先找 workload 和瓶頸，再加入有理由的複雜度。',stages:[]},
{id:'evolution',number:8,title:'新版怎麼換上去，舊東西才不會壞？',summary:'把改版看成 code、contract、data 和 traffic 的一段轉換過程。',stages:[]}];
export function unitById(id){return units.find(u=>u.id===id)||units[0]}
export function stageById(unit,id){return unit.stages.find(s=>s.id===id)||unit.stages[0]}