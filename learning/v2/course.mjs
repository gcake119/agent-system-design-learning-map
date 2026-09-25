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
{id:'concurrency',number:3,title:'兩個人同時改資料會怎樣？',summary:'找到不能被破壞的規則，再看同時操作怎麼繞過它。',stages:[]},
{id:'async',number:4,title:'誰要等到哪一步？',summary:'先定義完成到哪裡，再決定同步、非同步或排隊。',stages:[]},
{id:'failure',number:5,title:'出錯後，我現在到底知道什麼？',summary:'先判斷已知、未知與已發生的副作用，再決定是否重試。',stages:[]},
{id:'evidence',number:6,title:'我憑什麼說做到了？',summary:'先問要證明什麼，再選 test、log、metric 或 trace。',stages:[]},
{id:'scale',number:7,title:'到底是哪裡撐不住？',summary:'先找 workload 和瓶頸，再加入有理由的複雜度。',stages:[]},
{id:'evolution',number:8,title:'新版怎麼換上去，舊東西才不會壞？',summary:'把改版看成 code、contract、data 和 traffic 的一段轉換過程。',stages:[]}];
export function unitById(id){return units.find(u=>u.id===id)||units[0]}
export function stageById(unit,id){return unit.stages.find(s=>s.id===id)||unit.stages[0]}