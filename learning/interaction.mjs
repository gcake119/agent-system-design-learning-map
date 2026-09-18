import { chapters } from './chapters.mjs';

export function initialState(chapter = 0, page = 0) {
  return { chapter, page, revealed: false, choice: -1, variant: 0 };
}

export function following(state) {
  if (state.page + 1 < chapters[state.chapter].pages.length)
    return initialState(state.chapter, state.page + 1);
  if (state.chapter + 1 < chapters.length)
    return initialState(state.chapter + 1);
  return null;
}

// Every action produces one reversible snapshot, including changing a choice.
export function act(state, choice = -1, advance = false) {
  const target = advance ? following(state) : state;
  if (!target) return state;
  const scene = chapters[target.chapter].pages[target.page];
  if (scene.choices && !scene.choices[choice]) return state;
  return { ...target, revealed: !scene.choices, choice: scene.choices ? choice : -1 };
}
