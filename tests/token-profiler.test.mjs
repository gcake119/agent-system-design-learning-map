import test from 'node:test';
import assert from 'node:assert/strict';
import { workflow, calls, sources, sourceTotals, totals, scenarios, transfer } from '../learning/decks/token-profiler/data.mjs';
import { initialDeckState, transition, visibleCalls, essentialInformation } from '../learning/decks/token-profiler/model.mjs';
test('canonical calls and attribution agree on 162k input and 9.4k output', () => {
 assert.deepEqual(totals, {input:162000,output:9400,calls:7});
 assert.deepEqual(sourceTotals.map(s=>s.tokens),[58000,43000,28000,16000,10000,7000]);
 assert.equal(sourceTotals.reduce((n,s)=>n+s.tokens,0),totals.input);
 for(const call of calls) assert.equal(call.parts.reduce((a,b)=>a+b,0),call.input);
 assert.equal(sources.length,6);
});
test('workflow counts only model calls; Test failure is a separate step',()=>{
 let state=initialDeckState();
 workflow.forEach((step,index)=>{state=transition(state,'runStep');assert.equal(visibleCalls(state),workflow.slice(0,index+1).filter(s=>s!=='Test').length);});
 assert.equal(visibleCalls(state),7);
});
test('redesign results and quality tradeoff remain explicit',()=>{
 let state=transition(initialDeckState(),'scenario','state');
 assert.equal(scenarios[state.scenario].input,96000);
 state=transition(state,'scenario','summary');
 assert.ok(scenarios.summary.input<scenarios.state.input);
 assert.equal(scenarios.summary.pass,false);
});
test('transfer profiler sums to one hundred percent',()=>assert.equal(transfer.reduce((n,s)=>n+s.share,0),100));
test('navigation, back, and restart are deterministic',()=>{
 const start=initialDeckState();
 const one=transition(start,'next');
 const two=transition(one,'scenario','summary');
 assert.equal(transition(two,'back').scenario,'baseline');
 assert.deepEqual(transition(one,'back'),start);
 assert.deepEqual(transition(two,'restart'),start);
});
test('essential information is state data independent of animation',()=>{
 let state=initialDeckState();
 for(let i=0;i<8;i++)state=transition(state,'runStep');
 state=transition(state,'next');
 assert.deepEqual(essentialInformation(state),{stage:1,runStep:7,calls:7,scenario:'baseline',rerun:false,verified:false,transferChoice:null});
});
