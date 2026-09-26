export const capacityComponents={
 app:{label:'App',capacity:12000,latency:18},
 db:{label:'Database',capacity:8000,latency:12},
 cache:{label:'Cache',capacity:60000,latency:2},
 cdn:{label:'CDN',capacity:150000,latency:12},
 origin:{label:'Object Storage',capacity:20000,latency:70},
};
function node(id,incoming,capacity,baseLatency){const util=capacity?incoming/capacity:0;const latency=baseLatency*(util>.8?1+(util-.8)*5:1);return{id,incoming,capacity,utilization:util,latency,status:util>1?'critical':util>.75?'warning':'healthy'};}
export function simulateCapacity({preset='url',requestsPerSec=1000,cache=false,replicas=1,cdn=false,cacheHit=.8,objectKB=2}={}){
 const rps=Math.max(0,requestsPerSec),rep=Math.max(1,replicas),hit=Math.max(0,Math.min(1,cacheHit));
 const nodes=[];let throughput=rps,totalLatency=0,bandwidthMbps=rps*objectKB*8/1000;
 if(preset==='video'){
   const cdnHit=cdn?Math.max(.5,hit):0,originQps=rps*(1-cdnHit);
   if(cdn){const n=node('cdn',rps,capacityComponents.cdn.capacity,capacityComponents.cdn.latency);nodes.push(n);totalLatency+=n.latency;}
   const o=node('origin',originQps,capacityComponents.origin.capacity,capacityComponents.origin.latency);nodes.push(o);totalLatency+=(1-cdnHit)*o.latency;throughput=Math.min(rps,(cdn?capacityComponents.cdn.capacity:0)+capacityComponents.origin.capacity);bandwidthMbps=originQps*objectKB*8/1000;
 }else{
   const app=node('app',rps,capacityComponents.app.capacity*rep,capacityComponents.app.latency);nodes.push(app);totalLatency+=app.latency;
   let dbQps=rps;
   if(cache){const ca=node('cache',rps,capacityComponents.cache.capacity,capacityComponents.cache.latency);nodes.push(ca);totalLatency+=ca.latency;dbQps=rps*(1-hit);}
   const db=node('db',dbQps,capacityComponents.db.capacity,capacityComponents.db.latency);nodes.push(db);totalLatency+=(cache?1-hit:1)*db.latency;
   throughput=Math.min(rps,app.capacity,cache?Math.max(capacityComponents.cache.capacity,capacityComponents.db.capacity):capacityComponents.db.capacity);
 }
 const bottlenecks=nodes.filter(n=>n.utilization>1).map(n=>n.id);
 return {preset,requestsPerSec:rps,cache,replicas:rep,cdn,cacheHit:hit,objectKB,nodes,throughput,totalLatency,bandwidthMbps,bottlenecks};
}