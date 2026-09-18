import { designBriefs } from './deep-content.mjs';
export const NOTEBOOK_KEY = 'agent-design-notebook-v1';
export function blankEntry() {
  return { approach: '', fields: ['', '', '', ''], rationale: '', tradeoff: '', revisit: '' };
}
export function parseNotebook(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || typeof data.entries !== 'object') return {};
    const result = {};
    for (const id of Object.keys(designBriefs)) {
      const entry = data.entries?.[id];
      if (!entry || typeof entry !== 'object') continue;
      result[id] = {
        ...Object.fromEntries(['approach','rationale','tradeoff','revisit'].map(k=>[k,typeof entry[k] === 'string' ? entry[k].slice(0,5000) : ''])),
        fields: Array.from({length:4},(_,i)=>typeof entry.fields?.[i] === 'string' ? entry.fields[i].slice(0,5000) : ''),
      };
    }
    return result;
  } catch { return {}; }
}
export function missingFields(entry = blankEntry()) {
  return ['approach', 'rationale', 'tradeoff', 'revisit'].filter(k=>!entry[k]?.trim()).length + entry.fields.filter(v=>!v.trim()).length;
}
export function exportNotebook(entries) {
  const lines = ['# 案件助手系統設計', '', '任務：查詢案件與收件紀錄、辨認缺件、處理逾時，並提供可驗證的結論。', '', '這是學習者的設計草稿，完整填寫不代表設計已通過驗證。', ''];
  for (const [id,brief] of Object.entries(designBriefs)) {
    const entry = entries[id] || blankEntry();
    lines.push(`## ${brief.title}`, '', `採用方案：${entry.approach || '待補充'}`, '');
    brief.fields.forEach((label,i)=>lines.push(`### ${label}`, entry.fields[i] || '待補充', ''));
    lines.push('### 選擇理由',entry.rationale || '待補充','','### 接受的代價',entry.tradeoff || '待補充','','### 重新評估條件',entry.revisit || '待補充','');
  }
  return lines.join('\n');
}
