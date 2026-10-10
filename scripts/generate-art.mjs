import { writeFileSync } from "node:fs";
const defs = `<defs>
<linearGradient id="chrome" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#060810"/><stop offset=".18" stop-color="#6b7284"/><stop offset=".3" stop-color="#e9eef5"/><stop offset=".36" stop-color="#7b8294"/><stop offset=".49" stop-color="#131822"/><stop offset=".58" stop-color="#040609"/><stop offset=".68" stop-color="#7e8dba"/><stop offset=".76" stop-color="#e7eef8"/><stop offset=".86" stop-color="#596173"/><stop offset="1" stop-color="#090c14"/></linearGradient>
<radialGradient id="glow"><stop stop-color="#3d5fff" stop-opacity=".22"/><stop offset="1" stop-color="#05060a" stop-opacity="0"/></radialGradient>
<linearGradient id="spectral" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bacfff"/><stop offset=".28" stop-color="#716ca9"/><stop offset=".48" stop-color="#f4bfe3"/><stop offset=".7" stop-color="#a5baf9"/><stop offset="1" stop-color="#e5fba8"/></linearGradient>
<linearGradient id="stone"><stop stop-color="#dbd2c0"/><stop offset="1" stop-color="#615e57"/></linearGradient>
<filter id="shadow"><feGaussianBlur stdDeviation="24"/></filter></defs>`;
const escapeXml = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('\"', "&quot;");
const shell = (title, sub, art, bg = "#101115") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000" width="1400" height="1000" role="img" aria-label="${escapeXml(title)} — ${escapeXml(sub)}">${defs}<rect width="1400" height="1000" fill="${bg}"/><circle cx="780" cy="460" r="580" fill="url(#glow)"/>${art}<g fill="#d8dce7" font-family="Arial,Helvetica,sans-serif"><text x="62" y="75" font-size="17" letter-spacing="5">CREATOR® / CONCEPT SERIES</text><text x="62" y="900" font-size="66" font-weight="bold" letter-spacing="-3">${escapeXml(title)}</text><text x="65" y="940" font-size="17" letter-spacing="2" fill="#9a9da8">${escapeXml(sub.toUpperCase())}</text><text x="1250" y="940" font-size="15">2026</text></g></svg>`;
const orbit = `<ellipse cx="770" cy="760" rx="270" ry="40" fill="#000" filter="url(#shadow)"/><g transform="translate(745 430) rotate(-28)"><ellipse rx="228" ry="279" fill="none" stroke="url(#chrome)" stroke-width="122"/><ellipse rx="220" ry="271" fill="none" stroke="#ccd9ff" stroke-opacity=".25" stroke-width="1.5"/><ellipse rx="368" ry="99" fill="none" stroke="#a0baff" stroke-width="1.2" transform="rotate(22)"/><ellipse rx="334" ry="128" fill="none" stroke="#687a9c" stroke-width="1" transform="rotate(-28)"/><circle cx="345" cy="30" r="24" fill="url(#chrome)"/><circle cx="-230" cy="-225" r="12" fill="#d1f88d"/></g><path d="M960 210l80-38m-574 427-99 42" stroke="#6c83ff" stroke-width="2"/>`;
writeFileSync(
  "public/projects/nexora.svg",
  shell("NEXORA", "Digital brand experience", orbit),
);
let architecture = "";
for (let i = 6; i >= 0; i--) {
  let x = 435 + i * 51,
    y = 260 - i * 20;
  architecture += `<path d="M${x} ${y + 350}V${y}h245v350" fill="none" stroke="#102011" stroke-width="53"/><path d="M${x + 8} ${y + 340}V${y - 10}h245v350" fill="none" stroke="#badf79" stroke-width="36"/><path d="M${x - 10} ${y + 340}V${y - 28}h264" fill="none" stroke="#e2f3b9" stroke-width="2"/>`;
}
writeFileSync(
  "public/projects/velora.svg",
  shell(
    "VELORA",
    "Interactive architecture",
    `<path d="M0 765L1400 555V1000H0Z" fill="#181d18"/><ellipse cx="790" cy="680" rx="390" ry="68" fill="#000" filter="url(#shadow)"/>${architecture}`,
    "#121914",
  ),
);
let lines = "";
for (let i = 0; i < 48; i++) {
  let d = i * 5;
  lines += `<ellipse cx="700" cy="450" rx="${140 + d}" ry="${270 - d * 0.38}" transform="rotate(${i * 3.75} 700 450)" fill="none" stroke="url(#spectral)" stroke-width="2.5" opacity="${0.4 + i * 0.012}"/>`;
}
writeFileSync(
  "public/projects/aurora.svg",
  shell("AURORA", "A fluid visual identity", lines, "#17131f"),
);
let ribbons = "";
for (let i = 0; i < 24; i++)
  ribbons += `<path d="M${280 + i * 4} 650C${100 + i * 10} ${280 - i * 4},${1130 - i * 5} ${180 + i * 10},${930 + i * 4} 530S${400 + i * 9} ${680 - i * 4},${910 + i * 4} 255" fill="none" stroke="${i % 3 === 0 ? "#ffccb0" : "#fa7249"}" stroke-width="${2 + i * 0.12}" opacity=".8"/>`;
writeFileSync(
  "public/projects/flux.svg",
  shell("FLUX", "Studies in motion", ribbons, "#1b1110"),
);
let shards = "";
for (let i = 0; i < 32; i++) {
  let a = i * 2.39996,
    r = 100 + Math.sqrt(i / 32) * 220,
    x = 710 + Math.cos(a) * r,
    y = 450 + Math.sin(a) * r;
  shards += `<path d="M${x} ${y - 64}l${25 + (i % 20)} 83-62 22Z" fill="url(#chrome)" stroke="#9eb2ff" stroke-width=".7" transform="rotate(${i * 37} ${x} ${y})"/>`;
}
writeFileSync(
  "public/projects/obscura.svg",
  shell(
    "OBSCURA",
    "Light, at the edge of matter",
    `<ellipse cx="710" cy="460" rx="308" ry="280" fill="none" stroke="#344063" stroke-width=".8"/>${shards}`,
    "#080b13",
  ),
);
const blocks = `<path d="M0 800L1400 600v400H0Z" fill="#34332e"/><path d="M450 685l470 35 320-110-380-70Z" fill="#10120f"/><path d="M420 220h145v470H420Z" fill="url(#stone)"/><path d="M565 220l70-38v465l-70 43Z" fill="#534f48"/><path d="M420 220l70-38h145l-70 38Z" fill="#e5ddcd"/><path d="M620 320h140v365H620Z" fill="url(#stone)"/><path d="M760 320l70-38v365l-70 38Z" fill="#5d584e"/><path d="M620 320l70-38h140l-70 38Z" fill="#e5ddcd"/><path d="M820 160h143v505H820Z" fill="url(#stone)"/><path d="M963 160l70-38v505l-70 38Z" fill="#55534a"/><path d="M820 160l70-38h143l-70 38Z" fill="#e5ddcd"/>`;
writeFileSync(
  "public/projects/monolith.svg",
  shell("MONOLITH", "Architecture & spatial design", blocks, "#24251f"),
);
writeFileSync(
  "public/artifact.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="250 30 1020 850">${defs}${orbit}</svg>`,
);
writeFileSync(
  "app/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#08090b"/><path d="M32 10L54 22V43L32 55 10 43V22Z" fill="none" stroke="#f1f1ec" stroke-width="3"/><path d="M32 10v45M10 22l44 21M54 22L10 43" stroke="#6486ff" stroke-width="2"/></svg>`,
);
console.log("Generated seven local artwork assets and CREATOR icon.");
