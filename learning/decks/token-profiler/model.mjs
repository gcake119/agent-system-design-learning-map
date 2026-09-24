import { calls, scenarios, workflow } from './data.mjs';
export const stageCount = 10;
export function initialDeckState() { return { stage: 0, runStep: -1, selectedCall: 5, selectedSource: null, groupedBy: 'call', scenario: 'baseline', rerun: false, verified: false, transferChoice: null, contextTouched: false, history: [] }; }
export function visibleCalls(state) { return state.runStep < 0 ? 0 : workflow.slice(0, state.runStep + 1).filter(step => step !== 'Test').length; }
export function transition(state, action, value) {
  if (action === 'restart') return initialDeckState();
  const old = { ...state, history: undefined };
  const next = { ...state, history: [...state.history, old] };
  if (action === 'back') {
    if (state.history.length) return { ...state.history.at(-1), history: state.history.slice(0, -1) };
    return state;
  }
  if (action === 'next') next.stage = Math.min(stageCount - 1, state.stage + 1);
  if (action === 'runStep') next.runStep = Math.min(workflow.length - 1, state.runStep + 1);
  if (action === 'call') next.selectedCall = Math.max(0, Math.min(calls.length - 1, value));
  if (action === 'source') { next.selectedSource = value; next.contextTouched = true; }
  if (action === 'group') next.groupedBy = value;
  if (action === 'scenario') { next.scenario = value; next.rerun = false; next.verified = false; }
  if (action === 'rerun') { next.rerun = true; next.verified = false; }
  if (action === 'verify') next.verified = true;
  if (action === 'transfer') next.transferChoice = value;
  return next;
}
export function activeScenario(state) { return scenarios[state.scenario]; }
export function essentialInformation(state) {
  return { stage: state.stage, runStep: state.runStep, calls: visibleCalls(state), scenario: state.scenario, rerun: state.rerun, verified: state.verified, transferChoice: state.transferChoice };
}
