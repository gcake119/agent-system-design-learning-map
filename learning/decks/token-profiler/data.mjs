export const workflow = ['Plan', 'Search', 'Search', 'Implement', 'Test', 'Debug', 'Debug', 'Review'];
export const sources = [
  { id: 'history', label: '對話歷史', hint: '先前訊息在後續呼叫中再次送入。' },
  { id: 'code', label: '檢索程式碼', hint: '搜尋取得的檔案片段。' },
  { id: 'tools', label: '工具結果', hint: '測試與編輯工具回傳的內容。' },
  { id: 'task', label: '任務／規格', hint: '這次工作必須遵守的需求。' },
  { id: 'state', label: '目前狀態', hint: '已完成步驟與結構化進度。' },
  { id: 'other', label: '其他', hint: '系統設定等其餘輸入。' },
];
const rows = [
  ['Plan', 8000, 900, 2.1, [0, 2000, 0, 4000, 1000, 1000]],
  ['Search #1', 14000, 700, 2.8, [3000, 6000, 2000, 2000, 500, 500]],
  ['Search #2', 19000, 800, 3.0, [6000, 8000, 2500, 1500, 500, 500]],
  ['Implement', 25000, 1800, 4.7, [10000, 8000, 3500, 1500, 1000, 1000]],
  ['Debug #1', 27000, 1100, 4.9, [11000, 6000, 5500, 1500, 2000, 1000]],
  ['Debug #2', 37000, 1200, 5.8, [16000, 7000, 8500, 2500, 2000, 1000]],
  ['Review', 32000, 2900, 4.5, [12000, 6000, 6000, 3000, 3000, 2000]],
];
export const calls = rows.map(([step, input, output, latency, parts], index) => ({ id: index + 1, step, input, output, latency, parts }));
export const sourceTotals = sources.map((source, index) => ({ ...source, tokens: calls.reduce((sum, call) => sum + call.parts[index], 0) }));
export const totals = { input: calls.reduce((sum, call) => sum + call.input, 0), output: calls.reduce((sum, call) => sum + call.output, 0), calls: calls.length };
export const scenarios = {
  baseline: { label: '原始架構', input: 162000, output: 9400, latency: 31.2, pass: true, focus: 'history' },
  prompt: { label: '縮短 prompt', input: 158000, output: 9400, latency: 30.8, pass: true, focus: 'task' },
  retrieval: { label: '相關檢索', input: 133000, output: 9300, latency: 28.9, pass: true, focus: 'code' },
  state: { label: '持久狀態＋相關檢索', input: 96000, output: 9100, latency: 26.4, pass: true, focus: 'history' },
  summary: { label: '激進摘要', input: 78000, output: 8900, latency: 24.2, pass: false, focus: 'history' },
  tools: { label: '工具結果處理', input: 141000, output: 9300, latency: 29.1, pass: true, focus: 'tools' },
  validator: { label: '確定性驗證器', input: 151000, output: 9000, latency: 28.4, pass: true, focus: 'tools' },
  model: { label: '較小模型', input: 162000, output: 9400, latency: 27.8, pass: null, focus: 'model' },
};
export const transfer = [
  { id: 'llm', label: 'LLM', share: 18 },
  { id: 'warehouse', label: '資料倉儲查詢', share: 61 },
  { id: 'queue', label: '佇列等待', share: 4 },
  { id: 'processing', label: '資料處理', share: 14 },
  { id: 'other', label: '其他', share: 3 },
];
export const qualityChecks = ['核心行為', '必要檔案／相關產物', '權限邊界', '測試', '審查限制'];
