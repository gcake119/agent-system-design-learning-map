import test from 'node:test';
import assert from 'node:assert/strict';
import {experimentDefaults,simulateExperiment} from '../learning/experiment-model.mjs';

test('讀取副本減少來源負載但不會自動刷新資料',()=>{
 const base=experimentDefaults('cache');
 const off=simulateExperiment('cache',base);
 const on=simulateExperiment('cache',{...base,cache:true,hit:90,fresh:false});
 assert.equal(off.values.originReads,1000);
 assert.equal(on.values.originReads,100);
 assert.equal(on.values.readVersion,2);
 assert.ok(on.edges.some(e=>e.from==='cache'&&e.to==='browser'));
 assert.match(on.nodes.find(n=>n.id==='cache').output,/v2/);
});

test('同步改先接收會改等待位置，不增加同一工作的服務能力',()=>{
 const base=experimentDefaults('queue');
 const sync=simulateExperiment('queue',base);
 const asyncRun=simulateExperiment('queue',{...base,async:true});
 assert.equal(sync.values.capacity,asyncRun.values.capacity);
 assert.ok(sync.values.userWait>asyncRun.values.userWait);
 assert.ok(!sync.edges.some(e=>e.to==='queue'));
 assert.ok(asyncRun.edges.some(e=>e.to==='queue'));
 const more=simulateExperiment('queue',{...base,workers:4});
 assert.ok(more.values.unfinished<sync.values.unfinished);
 const failed=simulateExperiment('queue',{...base,failed:true});
 assert.equal(failed.values.completed,0);
 assert.equal(failed.values.unfinished,base.arrival*60);
 assert.equal(failed.values.userWait,null);
 assert.match(failed.metrics[0].value,/未完成/);
 assert.match(failed.nodes.find(n=>n.id==='browser').output,/未完成/);
});
test('副本傳遞與時效需求分開，讀主資料仍看到最新版本',()=>{
 const base=experimentDefaults('consistency');
 const stale=simulateExperiment('consistency',{...base,source:'cache',lag:4,elapsed:2,tolerance:0});
 assert.equal(stale.values.readVersion,2);
 assert.equal(stale.values.acceptable,false);
 const tolerated=simulateExperiment('consistency',{...base,source:'cache',lag:4,elapsed:2,tolerance:5});
 assert.equal(tolerated.values.acceptable,true);
 const caught=simulateExperiment('consistency',{...base,source:'cache',lag:4,elapsed:4});
 assert.equal(caught.values.readVersion,3);
 const primary=simulateExperiment('consistency',{...base,source:'db',lag:10,elapsed:0});
 assert.equal(primary.values.readVersion,3);
 assert.ok(primary.edges.some(e=>e.from==='db'&&e.to==='browser'));
});
test('更換證據角度不改變同一事故未知結果，另查收據才確定',()=>{
 const base=experimentDefaults('evidence');
 for(const evidence of ['logs','metrics','trace','business']){
  assert.equal(simulateExperiment('evidence',{...base,evidence}).values.outcome,'unknown');
 }
 assert.equal(simulateExperiment('evidence',{...base,verified:true}).values.outcome,'completed');
});
test('有效資料庫失敗與合法驗證拒絕使用不同因果位置',()=>{
 const base=experimentDefaults('locate');
 const invalid=simulateExperiment('locate',{...base,incident:1});
 assert.equal(invalid.values.firstAbnormal,'frontend');
 assert.equal(invalid.nodes.find(n=>n.id==='api').status,'ok');
 const dbFail=simulateExperiment('locate',{...base,incident:3});
 assert.equal(dbFail.values.firstAbnormal,'db');
 const fixed=simulateExperiment('locate',{...base,incident:3,repaired:true});
 assert.equal(fixed.values.saved,true);
 assert.equal(fixed.values.rendered,true);
});
test('只修改串行一段耗時，總等待差值與該段一致',()=>{
 const base={...experimentDefaults('latency'),dbMs:500};
 const a=simulateExperiment('latency',base);
 const b=simulateExperiment('latency',{...base,dbMs:base.dbMs+200});
 assert.equal(b.values.totalMs-a.values.totalMs,200);
 assert.equal(b.nodes.find(n=>n.id==='db').output,`${base.dbMs+200} ms`);
});
test('整合設計改變讀取與文件結果，仍不會查證外部效果',()=>{
 const base=experimentDefaults('redesign');
 const a=simulateExperiment('redesign',base);
 const b=simulateExperiment('redesign',{...base,cache:true,workers:4});
 assert.ok(b.values.originReads<a.values.originReads);
 assert.ok(b.values.unfinished<a.values.unfinished);
 assert.equal(b.values.outcome,'unknown');
 assert.ok(b.nodes.some(n=>n.id==='provider'&&n.status==='unknown'));
});
test('Transfer 改需求與證據，而非只換標題',()=>{
 const teaching=simulateExperiment('queue',experimentDefaults('queue'),'teaching');
 const transfer=simulateExperiment('queue',experimentDefaults('queue','transfer'),'transfer');
 assert.equal(teaching.values.duration,30);
 assert.equal(transfer.values.duration,60);
 assert.notDeepEqual(teaching.nodes.find(n=>n.id==='worker').evidence,transfer.nodes.find(n=>n.id==='worker').evidence);
});

test('實驗保存跨小節，Transfer 隔離，壞資料不破壞可用入口',async()=>{
 const {loadExperiment,saveExperiment}=await import('../learning/experiment-storage.mjs');
 const map=new Map();const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const current=loadExperiment('cache','teaching',storage);
 current.state.cache=true;current.state.hit=80;current.note='先核對資料版本';
 assert.equal(saveExperiment('cache','teaching',current,storage),true);
 const restored=loadExperiment('cache','teaching',storage);
 assert.equal(restored.state.hit,80);assert.equal(restored.note,current.note);
 assert.equal(loadExperiment('cache','transfer',storage).state.cache,false);
 const corrupt={getItem:()=>'{broken'};
 assert.equal(loadExperiment('queue','teaching',corrupt).state.workers,1);
 assert.equal(saveExperiment('queue','teaching',{}, {setItem(){throw Error('blocked')}}),false);
});

test('已保存資料的流程必須畫出寫入關係，完成後包含回程',()=>{
 const wrote=simulateExperiment('flow',{step:3});
 assert.equal(wrote.values.saved,true);
 assert.ok(wrote.edges.some(e=>e.from==='backend'&&e.to==='db'));
 const returned=simulateExperiment('flow',{step:4});
 assert.ok(returned.edges.some(e=>e.from==='api'&&e.to==='frontend'));
});

test('禁用瀏覽器 storage 時造訪紀錄也能安全回退',async()=>{
 const {loadProgress,saveProgress}=await import('../learning/progress.mjs');
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('denied');}});
 try {assert.deepEqual(loadProgress(),{last:null,visited:{}});assert.doesNotThrow(()=>saveProgress({}));}
 finally {if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
