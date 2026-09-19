import test from 'node:test';
import assert from 'node:assert/strict';
import {workbenches,defaultDesign,simulateDesign,readDesigns,designEntry,designMarkdown} from '../learning/design-workbench.mjs';
test('all 56 combinations produce bounded coherent frames and exportable designs',()=>{
 for(const [id,c] of Object.entries(workbenches))for(const a of [0,1])for(const b of [0,1])for(const scenario of [0,1]){
  const d={choices:[a,b],scenario,note:''},copy=JSON.stringify(d),sim=simulateDesign(id,d);
  assert.ok(sim.frames.length>=2 && sim.frames.length<=4);
  for(const frame of sim.frames){assert.equal(frame.states.length,c.nodes.length);assert.ok(frame.action&&frame.explanation);}
  assert.equal(JSON.stringify(d),copy);
  const e=designEntry(id,d);assert.equal(e.fields.length,4);assert.ok(e.approach.includes(c.controls[0].options[a]));assert.ok(e.approach.includes(c.controls[1].options[b]));
  assert.ok(designMarkdown({[id]:d}).includes(sim.result));
 }
});
test('configuration changes affect failure outcomes, freshness and dependencies',()=>{
 const run=(id,choices,scenario=1)=>simulateDesign(id,{choices,scenario});
 assert.equal(run('reliability',[0,0]).frames.at(-1).records,1);
 assert.equal(run('reliability',[0,1]).frames.at(-1).records,2);
 assert.match(run('reliability',[1,0],0).frames.at(-1).states[2],/3 次/);
 assert.equal(run('context',[1,0]).risk,false);
 assert.equal(run('context',[0,1]).risk,true);
 assert.equal(run('optimization',[1,1]).frames.at(-1).failed,true);
 assert.equal(run('optimization',[1,0]).frames.at(-1).parallel,false);
 assert.equal(run('optimization',[1,0],0).frames.at(-1).parallel,true);
 assert.match(run('evidence',[1,1]).result,/拒絕/);
 assert.match(run('multi',[1,1]).result,/退回/);
});
test('v2 storage roundtrips selections and safely ignores corrupt records',()=>{
 const d={...defaultDesign(),choices:[1,0],scenario:1,note:'保留我的補充'};
 const raw=JSON.stringify({version:2,entries:{context:d,unknown:d}});
 assert.deepEqual(readDesigns(raw),{context:d});
 for(const value of ['bad','null','{"version":1}','{"version":2,"entries":null}'])assert.deepEqual(readDesigns(value),{});
 assert.deepEqual(readDesigns('{"version":2,"entries":{"loop":{"choices":[99,null],"scenario":10}}}').loop,defaultDesign());
 assert.ok(designMarkdown({context:d}).includes('保留我的補充'));
 assert.equal((designMarkdown({context:d}).match(/^## /gm)||[]).length,7);
});
