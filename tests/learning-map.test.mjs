import test from 'node:test';
import assert from 'node:assert/strict';

import {units,unitById,stageById} from '../learning/course.mjs';
import {parseRoute,courseRoute} from '../learning/interaction.mjs';
import {flowScenarios,flowScenarioFor} from '../learning/flow-scenarios.mjs';
import {simulateConcurrency} from '../learning/sim/models/concurrency.mjs';
import {simulateQueue} from '../learning/sim/models/queue.mjs';
import {simulateFailure} from '../learning/sim/models/failure.mjs';
import {simulateCapacity} from '../learning/sim/models/capacity.mjs';
import {finalIncidents,finalDefaults,simulateFinal} from '../learning/sim/final-integrated.mjs';
import {emptyProgress,recordStage,visitedStages} from '../learning/progress.mjs';

const ids=['flow','locate','latency','cache','queue','consistency','evidence','redesign'];

test('course exposes the confirmed eight-unit flow investigation curriculum',()=>{
  assert.equal(units.length,8);
  assert.deepEqual(units.map(u=>u.id),ids);
  assert.deepEqual(units.map(u=>u.number),[1,2,3,4,5,6,7,8]);
});

test('every unit has observe reason and transfer stages',()=>{
  for(const unit of units) assert.deepEqual(unit.stages.map(s=>s.id),['observe','reason','transfer']);
});

test('course routes resolve redesigned ids',()=>{
  assert.deepEqual(parseRoute('#/'),{view:'map'});
  assert.deepEqual(parseRoute(courseRoute('locate','observe')),{view:'unit',unit:'locate',stage:'observe'});
  assert.deepEqual(parseRoute('#/missing'),{view:'notfound'});
});

test('unknown stage falls back deterministically inside helpers',()=>{
  assert.equal(stageById(unitById('flow'),'missing').id,'observe');
});

test('every redesigned unit has a persistent flow scenario',()=>{
  for(const id of ids){
    const scenario=flowScenarioFor(id);
    assert.ok(scenario,'missing scenario '+id);
    assert.ok(scenario.nodes.length>=4);
    assert.ok(scenario.modes.length>=4);
  }
});

test('every scenario mode makes state and evidence visible',()=>{
  for(const scenario of Object.values(flowScenarios)){
    for(const mode of scenario.modes){
      assert.ok(scenario.nodes.some(node=>node.id===mode.active),scenario.id+'/'+mode.id+' active node missing');
      assert.ok(['bad','ok','running'].includes(mode.status));
      assert.ok(mode.metrics.length>=2);
      assert.ok(mode.evidence.length>=2);
      assert.ok(mode.takeaway.length>12);
    }
  }
});

test('first-bad-node scenarios distinguish layers',()=>{
  const locate=flowScenarioFor('locate');
  assert.deepEqual(locate.modes.map(m=>m.active),['frontend','api','backend','db','frontend']);
  assert.ok(locate.modes.some(m=>m.metrics.some(x=>/HTTP 500/.test(x))));
  assert.ok(locate.modes.some(m=>m.evidence.some(x=>/render/.test(x))));
});

test('latency scenario exposes distinct bottleneck locations',()=>{
  const latency=flowScenarioFor('latency');
  assert.ok(latency.modes.some(m=>m.active==='db'&&m.status==='bad'));
  assert.ok(latency.modes.some(m=>m.active==='network'&&m.status==='bad'));
  assert.ok(latency.modes.some(m=>m.active==='external'&&m.status==='bad'));
});

test('cache scenario exposes hit miss and stale states',()=>{
  const cache=flowScenarioFor('cache');
  assert.deepEqual(cache.modes.map(m=>m.id),['off','hit','miss','stale']);
  assert.match(cache.modes.find(m=>m.id==='stale').metrics.join(' '),/DB v3/);
});

test('queue scenario separates acceptance from completion',()=>{
  const queue=flowScenarioFor('queue');
  assert.match(queue.modes.find(m=>m.id==='async').metrics.join(' '),/accepted/);
  assert.match(queue.modes.find(m=>m.id==='backlog').metrics.join(' '),/Queue age/);
});

test('consistency scenario shows multiple versions',()=>{
  const consistency=flowScenarioFor('consistency');
  assert.match(consistency.modes.find(m=>m.id==='cachelag').metrics.join(' '),/Primary v3/);
  assert.match(consistency.modes.find(m=>m.id==='replicalag').metrics.join(' '),/Replica v2/);
});

test('evidence scenario keeps evidence surfaces distinct',()=>{
  const evidence=flowScenarioFor('evidence');
  assert.deepEqual(evidence.modes.map(m=>m.id),['logs','metrics','trace','business']);
});

test('legacy causal models still preserve core teaching relationships',()=>{
  const unsafe=simulateConcurrency({capacity:1,writers:2,mechanism:'none'});
  const safe=simulateConcurrency({capacity:1,writers:2,mechanism:'constraint'});
  assert.equal(unsafe.ruleHeld,false);
  assert.equal(safe.ruleHeld,true);

  const sync=simulateQueue({arrivalRate:800,workerRate:400,workers:1,async:false});
  const asyncRun=simulateQueue({arrivalRate:800,workerRate:400,workers:1,async:true});
  assert.ok(asyncRun.requestLatency<sync.requestLatency);

  const base=simulateFailure({operations:1000,timeoutRate:.1,retries:0});
  const retry=simulateFailure({operations:1000,timeoutRate:.1,retries:3,idempotency:false});
  assert.ok(retry.providerLoad>base.providerLoad);

  const uncached=simulateCapacity({preset:'url',requestsPerSec:20000,cache:false});
  const cached=simulateCapacity({preset:'url',requestsPerSec:20000,cache:true,cacheHit:.85});
  assert.ok(cached.nodes.find(n=>n.id==='db').incoming<uncached.nodes.find(n=>n.id==='db').incoming);
});

test('final integrated transfer still exposes mixed incidents',()=>{
  assert.equal(finalIncidents.length,5);
  const overloaded=simulateFinal('backlog',finalDefaults.backlog);
  const scaled=simulateFinal('backlog',{...finalDefaults.backlog,workers:4});
  assert.ok(overloaded.queueDepth>scaled.queueDepth);
});


test('learning progress records visited stages without treating them as mastery',()=>{
  let progress=emptyProgress();
  progress=recordStage(progress,'flow','observe');
  progress=recordStage(progress,'flow','reason');
  progress=recordStage(progress,'flow','reason');
  assert.deepEqual(visitedStages(progress,'flow'),['observe','reason']);
  assert.deepEqual(progress.last,{unitId:'flow',stageId:'reason'});
});
