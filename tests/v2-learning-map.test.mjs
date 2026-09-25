import test from 'node:test';import assert from 'node:assert/strict';import {units,unitById,stageById} from '../learning/v2/course.mjs';import {parseV2Route,v2Route,choose,finalIncident} from '../learning/v2/interaction.mjs';
test('v2 keeps eight system-design questions',()=>{assert.equal(units.length,8);assert.deepEqual(units.map(u=>u.number),[1,2,3,4,5,6,7,8]);});
test('first slice has interactive units 1 and 2',()=>{assert.ok(unitById('requirements').stages.length>=3);assert.ok(unitById('boundaries').stages.length>=4);});
test('v2 route resolves map and stage',()=>{assert.deepEqual(parseV2Route('#/v2'),{view:'map'});assert.deepEqual(parseV2Route(v2Route('requirements','rule')),{view:'unit',unit:'requirements',stage:'rule'});});
test('unknown stage falls back deterministically',()=>{assert.equal(stageById(unitById('requirements'),'missing').id,'enough');});
test('choice reveals feedback and optional term',()=>{const stage=stageById(unitById('requirements'),'enough');const result=choose(stage,0);assert.match(result.feedback,/規則/);assert.match(result.term.name,/Constraint/);});
test('invalid choice does not invent state',()=>{assert.equal(choose(stageById(unitById('requirements'),'enough'),99),null);});
test('units 3 to 5 expose the intended reasoning progression',()=>{assert.deepEqual(['concurrency','async','failure'].map(id=>unitById(id).stages.length),[4,4,4]);assert.equal(stageById(unitById('failure'),'timeout').term.name.startsWith('Unknown outcome'),true);});
test('transfer stages do not name the solution in their prompt',()=>{for(const id of ['concurrency','async','failure']){const s=stageById(unitById(id),'transfer');assert.ok(s);assert.doesNotMatch(s.prompt,/Redis|transaction|queue|idempotency/i);}});

test('all eight units now have learner-facing stages',()=>{for(const unit of units)assert.ok(unit.stages.length>=3,`${unit.id} has too few stages`);});
test('units 6 to 8 end with unprompted transfer practice',()=>{for(const id of ['evidence','scale','evolution'])assert.equal(unitById(id).stages.at(-1).id,'transfer');});
test('final transfer route and incidents are deterministic',()=>{assert.equal(parseV2Route('#/v2/final').view,'final');assert.equal(finalIncident('unknown').id,'unknown');assert.equal(finalIncident('missing').id,'concurrent');});
test('core first-use terms include plain-language definitions',()=>{for(const unit of units){for(const stage of unit.stages){if(stage.term){assert.ok(stage.term.name.length>2);assert.ok(stage.term.plain.length>8);}}}});
