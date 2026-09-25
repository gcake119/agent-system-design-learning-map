export function simulateRollout({rollout=10,compatibility=true,schema='expanded',strategy='canary'}={}){
 const pct=Math.max(0,Math.min(100,rollout));
 const oldPct=100-pct;
 const schemaSafe=schema==='expanded';
 const oldBreaks=!compatibility || !schemaSafe;
 const incompatible=Math.round(oldPct*(oldBreaks?1:0));
 const newAffected=Math.round(pct*(!compatibility?0.35:0));
 const affected=Math.min(100,incompatible+newAffected);
 const rollbackSafe=schemaSafe && compatibility;
 return {rollout:pct,oldPct,compatibility,schema,strategy,incompatibleOldTraffic:incompatible,affectedTraffic:affected,rollbackSafe,blastRadius:pct,canPromote:affected===0};
}