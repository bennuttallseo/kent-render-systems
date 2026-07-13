import fs from "fs";
import path from "path";

const DIST = path.resolve("dist");
const slugs = new Set();

function walk(dir, base = "") {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), rel);
    else if (e.name === "index.html") slugs.add(base ? `/${base.replace(/\\/g, "/")}` : "/");
  }
}
walk(DIST);

const hub = fs.readFileSync("src/data/locationHub.ts", "utf8");
const hrefs = [...hub.matchAll(/href: "(\/rendering-[^"]+)"/g)].map((m) => m[1]);
const missingHub = hrefs.filter((h) => !slugs.has(h));
console.log(`Hub town links: ${hrefs.length}, missing: ${missingHub.length}`);
missingHub.forEach((h) => console.log("  MISSING", h));

const footer = [...hub.matchAll(/href: "(\/rendering-[^"]+)"/g)].map((m) => m[1]);
const broken = [];
for (const slug of slugs) {
  const file = slug === "/" ? path.join(DIST, "index.html") : path.join(DIST, slug.slice(1), "index.html");
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  for (const m of html.matchAll(/href="(\/(?:about|contact|areas-we-cover|silicone-rendering-kent|monocouche-rendering-kent|rendering-[^"#?]*))"/g)) {
    const href = m[1];
    if (href.endsWith("/")) broken.push(`${slug} trailing slash: ${href}`);
    else if (!slugs.has(href) && href !== "/areas-we-cover") broken.push(`${slug} -> ${href}`);
  }
}
console.log(`Link issues: ${broken.length}`);
broken.slice(0, 15).forEach((b) => console.log(" ", b));
