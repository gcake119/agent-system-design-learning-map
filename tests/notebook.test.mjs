import test from 'node:test';
import assert from 'node:assert/strict';
import { blankEntry, parseNotebook, missingFields, exportNotebook } from '../learning/notebook.mjs';
import { chapters } from '../learning/chapters.mjs';
import { act, initialState, following } from '../learning/interaction.mjs';
test('notebook tolerates corrupt storage and normalizes partial records', () => {
  for (const raw of ['bad', 'null', '{}', '{"version":2,"entries":{}}']) assert.deepEqual(parseNotebook(raw), {});
  const entry = {...blankEntry(), approach:'固定流程', rationale:'容易驗收'};
  const restored = parseNotebook(JSON.stringify({version:1,entries:{overview:entry,unknown:entry}}));
  assert.deepEqual(restored, {overview:entry});
  assert.equal(missingFields(restored.overview),6);
  const partial = parseNotebook('{"version":1,"entries":{"loop":{"fields":[5,"保留"],"approach":false}}}');
  assert.deepEqual(partial.loop.fields,['','保留','','']);
  assert.equal(partial.loop.approach,'');
  const markdown = exportNotebook(restored);
  assert.equal((markdown.match(/^## /gm)||[]).length,7);
  assert.ok(markdown.includes('固定流程') && markdown.includes('容易驗收') && markdown.includes('待補充'));
});
test('condition choices persist and reset on a new scene', () => {
  for (const [c,chapter] of chapters.entries()) for (const [p,scene] of chapter.pages.entries()) {
    if (!scene.deep) continue;
    assert.ok(scene.evidence.length);
    if (!scene.variants) continue;
    assert.equal(scene.variants[1].choices.length,scene.choices.length);
    assert.notDeepEqual(scene.variants[1].choices,scene.choices);
    const changed = {...initialState(c,p),variant:1};
    assert.equal(act(changed,0).variant,1);
    assert.equal(following(act(changed,0)).variant,0);
    assert.equal(changed.choice,-1);
  }
});
