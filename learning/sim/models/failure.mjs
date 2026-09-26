export function simulateFailure({operations=1000,timeoutRate=.05,retries=0,idempotency=false,verifyBeforeRetry=false}={}){
 const ops=Math.max(1,operations),rate=Math.max(0,Math.min(1,timeoutRate)),retry=Math.max(0,retries);
 const timedOut=Math.round(ops*rate);
 const remoteSucceededUnknown=Math.round(timedOut*.5);
 const verifiable=verifyBeforeRetry?Math.round(remoteSucceededUnknown*.8):0;
 const retryCandidates=Math.max(0,timedOut-verifiable);
 const retryAttempts=retryCandidates*retry;
 const duplicateEffects=idempotency?0:Math.min(remoteSucceededUnknown-verifiable,retryAttempts);
 const recovered=Math.min(retryAttempts,Math.round(timedOut*.45));
 const unknown=Math.max(0,timedOut-verifiable-recovered);
 return {operations:ops,timedOut,retries:retry,totalAttempts:ops+retryAttempts,duplicateEffects,verifiedBeforeRetry:verifiable,recovered,unknown,providerLoad:ops+retryAttempts};
}