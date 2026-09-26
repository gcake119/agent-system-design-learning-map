const profiles={
 assigned:{label:'指定座位',concerns:{concurrency:3,state:2,capacity:1,authorization:1},rule:'同一場次的同一座位不能有兩筆有效預約'},
 general:{label:'自由入場',concerns:{concurrency:2,state:1,capacity:3,authorization:1},rule:'有效預約總數不能超過場次容量'},
 waitlist:{label:'可候補',concerns:{concurrency:2,state:3,capacity:2,authorization:1},rule:'額滿後需要候補狀態與遞補順序'},
};
export function simulateRequirements({seatModel='assigned',flashSale=false,hold=false,cancellation=false}={}){
 const p=profiles[seatModel]||profiles.assigned;const concerns={...p.concerns};
 if(flashSale){concerns.concurrency++;concerns.capacity+=2}
 if(hold){concerns.state+=2;concerns.concurrency++}
 if(cancellation){concerns.state++;concerns.authorization+=2}
 const questions=[
  {id:'concurrency',label:'同時操作會不會搶到同一資源？',level:concerns.concurrency},
  {id:'state',label:'需要幾種狀態與合法轉換？',level:concerns.state},
  {id:'capacity',label:'尖峰與處理容量會不會改變設計？',level:concerns.capacity},
  {id:'authorization',label:'誰可以修改／取消？',level:concerns.authorization},
 ];
 return {seatModel:p.label,rule:p.rule,flashSale,hold,cancellation,questions,active:questions.filter(q=>q.level>=3).map(q=>q.id)};
}