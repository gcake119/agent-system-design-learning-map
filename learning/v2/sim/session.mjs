import {reactive} from 'vue';
const defaults={
 requirements:{seatModel:'assigned',flashSale:false,hold:false,cancellation:false},
 boundaries:{layout:'modular',movePayment:false,directDbWrite:false,clientAuthOnly:false},
 concurrency:{writers:2,mechanism:'none'},
 async:{arrival:800,workerRate:400,workers:1,asyncMode:false},
 failure:{retries:0,idempotency:false,verify:false,timeoutRate:.05},
 evidence:{view:'log',failure:'worker-crash'},
 scale:{preset:'url',rps:1000,cache:false,cdn:false,replicas:1},
 evolution:{rollout:10,compatibility:true,schema:'expanded',strategy:'canary'},
};
const sessions=reactive(structuredClone(defaults));
export function useLabSession(unitId){if(!sessions[unitId])sessions[unitId]={};return sessions[unitId]}
export function resetLabSession(unitId){if(defaults[unitId])Object.assign(sessions[unitId],structuredClone(defaults[unitId]));}
export function snapshotLabSession(unitId){return JSON.parse(JSON.stringify(sessions[unitId]||{}));}
export {defaults as labDefaults};