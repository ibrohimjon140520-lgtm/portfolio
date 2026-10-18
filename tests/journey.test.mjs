import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { cameraStops, chapterState, sceneCount } from "../lib/journey.ts";
import { projects, contact } from "../lib/data.ts";
function positionAt(progress) {
  const { from, to, mix } = chapterState(progress);
  return cameraStops[from].position.map(
    (v, i) => v + (cameraStops[to].position[i] - v) * mix,
  );
}
test("camera reaches each authored chapter and remains continuous across boundaries", () => {
  for (let i = 0; i < sceneCount; i++)
    assert.ok(
      Math.hypot(
        ...positionAt(i / (sceneCount - 1)).map(
          (v, j) => v - cameraStops[i].position[j],
        ),
      ) < 1e-10,
    );
  for (let i = 1; i < sceneCount - 1; i++) {
    const left = positionAt(i / (sceneCount - 1) - 1e-6),
      right = positionAt(i / (sceneCount - 1) + 1e-6);
    assert.ok(Math.hypot(...left.map((v, j) => v - right[j])) < 0.001);
  }
  for (let i = 0; i <= 1000; i++)
    assert.ok(positionAt(i / 1000).every(Number.isFinite));
  assert.deepEqual(positionAt(-1), cameraStops[0].position);
  assert.ok(
    Math.hypot(
      ...positionAt(2).map(
        (v, j) => v - cameraStops[sceneCount - 1].position[j],
      ),
    ) < 1e-10,
  );
});
test("camera and viewing target never coincide during the journey", () => {
  for (let i = 0; i <= 1000; i++) {
    const { from, to, mix } = chapterState(i / 1000);
    const target = cameraStops[from].target.map(
      (v, j) => v + (cameraStops[to].target[j] - v) * mix,
    );
    const camera = positionAt(i / 1000);
    assert.ok(Math.hypot(...camera.map((v, j) => v - target[j])) > 3);
  }
});
test("all six projects have complete local assets and editable details", () => {
  assert.equal(projects.length, 6);
  assert.equal(new Set(projects.map((p) => p.id)).size, 6);
  for (const p of projects) {
    assert.ok(p.services.length > 0);
    assert.ok(p.description.length > 30);
    assert.ok(p.role);
    assert.ok(existsSync(`public${p.cover}`));
    const svg = readFileSync(`public${p.cover}`, "utf8");
    assert.match(svg, /<svg/);
    assert.ok(
      !/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[\da-f]+;)/i.test(svg),
      "SVG contains an unescaped XML entity",
    );
    assert.ok(!svg.includes('href="http'));
    assert.match(svg, new RegExp(p.title));
  }
});
test("contact channels are configured with author's verified links", () => {
  assert.equal(contact.length, 5);
  for (const c of contact) {
    assert.ok(c.href && c.href.startsWith("https://"));
  }
  assert.ok(contact.some((c) => c.href?.includes("ummatillayev511")));
  assert.ok(contact.some((c) => c.href?.includes("NiCFlg3N6i9iM2Ji")));
  assert.ok(
    contact.some((c) =>
      c.href?.includes("linkedin.com/in/ibrohimjon-ummatillayev"),
    ),
  );
  assert.ok(contact.some((c) => c.href?.includes("ibrohim_14o2")));
  assert.ok(contact.some((c) => c.href?.includes("ibrohimjon140520-lgtm")));
});
