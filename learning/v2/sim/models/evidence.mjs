export const evidenceViews={
 log:{label:'Log',question:'這一筆工作發生過哪些離散事件？'},
 metric:{label:'Metric',question:'這一段時間整體有沒有異常？'},
 trace:{label:'Trace',question:'這一筆工作經過哪些元件，卡在哪一段？'},
 state:{label:'Business state',question:'業務結果最後真的存在嗎？'},
};
export function simulateEvidence({failure='worker-crash',view='log'}={}){
 const base={jobId:'JOB-42',failure,view};
 const data={
  log:{items:failure==='worker-crash'?['API accepted JOB-42','Queue delivered JOB-42','Worker started JOB-42','Worker process stopped unexpectedly']:['API accepted JOB-42','Worker completed JOB-42'],conclusion:'能看到事件順序，但單靠 log 還不能證明 artifact 是否存在。'},
  metric:{items:failure==='worker-crash'?['worker_error_rate: 8% ↑','queue_age_p95: 42s ↑','api_2xx_rate: 99.9%']:['worker_error_rate: 0.2%','queue_age_p95: 2s'],conclusion:'能看到整體異常正在發生，但不能只靠聚合數值還原 JOB-42 的完整路徑。'},
  trace:{items:failure==='worker-crash'?['API 18ms ✓','Queue 6ms ✓','Worker 812ms ✕','Artifact Store —']:['API 18ms ✓','Worker 620ms ✓','Artifact Store 31ms ✓'],conclusion:'能看到這一筆工作在哪一段中斷；仍要看 business state 才知道最後產物是否真的存在。'},
  state:{items:failure==='worker-crash'?['job.status = running','artifact = missing','summary = missing']:['job.status = completed','artifact = present'],conclusion:'這是目前最直接的業務結果證據，但不一定告訴你問題為什麼發生。'},
 };
 return {...base,...data[view]};
}