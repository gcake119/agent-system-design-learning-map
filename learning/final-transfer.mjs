export const finalTransfer={
 id:'case-pipeline',title:'案件追蹤＋批次文件處理',intro:'這次不告訴你是哪一章。每個事故都先判斷：現在知道什麼、哪條規則可能被破壞、還需要什麼證據。',
 incidents:[
 {id:'concurrent',title:'兩個 worker 同時更新同一案件',question:'第一個要找的是什麼？',options:[
 {label:'案件狀態的權威寫入端，以及不能被破壞的 transition rule',feedback:'先找 authority 和 rule，再推演兩個更新如何交錯，才知道需要什麼 enforcement。'},
 {label:'先增加第三個 worker',feedback:'這會增加同時操作，沒有處理資料正確性的根本問題。'}]},
 {id:'unknown',title:'文件工作 timeout，但不知道 artifact 有沒有產生',question:'下一步先做什麼？',options:[
 {label:'用 job identity 查 artifact / job state，再決定是否重跑',feedback:'Timeout 是 unknown outcome。先查證已發生的效果，可以避免昂貴工作被重複執行。'},
 {label:'整批文件全部重跑',feedback:'這會丟掉已知進度，也可能重複已完成的效果。'}]},
 {id:'backlog',title:'Queue backlog 持續成長',question:'哪個資訊最重要？',options:[
 {label:'arrival rate、processing rate、queue age 和 downstream capacity',feedback:'先確認是不是長期 capacity mismatch，再決定增加 worker、限流或改變工作方式。'},
 {label:'Queue 還沒滿，所以不用處理',feedback:'Backlog 持續成長已經是等待時間與 capacity 的訊號。'}]},
 {id:'provider',title:'通知 provider 持續失敗',question:'應該無限 retry 嗎？',options:[
 {label:'設定 retry budget，辨認 transient / persistent failure，超限後保留狀態並 escalation',feedback:'Retry 有成本。持續失敗時需要停止條件與可恢復的 job state。'},
 {label:'一直 retry 到成功',feedback:'這可能形成 retry storm，也可能永遠佔用資源。'}]},
 {id:'version',title:'新版新增 job status，舊 frontend 看不懂',question:'這次問題最接近哪個設計缺口？',options:[
 {label:'版本共存期間的 contract / semantic compatibility',feedback:'部署期間 old/new consumer 會共存。新增狀態時要先定義舊 consumer 遇到未知值怎麼處理。'},
 {label:'只要 backend tests 通過就不是系統問題',feedback:'Backend 局部 tests 沒有涵蓋舊 frontend 對新語意的理解。'}]}
 ]};