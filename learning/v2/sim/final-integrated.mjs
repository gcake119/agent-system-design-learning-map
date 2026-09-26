import {simulateConcurrency} from './models/concurrency.mjs';
import {simulateQueue} from './models/queue.mjs';
import {simulateFailure} from './models/failure.mjs';
import {simulateRollout} from './models/rollout.mjs';

export const finalIncidents=[
 {id:'concurrent',title:'兩個 worker 同時更新同一案件',model:'concurrency',question:'系統留下了互相衝突的案件狀態。改一個設定，觀察哪個結果先改變。',hotspots:['workflow','database']},
 {id:'unknown',title:'文件工作 timeout，但 artifact 狀態未知',model:'failure',question:'畫面沒有拿到結果，但遠端可能已經做完。先用可用設定降低重複效果與未知狀態。',hotspots:['worker','artifact']},
 {id:'backlog',title:'文件工作越積越多',model:'queue',question:'工作進來的速度長期高於處理速度。找出哪個改動能讓等待停止成長。',hotspots:['queue','worker']},
 {id:'provider',title:'通知服務持續沒有回應',model:'failure',question:'系統一直再次嘗試，外部服務的呼叫量正在增加。調整設定，觀察負載與未知結果。',hotspots:['notification']},
 {id:'version',title:'新版 job status 讓舊 Frontend 看不懂',model:'rollout',question:'新舊版本同時在線。改變發布條件，讓受影響範圍與回復能力可見。',hotspots:['ui','workflow','database']},
];
export const finalDefaults={
 concurrent:{writers:2,mechanism:'none'},
 unknown:{timeoutRate:.1,retries:0,idempotency:false,verify:false},
 backlog:{arrival:1200,workerRate:400,workers:1,asyncMode:true},
 provider:{timeoutRate:.15,retries:3,idempotency:false,verify:false},
 version:{rollout:20,compatibility:false,schema:'expanded',strategy:'canary'},
};
export function simulateFinal(id,state){
 if(id==='concurrent')return simulateConcurrency({capacity:1,writers:state.writers,mechanism:state.mechanism});
 if(id==='backlog')return simulateQueue({arrivalRate:state.arrival,workerRate:state.workerRate,workers:state.workers,async:state.asyncMode,seconds:10});
 if(id==='unknown'||id==='provider')return simulateFailure({operations:1000,timeoutRate:state.timeoutRate,retries:state.retries,idempotency:state.idempotency,verifyBeforeRetry:state.verify});
 if(id==='version')return simulateRollout(state);
 return {};
}
export function incidentById(id){return finalIncidents.find(x=>x.id===id)||finalIncidents[0]}