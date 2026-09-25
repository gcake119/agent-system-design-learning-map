export const transferProfiles={
 requirements:{title:'心理師＋場地預約',system:['個案','預約系統','心理師行程','場地'],assumptions:['一次預約需要心理師與場地','兩種資源都可能已有其他預約'],prompt:'不要先選 Calendar API。改變預約規則與條件，找出哪些問題必須先確認。'},
 boundaries:{title:'案件追蹤 multi-repo',system:['Frontend','Backend','Document Engine','Database'],assumptions:['Backend 管案件 workflow','Document Engine 處理文件'],prompt:'Repo 數量不是 service 數量。改 boundary，觀察 shared write、trust 與 coordination。'},
 concurrency:{title:'心理師＋場地同時預約',system:['個案','Booking App','Therapist','Room'],assumptions:['appointment 需要兩種資源都可用','兩個 request 可能同時建立'],prompt:'保留 concurrent writers，重新問：這次不能被破壞的 rule 涵蓋哪些資源？'},
 async:{title:'VocaScript 處理流程',system:['Audio','Transcription','Diarization','Summary / Export'],assumptions:['部分步驟耗時','中間結果可以被識別'],prompt:'調 arrival / workers / async，再判斷哪些 intermediate artifact 值得保存。'},
 failure:{title:'自動發文',system:['Browser Automation','Publish Action','Platform','Published Post'],assumptions:['點擊後可能 timeout','平台重複操作語意未知'],prompt:'不要假設重按安全。用同一套 timeout / verify / retry / idempotency controls 觀察風險。'},
 evidence:{title:'案件狀態推進',system:['UI','Backend Rule','Database','Audit Evidence'],assumptions:['資料未完成不得推進','UI 可以被繞過'],prompt:'切換 evidence view，找出哪一份證據能支持「規則真的沒有被繞過」。'},
 scale:{title:'小型 Podcast Hosting',system:['Listener','Pages / RSS','Object Storage / CDN','Counter / Metadata'],assumptions:['下載遠多於寫入','音檔遠大於 metadata','後台流量低'],prompt:'先用小 workload。只有量測出 bottleneck 時，才打開新的 architecture control。'},
 evolution:{title:'案件系統跨 repo 改版',system:['Frontend v1/v2','Backend','Document Engine','PostgreSQL'],assumptions:['job status 從 2 種變 4 種','DB 新增欄位','old frontend 可能仍在線'],prompt:'調 rollout / compatibility / schema，找出 deploy order 與 rollback 不可逆點。'}
};
export function transferFor(unitId){return transferProfiles[unitId]||null}