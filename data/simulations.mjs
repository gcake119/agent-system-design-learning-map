export function contextMetrics(items) {
  const selected = items.filter(i => i.on)
  const used = selected.reduce((n, i) => n + i.size, 0)
  return {
    used,
    relevant: used ? Math.round(selected.reduce((n, i) => n + i.size * i.relevance, 0) / used) : 0,
    stale: used ? Math.round(selected.filter(i => i.stale).reduce((n, i) => n + i.size, 0) / used * 100) : 0,
    remaining: Math.max(0, 100 - used), overflow: Math.max(0, used - 100),
  }
}
export function profile(t) {
  return { calls: 12 - (t.tools ? 2 : 0) - (t.rules ? 3 : 0),
    tools: 8 - (t.tools ? 4 : 0), tokens: 48 - (t.context ? 16 : 0),
    time: (14.2 - (t.context ? 1.5 : 0) - (t.tools ? 3.1 : 0) - (t.rules ? 2 : 0) - (t.routing ? 1 : 0)).toFixed(1),
    cost: (.41 - (t.context ? .09 : 0) - (t.tools ? .04 : 0) - (t.rules ? .10 : 0) - (t.routing ? .08 : 0)).toFixed(2) }
}
export function loopState() { return { phase: 'Observe', round: 1, actions: 0, status: 'READY', detail: '讀取需求與目前狀態' } }
export function loopNext(state, fail, maxRounds) {
  if (['DONE', 'HUMAN'].includes(state.status)) return state
  if (state.phase === 'Observe') return { ...state, phase: 'Reason / Plan', status: 'RUNNING', detail: '決定查詢案件狀態' }
  if (state.phase === 'Reason / Plan') return { ...state, phase: 'Act', status: 'RUNNING', detail: '準備呼叫唯讀工具 case.lookup' }
  if (!fail) return { ...state, phase: '完成', actions: state.actions + 1, status: 'DONE', detail: '收到案件狀態，回傳下一步建議' }
  if (state.round >= maxRounds) return { ...state, phase: '轉交人工', actions: state.actions + 1, status: 'HUMAN', detail: '工具持續逾時，已達迴圈上限，停止重試' }
  return { ...state, phase: 'Observe', round: state.round + 1, actions: state.actions + 1, status: 'RETRY', detail: '唯讀查詢逾時，觀察錯誤後進入下一輪' }
}
