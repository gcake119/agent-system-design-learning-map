import test from 'node:test';
import assert from 'node:assert/strict';
import {diagramLayout,edgePoint,textLines} from '../learning/diagram-layout.mjs';
import {animations} from '../learning/animations.mjs';
import {workbenches} from '../learning/design-workbench.mjs';
test('every unit and workbench has bounded nodes and valid directed connections',()=>{
 for(const source of [animations,workbenches])for(const [id,c] of Object.entries(source)){
  const g=diagramLayout(id,c.nodes);
  for(const n of g.nodes){assert.ok(n.x>=12&&n.y>=40);assert.ok(n.x+180<g.width&&n.y+140<g.height);}
  for(const e of g.edges){assert.ok(g.nodes[e.from]&&g.nodes[e.to]);assert.ok(!e.path.includes('NaN'));const p=edgePoint(g.nodes[e.from],g.nodes[e.to],id);assert.ok(p.x>0&&p.x<g.width&&p.y>0&&p.y<g.height);}
 }
});
test('diagrams preserve return paths, context refresh and independent sources',()=>{
 const pairs=id=>diagramLayout(id,animations[id].nodes).edges.map(e=>[e.from,e.to]);
 assert.ok(pairs('loop').some(([a,b])=>a===3&&b===0));
 assert.deepEqual(pairs('reliability'),[[0,1],[1,2],[2,1],[1,0]]);
 assert.ok(pairs('context').some(([a,b])=>a===2&&b===0));
 assert.ok(!pairs('overview').some(([a,b])=>a===2&&b===3));
 assert.equal(textLines('保持完整文字並依長度換行',4).join(''),'保持完整文字並依長度換行');
});
