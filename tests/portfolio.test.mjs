import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Portfolio from "../components/Portfolio.tsx";
const html = renderToStaticMarkup(React.createElement(Portfolio));

test("surveillance portfolio has all six sections in natural document order", () => {
  let previous = -1;
  for (const id of ["home", "about", "works", "motion", "faq", "contact"]) {
    const index = html.indexOf(`id="${id}"`);
    assert.ok(index > previous, `${id} follows the previous section`);
    previous = index;
  }
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes("UMMATILLAYEV"));
  assert.ok(html.includes("IBROHIMJON"));
  assert.ok(!html.includes("cinema-journey"));
});

test("six project feeds have accessible buttons and stable server-rendered clocks", () => {
  assert.equal((html.match(/class="camera-card"/g) || []).length, 6);
  assert.equal((html.match(/aria-label="Explore /g) || []).length, 6);
  assert.equal((html.match(/data-clock=""/g) || []).length, 18);
  assert.equal((html.match(/--:--:-- UTC/g) || []).length, 18);
  assert.ok(html.includes("CONCEPT STUDIES / NOT CLIENT COMMISSIONS"));
});

test("FAQ controls reference unique answer regions and contact remains honest", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (let i = 0; i < 5; i++) {
    assert.ok(html.includes(`aria-controls="answer-${i}"`));
    assert.ok(html.includes(`id="answer-${i}"`));
    assert.ok(html.includes(`aria-labelledby="question-${i}"`));
  }
  assert.ok(html.includes("Direct contact details coming soon."));
  assert.ok(!html.includes("mailto:"));
  assert.ok(html.includes("Skip to works"));
});
