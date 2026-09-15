---
theme: default
title: Agent System Design 互動式學習地圖
info: 從 Agent Loop 到可靠性、可觀測性與評估
transition: fade-out
mdc: true
drawings:
  persist: false
fonts:
  sans: Noto Sans TC
  mono: JetBrains Mono
---

<div class="cover">
  <p class="eyebrow">AGENT SYSTEM DESIGN</p>
  <h1>從一次回答<br>到一個會持續行動的系統</h1>
  <p class="lede">互動式學習地圖</p>
  <div class="cover-start">按方向鍵開始</div>
</div>

---
layout: default
---

<SlideHeader chapter="00" title="學習地圖" subtitle="先看懂依賴關係，再逐步拆開每個工程問題" />

<LearningMap active="loop" />

---
layout: default
---

<SlideHeader chapter="01" title="Agent Loop" subtitle="一次模型呼叫與持續執行任務的差別" />

<div class="compare-stage">
  <section>
    <h3>一般 LLM 呼叫</h3>
    <div class="linear-flow">
      <span>Request</span><i></i><span>Model</span><i></i><span>Response</span>
    </div>
    <p>模型回傳一次結果，流程就結束。</p>
  </section>
  <section class="active-panel">
    <h3>Agent</h3>
    <div class="mini-loop"><b>觀察</b><b>判斷</b><b>行動</b></div>
    <p>工具結果會回到模型，成為下一輪觀察。</p>
  </section>
</div>

---
layout: default
---

<SlideHeader chapter="01" title="Agent Loop 模擬器" subtitle="逐步執行，觀察每一輪如何改變任務狀態" />

<AgentLoopDemo />

---
layout: default
---

<SlideHeader chapter="01" title="迴圈需要明確的停止條件" subtitle="完成、失敗與人工介入都應該成為可辨識的終點" />

<div class="terminal-stage">
  <div class="terminal-path"><span>任務完成</span><strong>DONE</strong><small>成功條件已滿足</small></div>
  <div class="terminal-path"><span>超過限制</span><strong>STOP</strong><small>時間、成本或次數用完</small></div>
  <div class="terminal-path"><span>風險過高</span><strong>HUMAN</strong><small>需要權限或人工判斷</small></div>
</div>

---
layout: default
---

<SlideHeader chapter="02" title="Context Management" subtitle="每一輪模型應該看到哪些資訊" />

<div class="statement-stage">
  <p class="big-statement">Context 是模型在<span>這一刻</span><br>能用來判斷的全部資訊。</p>
  <div class="context-orbit">
    <b>目前需求</b><b>任務狀態</b><b>工具結果</b><b>檢索資料</b><b>歷史記憶</b>
  </div>
</div>

---
layout: default
---

<SlideHeader chapter="02" title="Context Window 模擬器" subtitle="選擇要送給模型的資料，觀察容量、相關性與新鮮度" />

<ContextWindow />

---
layout: default
---

<SlideHeader chapter="02" title="Context、State 與 Memory" subtitle="同一筆資訊應該放在哪裡，取決於它要支援哪個時間尺度" />

<div class="memory-stage">
  <div><small>這一刻需要</small><h3>Current context</h3><p>使用者現在要修改地址</p></div>
  <div><small>這項工作需要</small><h3>Task state</h3><p>Case #1024 已完成身分驗證</p></div>
  <div><small>未來任務也可能需要</small><h3>Long-term memory</h3><p>使用者偏好繁體中文</p></div>
</div>

---
layout: default
---

<SlideHeader chapter="03" title="Reliability / Guardrails" subtitle="把模型、工具與外部服務都視為可能失敗的元件" />

<div class="fault-spectrum">
  <div><b>01</b><span>工具逾時</span></div>
  <div><b>02</b><span>回傳格式錯誤</span></div>
  <div><b>03</b><span>重複執行</span></div>
  <div><b>04</b><span>權限不足</span></div>
  <div><b>05</b><span>結果模糊</span></div>
</div>
<p class="center-note">可靠性設計決定系統遇到失敗時，下一步會發生什麼。</p>

---
layout: default
---

<SlideHeader chapter="03" title="工具逾時後，可以直接重試嗎？" subtitle="先確認操作是否已經成功，再決定重試、補償或交給人工處理" />

<FailureLab />

---
layout: default
---

<SlideHeader chapter="03" title="Idempotency" subtitle="同一個操作重複送出，也只產生一次效果" />

<div class="idempotency-stage">
  <div class="request-stack"><span>request #1</span><span>request #1 retry</span><span>request #1 retry</span></div>
  <div class="key-gate"><small>Idempotency key</small><strong>order-7F2A</strong></div>
  <div class="single-result"><small>唯一結果</small><strong>Order #8472</strong><span>CREATED</span></div>
</div>

---
layout: default
---

<SlideHeader chapter="04" title="Observability" subtitle="保留整條執行軌跡，才能知道 Agent 在哪一步偏離" />

<div class="trace-principle">
  <div class="trace-line"><span>Input</span><span>Context</span><span>Model</span><span>Tool</span><span>Model</span><span>Output</span></div>
  <p>一次 run 應該能回答：模型看見什麼、做了什麼決定、工具回傳什麼。</p>
</div>

---
layout: default
---

<SlideHeader chapter="04" title="Agent Trace Viewer" subtitle="點開每個步驟，找出延遲、錯誤與不必要的行動" />

<TraceViewer />

---
layout: default
---

<SlideHeader chapter="05" title="Evaluation / Verification" subtitle="先定義任務層級的成功標準，再選擇驗證方法" />

<div class="eval-split">
  <section><small>程式可以明確判定</small><h3>Deterministic validator</h3><p>Schema、必填欄位、業務規則與資料庫限制。</p></section>
  <div class="eval-question">能否用明確規則<br>判斷對錯？</div>
  <section><small>需要理解語意品質</small><h3>Model judge / Human</h3><p>忠實度、完整性與語境是否恰當。</p></section>
</div>

---
layout: default
---

<SlideHeader chapter="05" title="你會怎麼驗？" subtitle="把可確定的部分交給程式，把語意判斷留給模型或人" />

<EvalQuiz />

---
layout: default
---

<SlideHeader chapter="05" title="結果正確，路徑也可能有問題" subtitle="Agent 評估需要同時檢查最終輸出與工具使用軌跡" />

<div class="trajectory-stage">
  <div class="trajectory good"><h3>Agent A</h3><p>正確資料源</p><p>正確工具</p><p>驗證結果</p><strong>輸出 ✓　軌跡 ✓</strong></div>
  <div class="trajectory bad"><h3>Agent B</h3><p>錯誤資料源</p><p>多餘重試</p><p>未驗證就猜測</p><strong>輸出 ✓　軌跡 ×</strong></div>
</div>

---
layout: default
---

<SlideHeader chapter="06" title="Cost / Latency Optimization" subtitle="先量到時間與成本，才知道該改哪一段" />

<div class="metric-line">
  <div><strong>12</strong><span>model calls</span></div>
  <div><strong>48k</strong><span>input tokens</span></div>
  <div><strong>14.2s</strong><span>latency</span></div>
  <div><strong>$0.41</strong><span>cost</span></div>
</div>
<p class="center-note">常見調整點：移除無關 context、合併工具查詢、規則取代模型、選擇合適模型。</p>

---
layout: default
---

<SlideHeader chapter="06" title="Agent Profiler" subtitle="逐項套用策略，觀察成本與延遲如何改變" />

<CostProfiler />

---
layout: default
---

<SlideHeader chapter="07" title="Multi-Agent" subtitle="多個 Agent 會增加協調、共享狀態與連鎖失敗的問題" />

<div class="multi-stage">
  <div class="agent-node"><strong>Planner</strong><small>state A</small></div>
  <div class="shared-state"><span>Shared state</span><b>誰能讀？誰能寫？</b></div>
  <div class="agent-node"><strong>Worker</strong><small>state B</small></div>
  <div class="agent-node"><strong>Reviewer</strong><small>state C</small></div>
</div>
<p class="center-note">先讓一個 Agent 可靠、可觀察、可評估，再決定是否需要拆成多個 Agent。</p>

---
layout: default
---

<SlideHeader chapter="08" title="完整系統地圖" subtitle="每一層都在回答一個不同的工程問題" />

<LearningMap active="all" />

---
layout: center
class: closing-slide
---

<div class="closing">
  <p class="eyebrow">WHAT'S NEXT</p>
  <h1>從最小 Agent Loop 開始</h1>
  <p>每加入一項能力，就補上對應的可靠性、觀測與驗證。</p>
  <div class="closing-path"><span>Loop</span><span>Context</span><span>Reliability</span><span>Trace</span><span>Eval</span></div>
</div>
