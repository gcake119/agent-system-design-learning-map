export function simulateQueue({arrivalRate=1000,workerRate=400,workers=1,async=true,seconds=10}={}){
 const arrival=Math.max(0,arrivalRate),perWorker=Math.max(1,workerRate),count=Math.max(1,workers),window=Math.max(1,seconds);
 const capacity=perWorker*count,processedPerSec=Math.min(arrival,capacity),growthPerSec=Math.max(0,arrival-capacity);
 const queuedWork=async?Math.round(growthPerSec*window):0;
 const waitingRequests=async?0:Math.round(growthPerSec*window);
 const queueAge=async&&capacity>0?queuedWork/capacity:0;
 const requestLatency=async?35:35+Math.min(5000,1000/perWorker*1000);
 const completionLatency=async?requestLatency+Math.round(queueAge*1000)+Math.round(1000/perWorker*1000):requestLatency;
 return {arrivalRate:arrival,workerRate:perWorker,workers:count,async,capacity,processedPerSec,queueDepth:queuedWork,waitingRequests,queueAge,requestLatency,completionLatency,overloaded:arrival>capacity};
}