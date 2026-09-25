export function simulateRollout({rollout=10,compatibility=true,schema='expanded',strategy='canary'}={}){
 const pct=Math.max(0,Math.min(100,rollout));
 const oldPct=100-pct;
 const schemaSafe=schema==='expanded';
 // Teaching assumption: new status reaches only the rolled-out share of traffic.
 // An old frontend sees it under a uniform old/new traffic mix; a contracted
 // shared schema breaks every old frontend regardless of rollout exposure.
 const contractAffected=!compatibility?oldPct*pct/100:0;
 const schemaAffected=!schemaSafe?oldPct:0;
 const incompatible=Math.round(Math.max(contractAffected,schemaAffected));
 const affected=incompatible;
 const rollbackSafe=schemaSafe && compatibility;
 return {rollout:pct,oldPct,compatibility,schema,strategy,incompatibleOldTraffic:incompatible,affectedTraffic:affected,rollbackSafe,blastRadius:pct,canPromote:affected===0&&rollbackSafe};
}
