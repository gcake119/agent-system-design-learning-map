import {finalIncidents,finalDefaults,simulateFinal,incidentById} from '../learning/sim/final-integrated.mjs';
import {useLabSession,resetLabSession,snapshotLabSession,applyTransferBaseline} from '../learning/sim/session.mjs';
import {transferFor} from '../learning/sim/transfers.mjs';
import {lessonLabs,labFor,focusControls} from '../learning/sim/lesson-labs.mjs';
import {simulateRequirements} from '../learning/sim/models/requirements.mjs';
import {simulateBoundaries} from '../learning/sim/models/boundary.mjs';
import {simulateEvidence} from '../learning/sim/models/evidence.mjs';
import {simulateRollout} from '../learning/sim/models/rollout.mjs';
import {simulateQueue} from '../learning/sim/models/queue.mjs';
import {simulateFailure} from '../learning/sim/models/failure.mjs';
import {simulateConcurrency} from '../learning/sim/models/concurrency.mjs';
import {simulateCapacity} from '../learning/sim/models/capacity.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import {units,unitById,stageById} from '../learning/course.mjs';import {parseRoute,courseRoute,choose,finalIncident} from '../learning/interaction.mjs';
test('course keeps eight system-design questions',()=>{assert.equal(units.length,8);assert.deepEqual(units.map(u=>u.number),[1,2,3,4,5,6,7,8]);});
test('first slice has interactive units 1 and 2',()=>{assert.ok(unitById('requirements').stages.length>=3);assert.ok(unitById('boundaries').stages.length>=4);});
test('course route resolves map and stage',()=>{assert.deepEqual(parseRoute('#/'),{view:'map'});assert.deepEqual(parseRoute(courseRoute('requirements','rule')),{view:'unit',unit:'requirements',stage:'rule'});});
test('invalid route does not silently render another lesson',()=>{for(const route of ['#/missing','#/failure/missing','#/final/missing'])assert.deepEqual(parseRoute(route),{view:'notfound'});});
test('unknown stage falls back deterministically',()=>{assert.equal(stageById(unitById('requirements'),'missing').id,'enough');});
test('choice reveals feedback and optional term',()=>{const stage=stageById(unitById('requirements'),'enough');const result=choose(stage,0);assert.match(result.feedback,/規則/);assert.match(result.term.name,/Constraint/);});
test('invalid choice does not invent state',()=>{assert.equal(choose(stageById(unitById('requirements'),'enough'),99),null);});
test('units 3 to 5 expose the intended reasoning progression',()=>{assert.deepEqual(['concurrency','async','failure'].map(id=>unitById(id).stages.length),[4,4,4]);assert.equal(stageById(unitById('failure'),'timeout').term.name.startsWith('Unknown outcome'),true);});
test('transfer stages do not name the solution in their prompt',()=>{for(const id of ['concurrency','async','failure']){const s=stageById(unitById(id),'transfer');assert.ok(s);assert.doesNotMatch(s.prompt,/Redis|transaction|queue|idempotency/i);}});

test('all eight units now have learner-facing stages',()=>{for(const unit of units)assert.ok(unit.stages.length>=3,`${unit.id} has too few stages`);});
test('units 6 to 8 end with unprompted transfer practice',()=>{for(const id of ['evidence','scale','evolution'])assert.equal(unitById(id).stages.at(-1).id,'transfer');});
test('final transfer route and incidents are deterministic',()=>{assert.equal(parseRoute('#/final').view,'final');assert.equal(finalIncident('unknown').id,'unknown');assert.equal(finalIncident('missing').id,'concurrent');});
test('core first-use terms include plain-language definitions',()=>{for(const unit of units){for(const stage of unit.stages){if(stage.term){assert.ok(stage.term.name.length>2);assert.ok(stage.term.plain.length>8);}}}});

test('concurrency simulator makes invariant break observable',()=>{const unsafe=simulateConcurrency({capacity:1,writers:2,mechanism:'none'});assert.equal(unsafe.invalid,1);assert.equal(unsafe.ruleHeld,false);const safe=simulateConcurrency({capacity:1,writers:2,mechanism:'constraint'});assert.equal(safe.invalid,0);assert.equal(safe.rejected,1);});
test('locking trades correctness for visible waiting in the teaching model',()=>{const r=simulateConcurrency({capacity:1,writers:5,mechanism:'lock'});assert.equal(r.ruleHeld,true);assert.ok(r.waitMs>0);});
test('capacity simulator exposes database bottleneck and cache consequence',()=>{const base=simulateCapacity({preset:'url',requestsPerSec:20000,cache:false});assert.ok(base.bottlenecks.includes('db'));const cached=simulateCapacity({preset:'url',requestsPerSec:20000,cache:true,cacheHit:.85});const db=cached.nodes.find(n=>n.id==='db');assert.ok(db.incoming<base.nodes.find(n=>n.id==='db').incoming);});
test('video CDN changes origin bandwidth rather than pretending request work vanished',()=>{const base=simulateCapacity({preset:'video',requestsPerSec:10000,cdn:false,objectKB:5000,cacheHit:.9});const edge=simulateCapacity({preset:'video',requestsPerSec:10000,cdn:true,objectKB:5000,cacheHit:.9});assert.ok(edge.bandwidthMbps<base.bandwidthMbps);});

test('async queue separates response latency from completion and exposes backlog',()=>{const sync=simulateQueue({arrivalRate:800,workerRate:400,workers:1,async:false});const asyncRun=simulateQueue({arrivalRate:800,workerRate:400,workers:1,async:true});assert.ok(asyncRun.requestLatency<sync.requestLatency);assert.ok(asyncRun.queueDepth>0);assert.ok(asyncRun.completionLatency>asyncRun.requestLatency);});
test('more workers reduce queue backlog when capacity catches up',()=>{const one=simulateQueue({arrivalRate:800,workerRate:400,workers:1,async:true});const two=simulateQueue({arrivalRate:800,workerRate:400,workers:2,async:true});assert.ok(two.queueDepth<one.queueDepth);assert.equal(two.queueDepth,0);});
test('blind retries increase provider load and can duplicate effects',()=>{const base=simulateFailure({operations:1000,timeoutRate:.1,retries:0});const retry=simulateFailure({operations:1000,timeoutRate:.1,retries:3,idempotency:false});assert.ok(retry.providerLoad>base.providerLoad);assert.ok(retry.duplicateEffects>0);});
test('idempotency removes duplicate effects without pretending unknown outcomes vanish',()=>{const r=simulateFailure({operations:1000,timeoutRate:.1,retries:1,idempotency:true});assert.equal(r.duplicateEffects,0);assert.ok(r.unknown>=0);});
test('verification before retry reduces blind retry candidates and provider load',()=>{const blind=simulateFailure({operations:1000,timeoutRate:.1,retries:1,verifyBeforeRetry:false});const verify=simulateFailure({operations:1000,timeoutRate:.1,retries:1,verifyBeforeRetry:true});assert.ok(verify.providerLoad<blind.providerLoad);assert.ok(verify.verifiedBeforeRetry>0);});

test('evidence views expose different slices of the same failure',()=>{const log=simulateEvidence({failure:'worker-crash',view:'log'});const trace=simulateEvidence({failure:'worker-crash',view:'trace'});const state=simulateEvidence({failure:'worker-crash',view:'state'});assert.notDeepEqual(log.items,trace.items);assert.match(trace.items.join(' '),/Worker/);assert.match(state.items.join(' '),/artifact = missing/);});
test('rollout limits exposure but cannot repair incompatibility',()=>{const ten=simulateRollout({rollout:10,compatibility:false,schema:'expanded'});const full=simulateRollout({rollout:100,compatibility:false,schema:'expanded'});assert.ok(ten.affectedTraffic>0);assert.ok(full.blastRadius>ten.blastRadius);assert.equal(full.canPromote,false);});
test('bounded rollout exposes only intersecting old and new traffic in the synthetic model',()=>{const zero=simulateRollout({rollout:0,compatibility:false,schema:'expanded'});const ten=simulateRollout({rollout:10,compatibility:false,schema:'expanded'});assert.equal(zero.affectedTraffic,0);assert.equal(ten.affectedTraffic,9);assert.equal(ten.rollbackSafe,false);});
test('contracting schema while old version exists makes rollback unsafe',()=>{const safe=simulateRollout({rollout:50,compatibility:true,schema:'expanded'});const unsafe=simulateRollout({rollout:50,compatibility:true,schema:'contracted'});assert.equal(safe.rollbackSafe,true);assert.equal(unsafe.rollbackSafe,false);assert.ok(unsafe.incompatibleOldTraffic>0);});

test('requirement changes alter downstream design concerns before choosing components',()=>{const simple=simulateRequirements({seatModel:'general'});const complex=simulateRequirements({seatModel:'assigned',flashSale:true,hold:true,cancellation:true});assert.ok(complex.questions.find(q=>q.id==='concurrency').level>simple.questions.find(q=>q.id==='concurrency').level);assert.ok(complex.questions.find(q=>q.id==='state').level>simple.questions.find(q=>q.id==='state').level);});
test('changing booking semantics changes the rule being protected',()=>{const assigned=simulateRequirements({seatModel:'assigned'});const general=simulateRequirements({seatModel:'general'});assert.notEqual(assigned.rule,general.rule);});
test('service boundaries make coordination cost visible',()=>{const mono=simulateBoundaries({layout:'modular'});const services=simulateBoundaries({layout:'services'});assert.ok(services.deployUnits>mono.deployUnits);assert.ok(services.crossBoundaryCalls>mono.crossBoundaryCalls);});
test('unsafe shared writes and client-only authorization surface distinct boundary risks',()=>{const r=simulateBoundaries({layout:'modular',directDbWrite:true,clientAuthOnly:true});assert.ok(r.sharedWrites>0);assert.ok(r.risks.some(x=>x.includes('資料')));assert.ok(r.risks.some(x=>x.includes('client')));});

test('every learner-facing stage is backed by a persistent simulator lab',()=>{for(const unit of units){for(const stage of unit.stages){const lab=labFor(unit.id,stage.id);assert.ok(lab,`missing lab for ${unit.id}/${stage.id}`);assert.ok(lab.component);assert.ok(lab.focus);assert.ok(lab.note.length>12);}}});
test('each unit keeps one simulation model across its stages',()=>{for(const unit of units){const components=new Set(unit.stages.map(stage=>labFor(unit.id,stage.id).component));assert.equal(components.size,1,`${unit.id} switches simulation model mid-unit`);}});

test('unit lab session survives stage navigation because state is unit-scoped',()=>{resetLabSession('failure');const first=useLabSession('failure');first.retries=3;first.idempotency=true;const nextStage=useLabSession('failure');assert.equal(nextStage.retries,3);assert.equal(nextStage.idempotency,true);});
test('unit lab sessions remain isolated from each other',()=>{resetLabSession('concurrency');resetLabSession('scale');useLabSession('concurrency').writers=5;assert.equal(useLabSession('scale').rps,1000);assert.equal(snapshotLabSession('concurrency').writers,5);});
test('lab reset restores the experiment baseline',()=>{const s=useLabSession('async');s.workers=4;s.asyncMode=true;resetLabSession('async');assert.deepEqual(snapshotLabSession('async'),{arrival:800,workerRate:400,workers:1,asyncMode:false});});

test('lesson controls are progressively disclosed instead of front-loading the whole unit',()=>{assert.deepEqual(focusControls.failure.timeout,['timeout rate']);assert.ok(focusControls.failure.retry.length>focusControls.failure.timeout.length);assert.ok(focusControls.failure.safety.length>focusControls.failure.retry.length);assert.deepEqual(focusControls.scale.workload,['scenario','traffic']);assert.ok(focusControls.scale.intervention.includes('architecture'));});
test('early concurrency stage hides protection mechanism until learner observes the race',()=>{assert.deepEqual(focusControls.concurrency.writers,['同時 writers']);assert.ok(focusControls.concurrency.mechanism.includes('寫入保護'));});
test('rollout lesson does not expose schema control before coexistence is observed',()=>{assert.deepEqual(focusControls.evolution.coexist,['rollout']);assert.ok(focusControls.evolution.schema.includes('schema'));});

test('every unit has a domain transfer profile with visible assumptions',()=>{for(const unit of units){const t=transferFor(unit.id);assert.ok(t,`missing transfer for ${unit.id}`);assert.ok(t.system.length>=4);assert.ok(t.assumptions.length>=2);assert.ok(t.prompt.length>20);}});
test('transfer baseline changes domain conditions without leaking state to another unit',()=>{resetLabSession('failure');resetLabSession('scale');applyTransferBaseline('failure');const failure=snapshotLabSession('failure');assert.equal(failure.timeoutRate,.08);assert.equal(failure.retries,0);assert.equal(snapshotLabSession('scale').preset,'url');});
test('transfer profiles use user-experienced cases only as transfer, not as canonical answer labels',()=>{assert.match(transferFor('scale').title,/Podcast/);assert.match(transferFor('failure').title,/自動發文/);assert.match(transferFor('async').title,/VocaScript/);});

test('final transfer injects five incidents into one integrated system',()=>{assert.deepEqual(finalIncidents.map(x=>x.id),['concurrent','unknown','backlog','provider','version']);assert.equal(incidentById('missing').id,'concurrent');});
test('final concurrency incident starts unsafe and can be repaired with a learned mechanism',()=>{const unsafe=simulateFinal('concurrent',finalDefaults.concurrent);const safe=simulateFinal('concurrent',{...finalDefaults.concurrent,mechanism:'constraint'});assert.ok(unsafe.invalid>0);assert.equal(safe.invalid,0);});
test('final backlog incident exposes capacity mismatch',()=>{const overloaded=simulateFinal('backlog',finalDefaults.backlog);const scaled=simulateFinal('backlog',{...finalDefaults.backlog,workers:4});assert.ok(overloaded.queueDepth>0);assert.ok(scaled.queueDepth<overloaded.queueDepth);});
test('final unknown incident rewards verification before retry rather than naming a chapter',()=>{const blind=simulateFinal('unknown',{...finalDefaults.unknown,retries:1});const checked=simulateFinal('unknown',{...finalDefaults.unknown,retries:1,verify:true});assert.ok(checked.providerLoad<blind.providerLoad);});
test('final version incident keeps rollout and compatibility as separate levers',()=>{const broken=simulateFinal('version',finalDefaults.version);const compatible=simulateFinal('version',{...finalDefaults.version,compatibility:true});assert.ok(broken.affectedTraffic>compatible.affectedTraffic);assert.equal(compatible.rollbackSafe,true);});

test('sync overload is represented as waiting requests rather than queue backlog',()=>{const sync=simulateQueue({arrivalRate:800,workerRate:400,workers:1,async:false,seconds:10});assert.equal(sync.queueDepth,0);assert.ok(sync.waitingRequests>0);const asyncRun=simulateQueue({arrivalRate:800,workerRate:400,workers:1,async:true,seconds:10});assert.ok(asyncRun.queueDepth>0);assert.equal(asyncRun.waitingRequests,0);});
test('final incident prompts describe symptoms without naming the learned mechanisms',()=>{for(const incident of finalIncidents){assert.doesNotMatch(incident.question,/retry|冪等|queue|compatibility|schema|constraint|lock/i);assert.ok(incident.hotspots.length>0);}});


test('rendered final navigation links resolve to every next incident',async()=>{
  const {readFile}=await import('node:fs/promises');
  const {createSSRApp}=await import('vue');
  const {renderToString}=await import('vue/server-renderer');
  const {finalTransfer}=await import('../learning/final-transfer.mjs');
  const source=await readFile(new URL('../learning/LearningMap.vue',import.meta.url),'utf8');
  const template=source.slice(source.indexOf('<template>')+10,source.lastIndexOf('</template>'));
  for(let i=0;i<finalTransfer.incidents.length;i++){
    const incident=finalTransfer.incidents[i],nextIncident=finalTransfer.incidents[i+1];
    const app=createSSRApp({template,setup:()=>({routeState:{view:'final'},incident,incidentIndex:i,finalTransfer,nextIncident,courseRoute})});
    app.component('FinalIntegratedSimulator',{template:'<div></div>'});
    app.component('LessonLab',{template:'<div></div>'});
    const html=await renderToString(app);
    const href=html.match(/href="([^"]+)"[^>]*>(?:注入下一個事故|完成第一輪) →/)[1];
    assert.equal(href,nextIncident?`#/final/${nextIncident.id}`:'#/');
    assert.deepEqual(parseRoute(href),nextIncident?{view:'final',incident:nextIncident.id}:{view:'map'});
  }
});
