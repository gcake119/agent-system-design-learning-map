import test from "node:test";
import assert from "node:assert/strict";
import { begin, advance, reflection, qualifies } from "../learning/engine.mjs";
function run(c) {
  let s = begin(c);
  for (let i = 0; i < 100; i++) s = advance(s);
  return s;
}
test("live experiment recovers from one timeout and records actual trajectory", () => {
  const s = run({ scenario: "transient" });
  assert.equal(s.status, "done");
  assert.equal(s.calls, 2);
  assert.equal(s.round, 2);
  assert.ok(s.events.some((e) => e.text.includes("TIMEOUT")));
  assert.equal(advance(s), s);
});
test("all configurations terminate within call budget without mutating prior state", () => {
  for (const scenario of ["smooth", "transient", "offline"])
    for (const source of ["live", "cache"])
      for (const limit of [1, 2, 3, 4])
        for (const retry of [true, false])
          for (const escalate of [true, false]) {
            const s = run({ scenario, source, limit, retry, escalate });
            assert.notEqual(s.status, "running");
            assert.ok(s.calls <= limit);
          }
  const s = begin();
  advance(s);
  assert.equal(s.events.length, 0);
  assert.equal(s.phase, "observe");
});
test("stale cache is never treated as verified success", () => {
  const s = run({ source: "cache" });
  assert.equal(s.status, "human");
  assert.equal(s.calls, 0);
  assert.equal(reflection(s).answer, "freshness");
});
test("completion requires safe terminal and correct reflection, not viewing", () => {
  assert.equal(qualifies(begin(), "bounded"), false);
  const s = run({ scenario: "offline" });
  assert.equal(s.status, "human");
  assert.equal(s.calls, 3);
  assert.equal(qualifies(s, "verified"), false);
  assert.equal(qualifies(s, "bounded"), true);
  assert.equal(
    qualifies(run({ scenario: "offline", escalate: false }), "bounded"),
    false,
  );
});
test("disabled retries stop after first failure; invalid settings rejected", () => {
  assert.equal(run({ retry: false }).calls, 1);
  assert.throws(() => begin({ limit: Infinity }));
  assert.throws(() => begin({ scenario: "unknown" }));
});
