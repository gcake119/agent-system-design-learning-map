export function iconKind(label){
 if(/資料庫|來源|案件資料|收件|查詢結果/.test(label))return 'database';
 if(/使用者|你$|人工|負責人/.test(label))return 'person';
 if(/模型|助手|規劃/.test(label))return 'agent';
 if(/驗證|驗收|停止/.test(label))return 'shield';
 if(/信箱|交接/.test(label))return 'envelope';
 if(/資訊|摘要|狀態|觀察|紀錄|任務/.test(label))return 'document';
 return 'server';
}
export function diagramLayout(unit,labels,parallel=false){
 const n=labels.length;
 let positions=n===5?[[32,185],[280,185],[532,52],[532,318],[790,185]]:n===4?[[100,65],[660,65],[660,320],[100,320]]:[[55,95],[380,95],[705,95]];
 let pairs=n===5?[[0,1,'提出任務'],[1,2,'查詢規範'],[1,3,'查詢收件'],[2,4,'規範證據'],[3,4,'收件證據']]:n===4?[[0,1,'觀察後決定'],[1,2,'執行並更新'],[2,3,'檢查結果']]:[[0,1,'取得資訊'],[1,2,'處理結果']];
 if(unit==='loop'&&n===4)pairs.push([3,0,'未完成時再觀察']);
 if(unit==='reliability'&&n===3)pairs=[[0,1,'送出請求'],[1,2,'提交寫入'],[2,1,'寫入結果'],[1,0,'返回回應']];
 if(unit==='context'&&n===3)pairs=[[0,1,'選取與壓縮'],[1,2,'帶入本輪'],[2,0,'需要時刷新']];
 if(unit==='multi'&&n===4)pairs=[[0,1,'整理交接'],[1,2,'驗證後接手'],[2,3,'回傳結果']];
 if(unit==='optimization'&&n===3&&parallel){positions=[[70,65],[70,320],[660,190]];pairs=[[0,2,'案件結果'],[1,2,'信箱結果']];}
 const nodes=labels.map((label,i)=>({label,index:i,x:positions[i][0],y:positions[i][1],kind:iconKind(label)}));
 const edges=pairs.map(([from,to,label],i)=>({from,to,label,index:i+1,path:edgePath(nodes[from],nodes[to],unit)}));
 return {nodes,edges,width:n===5?1000:960,height:n===3&&!parallel?360:520};
}
export function edgePath(a,b,unit=''){
 const w=180,h=140;
 if(unit==='context'&&a.index===2&&b.index===0)return `M ${a.x+90} ${a.y+h} V 310 H ${b.x+90} V ${b.y+h}`;
 if(Math.abs(b.x-a.x)>Math.abs(b.y-a.y)){
  const right=b.x>a.x;const x1=a.x+(right?w:0),x2=b.x+(right?0:w);
  const offset=unit==='reliability'?(right?-24:24):0;
  const y1=a.y+h/2+offset,y2=b.y+h/2+offset,m=(x1+x2)/2;
  return `M ${x1} ${y1} C ${m} ${y1}, ${m} ${y2}, ${x2} ${y2}`;
 }
 const down=b.y>a.y;const x1=a.x+w/2,x2=b.x+w/2,y1=a.y+(down?h:0),y2=b.y+(down?0:h),m=(y1+y2)/2;
 return `M ${x1} ${y1} C ${x1} ${m}, ${x2} ${m}, ${x2} ${y2}`;
}
export function edgePoint(a,b,unit=''){
 if(unit==='context'&&a.index===2&&b.index===0)return {x:(a.x+b.x)/2+90,y:310};
 const horizontal=Math.abs(b.x-a.x)>Math.abs(b.y-a.y);
 return {x:(a.x+b.x)/2+90,y:(a.y+b.y)/2+70+(unit==='reliability'&&horizontal?(b.x>a.x?-24:24):0)};
}
export function textLines(text,size=13){const chars=Array.from(text||'');const lines=[];for(let i=0;i<chars.length;i+=size)lines.push(chars.slice(i,i+size).join(''));return lines;}
