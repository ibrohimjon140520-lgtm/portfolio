import assert from "node:assert/strict";
import { projects } from "../lib/data.ts";
const base = process.env.CREATOR_TEST_URL || "http://127.0.0.1:3000";
const response = await fetch(base);
assert.equal(response.status, 200);
const html = await response.text();
for (const section of ["home", "about", "works", "motion", "faq", "contact"])
  assert.ok(html.includes(`id="${section}"`), `Missing section ${section}`);
assert.ok(html.includes("Ummatillayev Ibrohimjon"));
assert.ok(html.includes("CREATOR"));
assert.ok(html.includes("Skip to works"));
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(ids.length, new Set(ids).size, "Duplicate DOM IDs");
for (const p of projects) {
  const asset = await fetch(base + p.cover);
  assert.equal(asset.status, 200, `${p.cover} did not load`);
  assert.match(asset.headers.get("content-type"), /svg/);
}
const asset = await fetch(base + "/artifact.svg");
assert.equal(asset.status, 200);
const missing = await fetch(base + "/this-route-does-not-exist");
assert.equal(missing.status, 404);
console.log(
  "PASS: HTTP 200, six surveillance portfolio sections, brand, unique IDs, seven local assets, and 404 handling.",
);
