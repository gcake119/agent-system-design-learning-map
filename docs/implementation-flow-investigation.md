# Flow Investigation Redesign — Implementation Handoff

> Branch: `flow-investigation-redesign`
> Date: 2026-09-30
> Current gate: Implementation
> Curriculum: CONFIRMED
> Technical QA: NOT TESTED
> Human Learning Review: deferred until learner starts the course

## Locked decisions

- Highest-level capability is cross-layer flow investigation, not System Design vocabulary coverage.
- Core reasoning primitive: find the first bad node using input / output / evidence.
- Teaching order: flow → locate → latency → cache → queue → consistency → evidence → integrated redesign.
- AI remains a collaborator, not course subject.
- Canonical teaching cases are standard public cases; familiar projects are transfer cases.
- The current live experience being too abstract / monotonous is a generalized Learning UX finding.
- Interaction must make path, state, evidence, quantity or trade-off visibly change.

## Implemented in this branch

### Curriculum navigation
`learning/course.mjs` now exposes the eight redesigned units:

1. 一個按鈕到底發生了什麼
2. 問題到底壞在哪一層
3. 系統為什麼會變慢
4. 為什麼要 Cache
5. 為什麼要 Queue
6. 資料為什麼看起來不一致
7. 系統出錯時怎麼知道
8. 找到問題以後，要怎麼改系統

Each unit uses observe → reason → transfer stages.

### Persistent system surface
Added:
- `learning/components/FlowInvestigationLab.vue`
- `learning/flow-scenarios.mjs`

The learning surface now provides:
- persistent architecture nodes
- scenario / failure switching
- active / abnormal node indication
- focused metrics / state
- evidence
- consequence / takeaway
- the shared 11-question investigation framework

### Implemented scenario families
- request flow
- first bad node
- latency bottleneck
- cache hit / miss / stale
- queue sync / async / backlog / worker failure
- stale data / replica lag / projection lag
- logs / metrics / traces / business state
- integrated DB / provider / queue / stale-read incidents

### Reflection behavior
The redesigned units no longer depend on multiple-choice answers. Learners operate the system surface first, then answer the stage prompt in their own words.

## Important limitations before merge

This branch has NOT yet received runtime verification.

Required before replacing production:
- pnpm test
- pnpm build
- browser QA
- direct routes / reload
- desktop / narrow desktop / mobile
- keyboard / focus
- reduced motion
- no horizontal overflow
- transfer flow
- final integrated transfer

Existing tests were written for the previous curriculum and may need to be rewritten around the new instructional relationships rather than old unit IDs / copy.

## Required next implementation work

1. Rewrite automated tests for new parameter → consequence relationships.
2. Align FinalIntegratedSimulator / final-transfer content with the new 11-question investigation framework.
3. Review old simulator components and remove / retain only what is still used.
4. Review terminology density and progressive disclosure.
5. Perform Technical QA.
6. Only after Technical QA, decide whether this branch replaces the current GitHub Pages version.
7. Human Learning Review begins when the learner actually starts studying.

## Human Learning Review focus

When learning begins, record:
- whether the learner can redraw the flow without the animation
- whether they choose evidence based on a hypothesis
- whether first bad node is confused with root cause
- whether System Design trade-off reasoning still emerges after debugging
- whether evidence panels are too dense
- whether transfer cases work without pattern labels

Do not infer learning success from completion rate or clicks.
