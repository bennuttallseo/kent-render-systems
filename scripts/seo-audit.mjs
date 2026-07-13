import fs from "fs";
import path from "path";

const root = path.resolve("src/data");
const files = [
  "locations.ts",
  "locations-midwest.ts",
  "locations-border.ts",
  "locations-coastal.ts",
];

const towns = [];
for (const f of files) {
  const t = fs.readFileSync(path.join(root, f), "utf8");
  const blocks = t.split(/export const \w+:/).slice(1);
  for (const b of blocks) {
    const town = b.match(/town: "([^"]+)"/)?.[1];
    const title = b.match(/title: "([^"]+)"/)?.[1];
    const desc = b.match(/description:\s*\n?\s*"([^"]+)"/)?.[1];
    const h1 = b.match(/h1: "([^"]+)"/)?.[1];
    const p = b.match(/path: "([^"]+)"/)?.[1];
    const paras = [...b.matchAll(/localParagraphs: \[([\s\S]*?)\],\s*\n\s*localImage/g)];
    let body = paras[0]?.[1] || "";
    const kw = town?.toLowerCase() || "";
    const renderKw = new RegExp(`rendering ${kw}|render ${kw}|${kw} rendering`, "gi");
    const kwCount = (body.match(renderKw) || []).length;
    towns.push({ town, title, titleLen: title?.length, desc, descLen: desc?.length, h1, path: p, kwCount, file: f });
  }
}

console.log("=== META LENGTHS ===");
for (const t of towns) {
  const issues = [];
  if (t.titleLen > 60) issues.push(`title ${t.titleLen}`);
  if (t.descLen < 140 || t.descLen > 155) issues.push(`desc ${t.descLen}`);
  if (t.kwCount > 8) issues.push(`kw ${t.kwCount}`);
  console.log(`${t.path}: title=${t.titleLen} desc=${t.descLen} kw=${t.kwCount} ${issues.join(" ") || "OK"}`);
}

const h1s = towns.map((t) => t.h1);
const dupH1 = h1s.filter((h, i) => h1s.indexOf(h) !== i);
console.log("\nDuplicate H1s:", [...new Set(dupH1)]);

const sentences = new Map();
for (const f of files) {
  const t = fs.readFileSync(path.join(root, f), "utf8");
  const matches = [...t.matchAll(/"([^"]{40,})"/g)].map((m) => m[1].replace(/<[^>]+>/g, ""));
  for (const s of matches) {
    if (s.includes("href") || s.includes("http")) continue;
    sentences.set(s, (sentences.get(s) || 0) + 1);
  }
}
const dupes = [...sentences.entries()].filter(([, c]) => c >= 4).sort((a, b) => b[1] - a[1]).slice(0, 15);
console.log("\n=== REPEATED SENTENCES (4+ pages) ===");
dupes.forEach(([s, c]) => console.log(`${c}x: ${s.slice(0, 80)}...`));
