export const topics = [
  { id: 'loop', title: 'Agent Loop', detail: '任務如何持續執行', slide: 3 },
  { id: 'context', title: 'Context', detail: '每一步要看什麼', slide: 6 },
  { id: 'reliability', title: 'Reliability', detail: '失敗時怎麼辦', slide: 9 },
  { id: 'observability', title: 'Observability', detail: '如何看見過程', slide: 12 },
  { id: 'evaluation', title: 'Evaluation', detail: '怎麼證明做對', slide: 14 },
  { id: 'optimization', title: 'Optimization', detail: '如何更快更省', slide: 17 },
  { id: 'multi', title: 'Multi-Agent', detail: '何時需要分工', slide: 19 },
]
export const foundations = topics.slice(0, 5).map(t => t.id)
