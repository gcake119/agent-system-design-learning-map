const placements={order:'app',inventory:'app',payment:'app',shipping:'app'};
export function simulateBoundaries({layout='modular',movePayment=false,directDbWrite=false,clientAuthOnly=false}={}){
 const serviceMode=layout==='services';const paymentBoundary=serviceMode||movePayment;
 const deployUnits=serviceMode?4:movePayment?2:1;
 const crossBoundaryCalls=serviceMode?4:movePayment?2:0;
 const networkCalls=crossBoundaryCalls;
 const sharedWrites=directDbWrite?2:0;
 const trustCrossings=(paymentBoundary?1:0)+(clientAuthOnly?1:0);
 const coordinationPoints=crossBoundaryCalls+sharedWrites;
 const risks=[];
 if(directDbWrite)risks.push('多個責任直接修改同一份資料，規則 owner 變模糊');
 if(clientAuthOnly)risks.push('授權只在 client，request 可繞過 UI');
 if(serviceMode)risks.push('獨立部署增加 network / version / observability 協調');
 return {layout,deployUnits,crossBoundaryCalls,networkCalls,sharedWrites,trustCrossings,coordinationPoints,risks,paymentBoundary};
}