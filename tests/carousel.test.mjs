import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Portfolio from "../components/Portfolio.tsx";
import { carouselPose, roundedSignal } from "../lib/carousel.ts";

test("each camera becomes front-facing exactly once over a finite gallery journey", () => {
  for (const radius of [280, 560])
    for (let phase = 0; phase < 6; phase++) {
      const front = carouselPose(phase, phase, 6, radius);
      assert.equal(front.x, 0);
      assert.equal(front.z, 0);
      assert.equal(front.rotationY, 0);
      assert.equal(front.opacity, 1);
      for (let i = 0; i < 6; i++) {
        const p = carouselPose(i, phase, 6, radius);
        assert.ok(Object.values(p).every(Number.isFinite));
        assert.ok(p.z <= 0);
        if (i !== phase)
          assert.ok(p.z < 0, "Other cameras remain behind the current camera");
      }
    }
});

test("gallery poses are continuous and identical when scrubbing backwards", () => {
  const forward = Array.from({ length: 501 }, (_, i) =>
    carouselPose(2, i / 100, 6, 560),
  );
  for (let i = 500; i >= 0; i--)
    assert.deepEqual(carouselPose(2, i / 100, 6, 560), forward[i]);
  for (let i = 1; i < forward.length; i++)
    assert.ok(Math.abs(forward[i].x - forward[i - 1].x) < 6);
});

test("SVG geometry serializes stable rounded coordinates across small floating point differences", () => {
  for (let i = 0; i < 44; i++) {
    const t = (i - 21.5) / 22;
    const values = [
      t * 235,
      Math.sin(t * Math.PI) * 26,
      Math.sqrt(1 - t * t) * 75 + 2,
      Math.sqrt(1 - t * t) * 239,
      t * 35,
    ];
    for (const n of values)
      assert.equal(roundedSignal(n + 1e-12), roundedSignal(n - 1e-12));
  }
  const first = renderToStaticMarkup(React.createElement(Portfolio));
  assert.equal(first, renderToStaticMarkup(React.createElement(Portfolio)));
  assert.ok(
    !/\d\.\d{5,}/.test(
      first.match(/<svg viewBox="0 0 800 650"[\s\S]*?<\/svg>/)?.[0] || "",
    ),
    "No platform-dependent long SVG decimals",
  );
  assert.ok(first.includes('aria-label="Next camera"'));
  assert.ok(first.includes("CONTINUE BELOW"));
});
