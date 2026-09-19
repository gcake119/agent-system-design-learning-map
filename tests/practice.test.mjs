import test from 'node:test';
import assert from 'node:assert/strict';
import {practices,initialPractice,stepPractice,replayPractice,readPractices,practiceMarkdown} from '../learning/practice.mjs';
const act=index=>({type:'act',index}),pick=index=>({type:'toggle',index});
test('all concrete tasks terminate on every action branch with an explained outcome',()=>{
 for(const [id,task] of Object.entries(practices)){
  const visit=(state,events,depth=0)=>{assert.ok(depth<8);const scene=task.scenes[state.scene];assert.ok(scene.title&&scene.cards.length);if(scene.rule){assert.ok(scene.term);assert.equal(scene.actions.length,0);assert.deepEqual(readPractices(JSON.stringify({version:3,entries:{[id]:events}}))[id],events);return;}
   const picks=scene.pick?Array.from({length:2**scene.pick.length},(_,mask)=>scene.pick.flatMap((_,i)=>mask&(1<<i)?[pick(i)]:[])):[[]];
   for(const selected of picks){const base=selected.reduce((s,e)=>stepPractice(id,s,e),state);scene.actions.forEach((a,i)=>{const next=stepPractice(id,base,act(i));assert.notEqual(next.scene,base.scene);visit(next,[...events,...selected,act(i)],depth+1);});}
  };visit(initialPractice(),[]);
 }
});
test('undo removes the duplicate reminder outcome and permits querying original operation',()=>{
 const events=[act(0),act(0),act(1)];assert.equal(replayPractice('reliability',events).scene,'duplicate');
 const restored=replayPractice('reliability',events.slice(0,-1));assert.equal(restored.scene,'unknown');
 assert.equal(stepPractice('reliability',restored,act(0)).scene,'safe');
 assert.equal(practices.reliability.scenes.duplicate.cards.filter(c=>c.title.startsWith('提醒 #')).length,2);
});
test('document and handoff selection are required, reversible and preserved across transitions',()=>{
 assert.equal(replayPractice('context',[act(0)]).scene,'missing');
 const e=[pick(0),pick(1),pick(2),act(0)];assert.equal(replayPractice('context',e).scene,'conflict');
 assert.deepEqual(replayPractice('context',e.slice(0,-1)).selected,[0,1,2]);
 assert.equal(replayPractice('multi',[pick(0),pick(1),pick(2),act(0)]).scene,'blocked');
 assert.equal(replayPractice('multi',[pick(0),pick(1),pick(2),pick(3),act(0)]).scene,'safe');
});
test('storage only accepts valid completed action histories and export reflects actual choices',()=>{
 for(const raw of ['bad','null','{"version":2,"entries":{}}','{"version":3,"entries":{"loop":[{"type":"act","index":999}]}}'])assert.deepEqual(readPractices(raw),{});
 assert.deepEqual(readPractices(JSON.stringify({version:3,entries:{reliability:[act(0)]}})),{});
 const events=[act(0),act(0),act(1)];const md=practiceMarkdown({reliability:events});assert.ok(md.includes('再建立一次')&&md.includes('待改善'));assert.equal((md.match(/^## /gm)||[]).length,7);
 assert.equal(stepPractice('multi',initialPractice(),pick(-1)).scene,'start');
});
