import test from 'node:test';
import assert from 'node:assert/strict';
import {units,unitById,stageById} from '../learning/course.mjs';
import {lessonContent} from '../learning/lesson-content.mjs';
import {parseRoute,courseRoute} from '../learning/interaction.mjs';
import {finalTransfer} from '../learning/final-transfer.mjs';
import {experimentDefaults,simulateExperiment} from '../learning/experiment-model.mjs';
import {emptyProgress,recordStage,visitedStages} from '../learning/progress.mjs';
test('已確認的八章依先備順序提供必要閱讀及無選項答案的 Transfer',()=>{
 assert.deepEqual(units.map(u=>u.id),['flow','locate','latency','cache','queue','consistency','evidence','redesign']);
 for(const u of units){
  assert.deepEqual(u.stages.map(s=>[s.id,s.mode]),[['observe','INTERACT'],['reason','READ'],['transfer','TRANSFER']]);
  const c=lessonContent[u.id];assert.ok(c.reading.length>=2);assert.ok(c.prerequisite);assert.ok(c.boundaries.length);assert.ok(c.sources.length);
  assert.ok(u.stages.every(s=>s.options.length===0));
 }
});
test('所有現行小節、Final 與錯誤書籤均有明確路由結果',()=>{
 assert.deepEqual(parseRoute('#/'),{view:'map'});
 for(const u of units)for(const s of u.stages)assert.deepEqual(parseRoute(courseRoute(u.id,s.id)),{view:'unit',unit:u.id,stage:s.id});
 for(const i of finalTransfer.incidents)assert.deepEqual(parseRoute(courseRoute('final',i.id)),{view:'final',incident:i.id});
 assert.deepEqual(parseRoute('#/missing'),{view:'notfound'});
 assert.deepEqual(parseRoute('#/flow/missing'),{view:'notfound'});
 assert.equal(stageById(unitById('flow'),'missing').id,'observe');
});
test('每個現行模型的關係都指向存在的節點，結果均有限',()=>{
 for(const u of units)for(const context of ['teaching','transfer']){
  const r=simulateExperiment(u.id,experimentDefaults(u.id,context),context);
  for(const e of r.edges){assert.ok(r.nodes.some(n=>n.id===e.from),u.id+' from '+e.from);assert.ok(r.nodes.some(n=>n.id===e.to),u.id+' to '+e.to);}
  for(const v of Object.values(r.values))if(typeof v==='number')assert.ok(Number.isFinite(v),u.id);
 }
});
test('瀏覽進度是造訪紀錄，包含 Final 續讀但不轉成學習評分',()=>{
 let p=emptyProgress();p=recordStage(p,'flow','observe');p=recordStage(p,'flow','reason');p=recordStage(p,'flow','reason');
 assert.deepEqual(visitedStages(p,'flow'),['observe','reason']);
 p=recordStage(p,'final','unknown');assert.deepEqual(p.last,{unitId:'final',stageId:'unknown'});assert.equal(p.score,undefined);
});
