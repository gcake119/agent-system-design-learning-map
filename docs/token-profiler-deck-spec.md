# Interactive Deck Prototype — Agent 到底把 token 花在哪裡？

> Status: implementation spec
> Branch: `prototype/token-profiler-deck`
> Scope: first reference implementation for the future `learning-map` skill.
> All token, latency, cost, workload, and quality figures in this prototype are synthetic teaching data, not provider benchmarks or prices.

## 1. Purpose

This is an **Agent-enabled System Design** lesson, not a prompt-optimization tutorial.

The learner should finish able to:

1. explain how token usage is measured per model call and aggregated per agent run;
2. distinguish the most expensive model call from the largest cumulative context source;
3. identify whether excess cost originates in prompt, context composition, state, retrieval, tool output, deterministic work, or workflow structure;
4. propose an architecture change based on profiler evidence;
5. re-run the same workload and verify that lower token use did not reduce required quality.

Core method:

```text
MEASURE → ATTRIBUTE → DIAGNOSE → REDESIGN → RE-RUN → VERIFY
```

## 2. Interaction principles

- One visible problem at a time.
- The diagram or simulator carries the explanation; prose is secondary.
- Do not reveal terminology before the learner has observed the behavior it names.
- Actions must visibly change workflow state, architecture, measurements, or verification results.
- Do not implement a quiz/score/unlock system.
- Preserve a presentation-like rhythm: large focal visualization, short labels, progressive disclosure, clear next action.
- The learner may move backward and forward without losing the conceptual thread.
- The design may be visually inspired by the supplied interactive-presentation recording, but must not copy its branding or pixel-level design.
- Reduced-motion mode must retain the same information in a static form.

## 3. Shared simulated run

Task: `新增取消預約功能`.

Runtime capabilities:

- Model
- Repository
- Search
- Editor
- Test Runner

Workflow:

```text
Plan → Search → Search → Implement → Test → Debug → Debug → Review
```

Test initially fails before Debug. The run then completes.

Canonical input-token dataset:

| Call | Step | Input | Output | Latency |
|---|---|---:|---:|---:|
| 1 | Plan | 8,000 | 900 | 2.1s |
| 2 | Search | 14,000 | 700 | 2.8s |
| 3 | Search | 19,000 | 800 | 3.0s |
| 4 | Implement | 25,000 | 1,800 | 4.7s |
| 5 | Debug | 27,000 | 1,100 | 4.9s |
| 6 | Debug | 37,000 | 1,200 | 5.8s |
| 7 | Review | 32,000 | 2,900 | 4.5s |

Totals: input 162,000; output 9,400. Model calls: 7.

Canonical input attribution totals:

| Source | Tokens |
|---|---:|
| Conversation history | 58,000 |
| Retrieved code | 43,000 |
| Tool results | 28,000 |
| Task / specification | 16,000 |
| Structured/current state | 10,000 |
| Other | 7,000 |

Total: 162,000.

The exact per-call attribution may be chosen during implementation but MUST sum to both the per-call input total and the source totals above.

## 4. Stages

### Stage 1 — Run the agent

Question: **一個 Coding Agent 完成這項任務，要呼叫模型幾次？**

Initial state shows the task, workflow steps, and runtime capabilities. No token numbers yet.

Primary action: **執行任務**

Behavior:

1. progress through Plan → Search → Search → Implement → Test;
2. Test reports `2 tests failed`;
3. continue Debug → Debug → Review → Done;
4. model-call counter increments only when a model call occurs.

End state: `Run #184 completed`, 7 model calls.

Learning observation: an agent task is a workflow containing multiple model calls, not one model request.

### Stage 2 — Reveal total usage

Show:

- Model calls: 7
- Input tokens: 162k
- Output tokens: 9.4k

Question: **162k 是怎麼來的？**

Action: **查看每次模型呼叫**

Do not explain attribution yet.

### Stage 3 — Profile by call

Render each model call as a selectable bar aligned to workflow order.

Selecting Debug #2 shows:

- Input: 37,000
- Output: 1,200
- Latency: 5.8s
- Model: use a neutral synthetic label such as `model-x`

Question: **所以 Debug 就是最值得優化的地方嗎？**

Action: **看看 input 裡裝了什麼**

Purpose: create the distinction between a large individual call and workflow-level cumulative cost.

### Stage 4 — Decompose one context

Animate/selectively reveal Debug #2 input as stacked context sources:

- conversation history
- retrieved code
- tool results
- task specification
- current/structured state
- other

Selecting a segment explains what that source represents in this run.

Only after interaction, introduce the label **Context composition**.

### Stage 5 — Re-aggregate by source

Control:

`By model call | By context source`

Switching to source view visually re-groups the same token mass into the canonical attribution totals.

Primary reveal:

- largest individual call: Debug #2;
- largest cumulative workflow source: Conversation history (58k).

Selecting Conversation history shows its repeated presence across later calls. The visualization should make repeated re-sending physically obvious.

Key statement after observation:

> 最大的一次 call，不一定是整條 workflow 最大的成本來源。

### Stage 6 — How measurement works

Show two layers.

**Provider/model-call usage layer**

```text
run_id
step_id
model
input_tokens
output_tokens
latency
```

Explain narrowly: the model/provider usage record gives call-level usage. Do not imply every provider exposes identical fields.

**Application instrumentation layer**

Context Builder assembles labeled parts:

```text
system
task/spec
history
retrieved code
tool results
state
other
```

The application records attribution metadata when composing the request. This is what makes source-level profiling possible.

Key distinction:

> Call-level usage tells us how much was used. Application instrumentation tells us where that usage came from in the workflow.

### Stage 7 — Architecture redesign lab

Before:

```text
Task
 ↓
Agent
 ↓
Full history + retrieved files + raw tool results + state
 ↓
Model
```

Offer interventions:

- Shorter prompt
- Summary
- Relevant retrieval
- Persistent structured state
- Tool-result processing
- Deterministic validator
- Smaller model

The UI must not mark one universally correct.

Each intervention highlights which architecture/context source it changes.

At minimum implement these scenarios:

**Shorter prompt**
- reduces Task/spec modestly;
- leaves repeated history problem mostly intact.

**Relevant retrieval**
- reduces retrieved-code volume.

**Persistent structured state + relevant retrieval**
- changes architecture to:

```text
Artifacts / history → persistent state
Repository → retrieval
                  ↘
Current task → Context Builder → Model
```

This is the primary redesign used for the before/after comparison.

**Aggressive summary**
- produces the lowest token count but intentionally loses a required constraint for the verification stage.

### Stage 8 — Re-run the same workload

Primary action: **Run same task**

Never compare different tasks.

Primary redesign synthetic results:

| Metric | Before | State + Retrieval |
|---|---:|---:|
| Input tokens | 162k | 96k |
| Output tokens | 9.4k | 9.1k |
| Latency | 31.2s | 26.4s |

Do not show a success verdict yet.

Question:

> **這代表設計變好了嗎？**

### Stage 9 — Verify quality

Run the same verification baseline:

- core behavior
- required files / relevant artifacts
- permission boundary
- tests
- review constraints

`State + Retrieval` preserves the required baseline.

`Aggressive summary` reduces tokens further but drops this synthetic requirement:

> 取消預約必須保留原付款紀錄。

Show the quality regression explicitly.

Conclusion:

> Token optimization must be evaluated against the same quality baseline.

### Stage 10 — Transfer to another system

Case: **Data Analysis Agent**

Question: an analysis run is expensive and slow. Where should the system be redesigned?

Profiler:

| Source | Share |
|---|---:|
| LLM | 18% |
| Warehouse query | 61% |
| Queue wait | 4% |
| Data processing | 14% |
| Other | 3% |

Options may include:

- shrink context
- cheaper/smaller model
- optimize query
- cache
- pre-aggregation

The important interaction is that the profiler evidence points away from token optimization as the first intervention.

Final method:

```text
MEASURE → ATTRIBUTE → DIAGNOSE → REDESIGN → RE-RUN → VERIFY
```

Closing statement:

> 先知道成本花在哪裡，再決定要改 prompt、context、workflow，還是 architecture。

## 5. Visual direction

Use the supplied recording as an interaction reference:

- presentation-first composition rather than dashboard-first composition;
- dark or low-distraction canvas is acceptable for this prototype;
- one restrained accent for active controls and current flow;
- large whitespace and one dominant visualization;
- technical labels may use monospace;
- fixed/simple presentation navigation and progress;
- diagrams animate state changes rather than serving as decoration;
- avoid dense card grids and long article-like panels.

Do not copy Casper branding, exact typography, exact colors, or proprietary visual assets.

## 6. Implementation boundaries

Prototype only this deck. Do not rewrite the other learning units yet.

Prefer reusing the existing Vue/Vite project where practical, but this prototype may introduce a new route/data/component set if that avoids coupling to the old 79-scenario learning-map UI.

Suggested route:

`#/deck/token-profiler`

Suggested separation:

```text
learning/decks/token-profiler/
  TokenProfilerDeck.vue
  data.mjs
  model.mjs
  token-profiler.css
```

The model/data layer should be deterministic. No real LLM/API calls are needed.

Do not delete legacy learning-map files during the prototype.

## 7. Required behaviors

- Every visible primary control works.
- Back/previous restores the prior presentation stage or prior simulation state predictably.
- Restart resets the synthetic run.
- Direct route refresh produces a valid initial state.
- Responsive desktop/mobile layout.
- Keyboard navigation may be supported but must not be the only way to proceed.
- Respect `prefers-reduced-motion`.
- No score, unlock, badge, or completion gamification.
- Synthetic data is labeled as such in the deck.
- All arithmetic totals are internally consistent.

## 8. Tests

At minimum cover:

1. canonical token totals sum correctly;
2. attribution sources sum to the same 162k input total;
3. selecting the primary redesign yields the specified 96k result;
4. aggressive summary has lower token use but fails the required quality constraint;
5. Data Analysis transfer profiler sums to 100%;
6. stage navigation/reset is deterministic;
7. no stage requires animation to expose essential information.

## 9. Prototype acceptance

The prototype is ready for user review when:

- the learner can run the workflow and see model calls accumulate;
- the learner can inspect usage by call and by context source;
- repeated history is visually understandable without a long text explanation;
- the measurement/instrumentation distinction is visible;
- architecture redesign changes the diagram, not only numbers;
- the same workload can be re-run and compared;
- verification can reject a cheaper design;
- the transfer case demonstrates that the bottleneck may be outside the LLM;
- the experience reads as an interactive presentation, not a dashboard or a long scrolling lesson.
