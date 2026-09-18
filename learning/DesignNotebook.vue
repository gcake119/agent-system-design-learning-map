<script setup>
import { ref, computed, watch } from 'vue';
import { designBriefs } from './deep-content.mjs';
import { NOTEBOOK_KEY, blankEntry, parseNotebook, missingFields, exportNotebook } from './notebook.mjs';
const props = defineProps({ unit: String, approach: String });
const entries = ref({}), status = ref(''), storageFailed = ref(false);
try { entries.value = parseNotebook(localStorage.getItem(NOTEBOOK_KEY)); }
catch { storageFailed.value = true; }
const ids = computed(()=>props.unit ? [props.unit] : Object.keys(designBriefs));
function ensure(id) { if (!entries.value[id]) entries.value[id] = blankEntry(); }
watch(ids, ids=>ids.forEach(ensure), {immediate:true});
watch(()=>props.approach, value=>{
  if (props.unit && value) { ensure(props.unit); entries.value[props.unit].approach = value; status.value = '方案已帶入，編輯後請保存。'; }
}, {immediate:true});
function save() {
  try {
    // Merge only visible units so editing a chapter does not erase other notes.
    const stored = parseNotebook(localStorage.getItem(NOTEBOOK_KEY));
    for (const id of ids.value) stored[id] = entries.value[id];
    localStorage.setItem(NOTEBOOK_KEY, JSON.stringify({version:1,entries:stored}));
    storageFailed.value = false;
    status.value = '已保存到此瀏覽器。';
  } catch { storageFailed.value = true; status.value = '無法保存；目前內容仍可下載。'; }
}
function download() {
  let all = {};
  try { all = parseNotebook(localStorage.getItem(NOTEBOOK_KEY)); } catch {}
  for (const id of ids.value) all[id] = entries.value[id];
  const url = URL.createObjectURL(new Blob([exportNotebook(all)], {type:'text/markdown;charset=utf-8'}));
  const a = document.createElement('a'); a.href=url; a.download='agent-system-design.md';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.value = '已發出下載請求，包含尚未保存的編輯；請查看瀏覽器下載項目。';
}
</script>
<template>
  <section class="notebook" aria-label="我的系統設計">
    <template v-if="!unit">
      <h1>把七個單元組成你的案件助手</h1>
      <p>任務：查詢案件與收件紀錄、辨認缺件、處理逾時，並提供可驗證的結論。以下彙整你保存的設計，也可直接修改。</p>
      <details class="evidence-panel"><summary>整合檢查：各部分是否一致？</summary>
        <ul><li>任務契約的「完成」條件，是否真的出現在驗收方案？</li><li>資料刷新規則，是否能支持行動前需要的時效？</li><li>每個暫停或失敗狀態，是否都有負責人與恢復條件？</li><li>優化與分工是否仍符合原先的權限、品質與總預算？</li></ul>
      </details>
    </template>
    <p class="quiet">保存在此瀏覽器，不會送到伺服器。切換主題前請保存；回到上一步不會刪除已保存的筆記。</p>
    <section v-for="id in ids" :key="id" class="design-entry" :aria-label="designBriefs[id].title">
      <h2>{{ designBriefs[id].title }}</h2>
      <p>{{ designBriefs[id].prompt }}</p>
      <p class="quiet">{{ missingFields(entries[id]) ? `還有 ${missingFields(entries[id])} 個欄位可補充` : '欄位已填寫，請用整合檢查核對設計。' }}</p>
      <label>採用方案<input v-model="entries[id].approach" maxlength="5000" @input="status = '有尚未保存的修改。'" /></label>
      <label v-for="(field,i) in designBriefs[id].fields" :key="field">{{ field }}<textarea v-model="entries[id].fields[i]" rows="2" maxlength="5000" @input="status = '有尚未保存的修改。'"></textarea></label>
      <div class="design-reasons">
        <label>選擇理由<textarea v-model="entries[id].rationale" rows="3" maxlength="5000" @input="status = '有尚未保存的修改。'"></textarea></label>
        <label>接受的代價<textarea v-model="entries[id].tradeoff" rows="3" maxlength="5000" @input="status = '有尚未保存的修改。'"></textarea></label>
        <label>重新評估條件<textarea v-model="entries[id].revisit" rows="3" maxlength="5000" @input="status = '有尚未保存的修改。'"></textarea></label>
      </div>
      <details><summary>查看一份設計示例</summary><p>{{ designBriefs[id].example }}</p><p class="quiet">示例用來比較思路，請依自己的假設補充，不會自動填入。</p></details>
    </section>
    <div class="action-row"><button class="primary" @click="save">保存設計筆記</button><button class="primary" @click="download">下載整份設計 Markdown</button><a v-if="unit" class="text-link" href="#/design">檢視完整系統設計 →</a></div>
    <p v-if="status" role="status">{{ status }}</p>
    <p v-if="storageFailed" class="quiet">瀏覽器儲存不可用；離開前請下載，避免遺失。</p>
  </section>
</template>
