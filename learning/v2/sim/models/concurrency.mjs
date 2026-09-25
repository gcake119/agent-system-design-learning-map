export const concurrencyMechanisms={
  none:{label:'沒有寫入保護',waitMs:0,accept:(ctx)=>true},
  constraint:{label:'資料庫唯一限制',waitMs:2,accept:(ctx)=>ctx.accepted===0},
  optimistic:{label:'條件式更新',waitMs:1,accept:(ctx)=>ctx.accepted===0},
  lock:{label:'鎖定後再判斷',waitMs:12,accept:(ctx)=>ctx.accepted===0},
};
export function simulateConcurrency({capacity=1,writers=2,mechanism='none'}={}){
  const ruleCapacity=Math.max(1,capacity),count=Math.max(1,writers),m=concurrencyMechanisms[mechanism]||concurrencyMechanisms.none;
  let accepted=0,rejected=0,waitMs=0;
  const attempts=[];
  for(let i=0;i<count;i++){
    const ok=m.accept({accepted,capacity:ruleCapacity,index:i});
    if(ok){accepted++;attempts.push({writer:String.fromCharCode(65+i),result:'accepted'});}
    else{rejected++;attempts.push({writer:String.fromCharCode(65+i),result:'conflict'});}
    if(i>0)waitMs+=m.waitMs;
  }
  const invalid=Math.max(0,accepted-ruleCapacity);
  return {capacity:ruleCapacity,writers:count,mechanism,label:m.label,accepted,rejected,invalid,waitMs,ruleHeld:invalid===0,attempts};
}