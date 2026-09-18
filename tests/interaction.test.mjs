import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, following, act } from '../learning/interaction.mjs';
import { chapters } from '../learning/chapters.mjs';
import { readFileSync } from 'node:fs';

test('actions execute all scenes directly and snapshots restore every step', () => {
  let state = initialState();
  const history = [], snapshots = [];
  const total = chapters.reduce((n,c) => n + c.pages.length, 0);
  for (let i = 0; i < total; i++) {
    const target = i ? following(state) : state;
    const scene = chapters[target.chapter].pages[target.page];
    history.push(state);
    snapshots.push(state);
    state = act(state, scene.choices ? 0 : -1, i > 0);
    assert.equal(state.chapter, target.chapter);
    assert.equal(state.page, target.page);
    assert.ok(state.revealed || state.choice === 0);
  }
  assert.equal(following(state), null);
  for (let i = total - 1; i >= 0; i--) {
    state = history.pop();
    assert.deepEqual(state, snapshots[i]);
  }
  assert.deepEqual(state, initialState());
});
test('switching choices preserves prior snapshots and rejects missing choices', () => {
  chapters.forEach((chapter, c) => chapter.pages.forEach((scene, p) => {
    if (!scene.choices) return;
    const start = initialState(c, p);
    assert.deepEqual(act(start), start);
    const first = act(start, 0), second = act(first, 1);
    assert.equal(first.choice, 0);
    assert.equal(second.choice, 1);
    assert.equal(start.choice, -1);
  }));
});
test('UI uses action and undo controls without pagination or arrow-key bypass', () => {
  const app = readFileSync(new URL('../learning/App.vue', import.meta.url), 'utf8');
  for (const removed of ['下一頁', '上一頁', 'ArrowRight', 'ArrowLeft', '@click="next"'])
    assert.ok(!app.includes(removed));
  assert.ok(app.includes('回到上一步'));
  assert.ok(app.includes('perform(i, true)'));
  assert.ok(app.includes('steps.value.pop()'));
});
