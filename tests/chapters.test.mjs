import test from "node:test";
import assert from "node:assert/strict";
import { chapters, position, route } from "../learning/chapters.mjs";
import { readFileSync } from "node:fs";
test("seven chapters contain complete guided pages with meaningful changes", () => {
  assert.equal(chapters.length, 7);
  assert.equal(new Set(chapters.map((c) => c.id)).size, 7);
  assert.equal(
    chapters.reduce((n, c) => n + c.pages.length, 0),
    36,
  );
  for (const chapter of chapters)
    for (const p of chapter.pages) {
      assert.ok(p.title && p.intro && p.action);
      assert.equal(p.labels.length, 3);
      assert.equal(p.before.length, 3);
      if (p.choices) {
        assert.ok(p.choices.length >= 2);
        for (const choice of p.choices) {
          assert.equal(choice.cards.length, 3);
          assert.ok(choice.feedback);
          assert.notDeepEqual(choice.cards, p.before);
        }
      } else {
        assert.equal(p.after.length, 3);
        assert.ok(p.explanation);
        assert.notDeepEqual(p.before, p.after);
      }
    }
});
test("every chapter and page has a valid direct bookmark", () => {
  chapters.forEach((c, i) =>
    c.pages.forEach((p, j) =>
      assert.deepEqual(position(route(i, j)), {
        chapter: i,
        page: j,
        map: false,
      }),
    ),
  );
  assert.equal(position("#/unknown").map, true);
  assert.equal(position("#/learn/missing/1").map, true);
  assert.equal(position("#/learn/loop/0").page, 0);
  assert.equal(position("#/learn/loop/999").page, 5);
});
test("public app has one learning path without grading or slide mode", () => {
  const source = readFileSync(
    new URL("../learning/App.vue", import.meta.url),
    "utf8",
  );
  assert.ok(!source.includes("qualifies("));
  assert.ok(!source.includes("/slides/"));
  assert.ok(!source.includes("engine.mjs"));
  const pkg = JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  assert.ok(!pkg.scripts.build.includes("slidev"));
  assert.equal(pkg.scripts["dev:slides"], undefined);
});
