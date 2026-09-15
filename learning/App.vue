<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { topics } from "../data/topics.mjs";
import { defaults, begin, advance, reflection, qualifies } from "./engine.mjs";
const route = ref(location.hash.startsWith("#/loop") ? "loop" : "map");
const config = ref({ ...defaults }),
  run = ref(null),
  answer = ref(""),
  saved = ref(false),
  storageWarning = ref(false);
const history = ref([]),
  completed = ref(false),
  selected = ref("loop"),
  title = ref(null);
const base = import.meta.env.BASE_URL;
const statuses = {
  running: "執行中",
  done: "完成任務",
  human: "轉交人工",
  stopped: "任務未解決",
};
const stageNames = {
  observe: "觀察",
  plan: "選擇行動",
  act: "執行工具",
  verify: "驗證結果",
  end: "結束",
};
const active = computed(() => run.value?.status === "running");
const ended = computed(() => run.value && !active.value);
const currentTopic = computed(() =>
  topics.find((t) => t.id === selected.value),
);
const notes = {
  loop: ["看懂狀態如何驅動下一步", "讓失敗有重試上限與人工出口"],
  context: [
    "選擇、檢索、壓縮與更新資料",
    "區分目前 context、任務狀態與長期記憶",
  ],
  reliability: ["設計逾時、重試與冪等性", "遇到模糊結果與權限限制時安全停止"],
  observability: ["串起模型、工具與資料的執行軌跡", "從紀錄找出錯誤與延遲"],
  evaluation: ["驗證結果，也檢查過程", "區分程式驗證、模型評審與人工判斷"],
  optimization: ["量測後再調整成本與延遲", "改善效率時維持品質"],
  multi: ["判斷何時需要多 Agent", "理解共享狀態、協調與連鎖失敗"],
};
const prompts = {
  observe: "先讀取任務與目前已知狀態。",
  plan: "依你選的資料來源決定下一個行動。",
  act: "執行選定行動，觀察工具實際回傳。",
  verify: "檢查新鮮度、結果與剩餘額度，決定完成或再跑一輪。",
};
function persist() {
  try {
    localStorage.setItem(
      "agent-learning-lab-v1",
      JSON.stringify({ completed: completed.value, history: history.value }),
    );
  } catch {
    storageWarning.value = true;
  }
}
function load() {
  try {
    const data = JSON.parse(
      localStorage.getItem("agent-learning-lab-v1") || "{}",
    );
    completed.value = data.completed === true;
    if (Array.isArray(data.history))
      history.value = data.history
        .filter(
          (h) =>
            h &&
            typeof h.label === "string" &&
            Number.isFinite(h.calls) &&
            statuses[h.status],
        )
        .slice(-5);
  } catch {
    storageWarning.value = true;
  }
}
async function changeRoute() {
  route.value = location.hash.startsWith("#/loop") ? "loop" : "map";
  await nextTick();
  title.value?.focus();
}
function start() {
  run.value = begin({ ...config.value });
  answer.value = "";
  saved.value = false;
}
function step() {
  run.value = advance(run.value);
}
function choose(value) {
  answer.value = value;
}
function save() {
  if (!ended.value || saved.value) return;
  const passed = qualifies(run.value, answer.value);
  if (!passed) return;
  completed.value = true;
  saved.value = true;
  const labels = {
    smooth: "正常回應",
    transient: "首次逾時",
    offline: "持續逾時",
  };
  history.value = [
    ...history.value,
    {
      label:
        labels[run.value.config.scenario] +
        (run.value.config.source === "cache" ? " · 昨日快取" : ""),
      calls: run.value.calls,
      status: run.value.status,
    },
  ].slice(-5);
  persist();
}
onMounted(() => {
  load();
  window.addEventListener("hashchange", changeRoute);
});
onUnmounted(() => window.removeEventListener("hashchange", changeRoute));
</script>

<template>
  <header class="site-header">
    <a class="brand" href="#/map"
      ><span class="brand-mark">a<span>·</span></span
      ><span>AGENT SYSTEM DESIGN<small>互動學習實驗室</small></span></a
    >
    <nav aria-label="模式切換">
      <a href="#/map" :aria-current="route === 'map' ? 'page' : undefined"
        >探索地圖</a
      ><a :href="base + 'slides/'"
        >簡報模式 <span aria-hidden="true">↗</span></a
      >
    </nav>
  </header>
  <main>
    <p v-if="storageWarning" class="storage-warning" role="status">
      目前無法保存到瀏覽器；本次操作仍可繼續，重新整理後紀錄可能消失。
    </p>
    <template v-if="route === 'map'">
      <section class="map-intro">
        <div>
          <p class="eyebrow">LEARN BY CHANGING THE SYSTEM</p>
          <h1 ref="title" tabindex="-1">
            讓系統跑一次，<br />看懂每個設計決定。
          </h1>
          <p class="intro-copy">
            從地圖選一個問題。調整條件、觀察執行，再用結果理解 Agent 如何工作。
          </p>
        </div>
        <aside class="progress-summary">
          <span>本輪體驗範圍</span
          ><strong>{{ completed ? "01" : "00" }} <small>/ 01</small></strong>
          <p>
            {{ completed ? "Agent Loop 情境已通過" : "先完成 Agent Loop 情境" }}
          </p>
          <small
            >完成需達到安全終點並答對理解題；<br />不以瀏覽頁數計算。</small
          >
        </aside>
      </section>
      <section class="explore-layout" aria-label="學習主題地圖">
        <div class="map-canvas">
          <div class="map-label">
            <span>01 — 核心能力與延伸</span><span>點選節點查看</span>
          </div>
          <button
            class="core-node"
            :class="{ selected: selected === 'loop' }"
            @click="selected = 'loop'"
            :aria-pressed="selected === 'loop'"
          >
            <span class="node-symbol">↻</span
            ><span
              ><small
                >從這裡開始 · {{ completed ? "情境已通過" : "可互動" }}</small
              ><strong>Agent Loop</strong
              ><span>觀察 → 行動 → 驗證 → 再觀察</span></span
            ><span aria-hidden="true">↗</span>
          </button>
          <div class="connector-label">支撐每一輪執行的設計能力</div>
          <div class="topic-grid">
            <button
              v-for="(topic, i) in topics.slice(1, 6)"
              :key="topic.id"
              class="topic-node"
              :class="[topic.id, { selected: selected === topic.id }]"
              @click="selected = topic.id"
              :aria-pressed="selected === topic.id"
            >
              <span class="node-number">0{{ i + 2 }}</span
              ><strong>{{ topic.title }}</strong
              ><span>{{ topic.detail }}</span
              ><small>章節簡報</small>
            </button>
          </div>
          <div class="advanced-node">
            <span>07 · 進階延伸</span
            ><button
              @click="selected = 'multi'"
              :aria-pressed="selected === 'multi'"
            >
              Multi-Agent <span aria-hidden="true">↗</span></button
            ><small>建立單一 Agent 的基礎後，再考慮分工。</small>
          </div>
        </div>
        <aside class="topic-detail" aria-live="polite">
          <p class="eyebrow">
            {{
              selected === "loop" ? "INTERACTIVE CHAPTER" : "CHAPTER PREVIEW"
            }}
          </p>
          <h2>{{ currentTopic.title }}</h2>
          <p>{{ currentTopic.detail }}</p>
          <h3>這一章會學到</h3>
          <ul>
            <li v-for="note in notes[selected]" :key="note">{{ note }}</li>
          </ul>
          <template v-if="selected === 'loop'"
            ><div class="scenario-preview">
              <small>情境 01 · 約 3–5 分鐘</small
              ><strong>案件查詢遇到逾時</strong>
              <p>任務還沒完成，該再查一次，還是停下來？</p>
            </div>
            <a class="primary full" href="#/loop"
              >{{ run ? "繼續情境" : "進入情境" }} <span>→</span></a
            >
            <p class="fine">純前端教學模擬，不連接真實案件或模型。</p></template
          ><template v-else
            ><p class="preview-note">
              本輪先驗證 Agent Loop
              的完整互動體驗。這一章暫時提供簡報，互動情境尚未製作。
            </p>
            <a
              class="secondary full"
              :href="base + 'slides/' + currentTopic.slide"
              >開啟章節簡報 ↗</a
            ></template
          >
        </aside>
      </section>
      <section class="saved-section">
        <h2>你的實驗紀錄</h2>
        <p v-if="!history.length">
          完成情境與理解題後，在這裡留下結果。紀錄只保存在此瀏覽器。
        </p>
        <ul v-else class="history">
          <li v-for="(item, i) in history" :key="i">
            <span>{{ item.label }}</span
            ><span>{{ item.calls }} 次工具呼叫</span
            ><strong>{{ statuses[item.status] }}</strong>
          </li>
        </ul>
      </section>
    </template>
    <template v-else>
      <div class="breadcrumb">
        <a href="#/map">← 回到探索地圖</a><span>01 / AGENT LOOP</span
        ><span>教學模擬</span>
      </div>
      <section class="lab-heading">
        <p class="eyebrow">EXPERIMENT 01</p>
        <h1 ref="title" tabindex="-1">工具逾時了，Agent 該怎麼做？</h1>
        <p>改變一個條件，讓系統跑一次。看看它何時繼續、何時完成、何時該停。</p>
      </section>
      <div class="mission">
        <span>你的任務</span>
        <p>
          確認案件 <strong>#1024</strong> 的附件是否齊全，回覆能否進入人工審核。
        </p>
        <small>權限：唯讀查詢 · 不修改案件</small>
      </div>
      <div class="lab-layout">
        <aside class="setup-panel">
          <h2><span>01</span> 設計這次執行</h2>
          <fieldset :disabled="active">
            <legend class="sr-only">實驗條件</legend>
            <label
              >工具情境<select v-model="config.scenario">
                <option value="smooth">正常回應</option>
                <option value="transient">第一次逾時，第二次成功</option>
                <option value="offline">持續逾時</option>
              </select></label
            ><label
              >資料來源<select v-model="config.source">
                <option value="live">即時查詢 · 最新資料</option>
                <option value="cache">昨日快取 · 不呼叫工具</option>
              </select></label
            ><label
              >工具呼叫上限 <strong>{{ config.limit }} 次</strong
              ><input
                type="range"
                min="1"
                max="4"
                step="1"
                v-model.number="config.limit" /></label
            ><label class="check"
              ><input
                type="checkbox"
                v-model="config.retry"
              />允許唯讀查詢重試</label
            ><label class="check"
              ><input
                type="checkbox"
                v-model="config.escalate"
              />無法確認時轉交人工</label
            >
          </fieldset>
          <p class="fine">
            {{
              active
                ? "本次設定已鎖定。結束後可以改條件重跑。"
                : "設定會影響工具回應、呼叫次數與最終結果。"
            }}
          </p>
          <button v-if="!active" class="primary full" @click="start">
            {{ run ? "套用設定，重跑實驗" : "開始實驗" }} →
          </button>
          <template v-else>
            <p class="running-tag">● 逐步執行中</p>
            <button class="secondary full" @click="run=null; answer=''; saved=false">停止並重設</button>
          </template>
          <p class="fine">未保存的執行在重新整理後會重設。</p>
          <p v-if="ended" class="fine">
            重跑會清除本輪軌跡；已保存紀錄不受影響。
          </p>
        </aside>
        <section class="execution-panel">
          <div class="panel-heading">
            <h2><span>02</span> 觀察系統如何回應</h2>
            <span class="status-pill" :class="run?.status">{{
              run ? statuses[run.status] : "尚未開始"
            }}</span>
          </div>
          <div class="stage-track">
            <div
              v-for="(name, id) in {
                observe: '觀察',
                plan: '選擇行動',
                act: '執行工具',
                verify: '驗證結果',
              }"
              :key="id"
              :class="{ current: run?.phase === id }"
            >
              <span>{{ name }}</span
              ><small>{{ id }}</small>
            </div>
          </div>
          <div class="system-state">
            <div>
              <small>迴圈輪次</small><strong>{{ run?.round || "—" }}</strong>
            </div>
            <div>
              <small>工具呼叫</small
              ><strong
                >{{ run?.calls || 0
                }}<small>
                  / {{ run?.config.limit || config.limit }}</small
                ></strong
              >
            </div>
            <div>
              <small>目前案件資料</small
              ><strong class="data-state">{{
                run?.data?.attachments || "尚未取得"
              }}</strong
              ><small v-if="run?.data">{{
                run.data.fresh ? "✓ 最新資料" : "! 昨日快取・尚未驗證"
              }}</small>
            </div>
          </div>
          <div class="next-action" aria-live="polite">
            <template v-if="active"
              ><p>
                <strong>{{ stageNames[run.phase] }}</strong
                >{{ prompts[run.phase] }}
              </p>
              <button class="primary" @click="step">
                執行：{{ stageNames[run.phase] }} →
              </button></template
            >
            <p v-else-if="!run">
              ← 設定條件並開始，這裡會顯示即時狀態與執行路徑。
            </p>
            <p v-else>
              <strong>{{ statuses[run.status] }}</strong
              >{{ run.reason }}
            </p>
          </div>
          <div class="trace-heading">
            <h3>執行軌跡</h3>
            <span>可觀察的系統事件，非模型內部思考</span>
          </div>
          <ol class="event-log" aria-label="執行軌跡">
            <li v-for="(event, i) in run?.events || []" :key="i">
              <span>{{ String(i + 1).padStart(2, "0") }}</span
              ><strong>{{ stageNames[event.stage] }}</strong>
              <p>{{ event.text }}</p>
            </li>
            <li v-if="!run?.events.length" class="empty-log">
              等待第一個事件…
            </li>
          </ol>
        </section>
      </div>
      <section
        v-if="ended"
        class="result-panel"
        aria-labelledby="result-heading"
      >
        <div>
          <p class="eyebrow">03 / REFLECT & COMPARE</p>
          <h2 id="result-heading">這次執行教會我們什麼？</h2>
          <p>{{ run.reason }}</p>
          <p v-if="run.status === 'stopped'" class="warning">
            這次沒有安全交接未解決的任務。開啟「轉交人工」再試，或調整條件取得最新結果。
          </p>
          <p class="fine">
            重跑建議：{{
              run.data && !run.data.fresh
                ? "改用即時查詢，比較結果的新鮮度。"
                : run.status === "done"
                  ? "改為持續逾時，看看人工出口是否生效。"
                  : "把工具情境改成第一次逾時，看看有限重試能否完成任務。"
            }}
          </p>
        </div>
        <div>
          <h3>哪個原則最能解釋這次結果？</h3>
          <div class="answer-options">
            <button
              v-for="option in [
                { id: 'verified', label: '驗證最新結果後，依任務條件結束' },
                { id: 'bounded', label: '有限重試，無法確認就停止或交接' },
                { id: 'freshness', label: '舊資料不能代表目前狀態' },
              ]"
              :key="option.id"
              :aria-pressed="answer === option.id"
              @click="choose(option.id)"
            >
              {{ option.label }}
            </button>
          </div>
          <div v-if="answer" role="status" class="answer-feedback">
            <strong>{{
              answer === reflection(run).answer
                ? "判斷正確"
                : "再看一次執行軌跡"
            }}</strong>
            <p>{{ reflection(run).text }}</p>
          </div>
          <button
            v-if="qualifies(run, answer) && !saved"
            class="primary"
            @click="save"
          >
            保存這次學習成果
          </button>
          <p v-if="saved" class="saved-note" role="status">
            ✓ 已保存。地圖已標記「情境已通過」。
          </p>
          <a class="return-link" href="#/map">回到地圖，查看紀錄 →</a>
        </div>
      </section>
    </template>
  </main>
  <footer class="site-footer">
    <span>Agent System Design · Learning Lab</span
    ><span>先操作，再理解。所有資料皆為教學假設。</span>
  </footer>
</template>
