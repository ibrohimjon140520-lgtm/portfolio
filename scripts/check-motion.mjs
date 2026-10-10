import { readdirSync, statSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
const ffmpeg =
  process.env.FFMPEG_PATH ||
  "node_modules/@ffmpeg-installer/darwin-arm64/ffmpeg";
let bytes = 0;
for (const file of readdirSync("public/motion").filter((file) =>
  file.endsWith(".mp4"),
)) {
  const path = `public/motion/${file}`;
  const result = spawnSync(
    ffmpeg,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      path,
      "-vf",
      "fps=1",
      "-f",
      "framemd5",
      "-",
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, `${file}: ${result.stderr}`);
  const frames = result.stdout
    .split("\n")
    .filter((line) => line && !line.startsWith("#"));
  assert.equal(frames.length, 4, `${file}: four seconds of decodable video`);
  assert.ok(
    new Set(frames.map((line) => line.split(",").at(-1).trim())).size > 1,
    `${file}: frames must actually animate`,
  );
  assert.ok(
    statSync(path.replace(".mp4", ".jpg")).size > 1000,
    `${file}: poster exists`,
  );
  bytes += statSync(path).size;
  console.log(
    `PASS ${file}: decodable, animated, four seconds, poster present.`,
  );
}
const pkg = JSON.parse(readFileSync("package.json", "utf8")),
  lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
assert.deepEqual(
  pkg.optionalDependencies,
  lock.packages[""].optionalDependencies,
);
assert.deepEqual(pkg.devDependencies, lock.packages[""].devDependencies);
console.log(
  `Total video payload: ${(bytes / 1024 / 1024).toFixed(2)} MB, lazy-loaded by viewport.`,
);
