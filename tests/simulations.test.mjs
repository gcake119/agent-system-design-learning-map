import test from 'node:test'
import assert from 'node:assert/strict'
import { contextMetrics, loopState, loopNext, profile } from '../data/simulations.mjs'
import { topics, foundations } from '../data/topics.mjs'
import { readFileSync } from 'node:fs'

test('context handles empty selection without NaN', () => {
  assert.deepEqual(contextMetrics([]), {used:0, relevant:0, stale:0, remaining:100, overflow:0})
})
test('context weights relevance by size and reports overflow and stale share', () => {
  assert.deepEqual(contextMetrics([{on:true,size:80,relevance:100,stale:false},{on:true,size:40,relevance:25,stale:true}]),
    {used:120,relevant:75,stale:33,remaining:0,overflow:20})
})
test('successful loop stops after one tool action', () => {
  let s = loopState()
  for (let i=0; i<20; i++) s = loopNext(s, false, 3)
  assert.equal(s.status,'DONE'); assert.equal(s.actions,1); assert.equal(s.round,1)
})
for (const limit of [1,3,5]) test('failed loop is bounded at ' + limit, () => {
  let s=loopState()
  for(let i=0;i<50;i++) s=loopNext(s,true,limit)
  assert.equal(s.status,'HUMAN'); assert.equal(s.round,limit); assert.equal(s.actions,limit)
  assert.equal(loopState().actions,0)
})
test('profiler all 16 combinations remain positive and deterministic', () => {
  for(let n=0;n<16;n++){
    const t={context:!!(n&1),tools:!!(n&2),rules:!!(n&4),routing:!!(n&8)}
    const p=profile(t)
    assert.ok(p.calls>0 && p.tools>0 && p.tokens>0 && +p.time>0 && +p.cost>0)
    assert.deepEqual(p,profile(t))
  }
  assert.deepEqual(profile({}),{calls:12,tools:8,tokens:48,time:'14.2',cost:'0.41'})
  assert.deepEqual(profile({context:true,tools:true,rules:true,routing:true}),{calls:7,tools:4,tokens:32,time:'6.6',cost:'0.10'})
})
test('topic destinations remain attached to their chapter slides', () => {
  const slides=readFileSync(new URL('../slides.md',import.meta.url),'utf8').split(/^---\s*$/m).filter((_,i)=>i>0 && i%2===0)
  assert.equal(slides.length,21)
  for(const t of topics) assert.ok(slides[t.slide-1].includes('title="'+(t.id==='context'?'Context Management':t.id==='reliability'?'Reliability / Guardrails':t.id==='evaluation'?'Evaluation / Verification':t.id==='optimization'?'Cost / Latency Optimization':t.title)+'"'))
  assert.equal(foundations.length,5)
})
