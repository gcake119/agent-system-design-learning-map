import test from 'node:test';
import assert from 'node:assert/strict';
import {chapters,position} from '../learning/chapters.mjs';
import {designRoute,designUnit,nextUnit} from '../learning/navigation.mjs';
test('every unit continues to the next unread opening without wrapping to unit zero',()=>{
 chapters.forEach((c,i)=>{
  const next=nextUnit(c.id);
  if(i===chapters.length-1){assert.equal(next,null);return;}
  assert.equal(next.id,chapters[i+1].id);
  assert.deepEqual(position(next.href),{chapter:i+1,page:0,map:false});
 });
 assert.equal(nextUnit('unknown'),null);
});
test('design links retain the originating unit including on reload',()=>{
 for(const c of chapters)assert.equal(designUnit(designRoute(c.id)),c.id);
 assert.equal(designUnit('#/design'),'overview');
 for(const invalid of ['#/design/unknown','#/learn/loop/1','#/map'])assert.equal(designUnit(invalid),null);
});
