import test from 'node:test';
import assert from 'node:assert/strict';
import {animations,initialAnimation,changeAnimation,timelineRows} from '../learning/animations.mjs';
import {chapters} from '../learning/chapters.mjs';
test('all seven unit animations have bounded, reversible actions and different outcomes',()=>{
 assert.deepEqual(Object.keys(animations),chapters.map(c=>c.id));
 for(const [id,config] of Object.entries(animations)){
  assert.notDeepEqual(config.modes[0].frames.at(-1).states,config.modes[1].frames.at(-1).states);
  for(let mode=0;mode<config.modes.length;mode++){
   let state={mode,step:0};const history=[];
   for(const frame of config.modes[mode].frames){
    assert.equal(frame.states.length,config.nodes.length);
    assert.ok(frame.action && frame.explanation && config.nodes[frame.focus]);
    if(frame.from!==undefined)assert.ok(config.nodes[frame.from]);
    history.push(state);state=changeAnimation(id,state,{type:'act'});
   }
   assert.equal(changeAnimation(id,state,{type:'act'}),state);
   const before=state;const changed=changeAnimation(id,state,{type:'mode',mode:1-mode});
   assert.equal(changed.step,0);assert.equal(before.step,config.modes[mode].frames.length);
   while(history.length)state=history.pop();
   assert.deepEqual(state,{mode,step:0});
  }
 }
});
test('timeout preserves committed writes and only unprotected retry duplicates them',()=>{
 const [safe,unsafe]=animations.reliability.modes;
 for(const mode of [safe,unsafe]){assert.equal(mode.frames[1].records,1);assert.equal(mode.frames[2].records,1);assert.equal(mode.frames[2].lost,true);}
 assert.equal(safe.frames.at(-1).records,1);assert.equal(unsafe.frames.at(-1).records,2);
});
test('parallel timelines preserve dependencies and use a shared duration scale',()=>{
 for(const dependent of [false,true]){
  const rows=timelineRows(dependent);
  assert.equal(rows[1].total,dependent?6:4);
  for(const row of rows){const [a,b,verify]=row.bars;assert.ok(verify.start>=Math.max(a.start+a.duration,b.start+b.duration));assert.equal(verify.start+verify.duration,row.total);}
  if(dependent)assert.equal(rows[1].bars[1].start,rows[1].bars[0].duration);
 }
});
test('context animation preserves budget and exposes information loss',()=>{
 for(const mode of animations.context.modes)for(const frame of mode.frames)assert.ok(frame.items.reduce((n,i)=>n+i[1],0)<=10);
 assert.ok(animations.context.modes[0].frames[1].items.some(i=>i[0].includes('週五')));
 assert.ok(!animations.context.modes[1].frames[1].items.some(i=>i[0].includes('週五')));
 assert.deepEqual(initialAnimation(),{mode:0,step:0});
});
