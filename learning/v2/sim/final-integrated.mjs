import {simulateConcurrency} from './models/concurrency.mjs';
import {simulateQueue} from './models/queue.mjs';
import {simulateFailure} from './models/failure.mjs';
import {simulateRollout} from './models/rollout.mjs';

export const finalIncidents=[
 {id:'concurrent',title:'兩個 worker 同時更新同一案件',model:'concurrency',question:'先讓系統真的出現衝突，再決定要在哪裡保護案件狀態。'},
 {id:'unknown',title:'文件工作 timeout，但 artifact 狀態未知',model:'failure',question:'不要直接重跑。先比較查證、retry 與冪等各自改變什麼。'},
 {id:'backlog',title:'文件 Queue backlog 持續成長',model:'queue',question:'調整 arrival 與 workers，找出 queue 只是緩衝、capacity 才決定長期 backlog 的地方。'},
 {id:'provider',title:'通知 Provider 持續失敗',model:'failure',question:'觀察 retry 如何增加 downstream load；安全停止比無限重試重要。'},
 {id:'version',title:'新版 job status 讓舊 Frontend 看不懂',model:'rollout',question:'調 rollout、compatibility 與 schema，限制 blast radius 並保留 rollback path。'},
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