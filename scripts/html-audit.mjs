import fs from "fs";
import path from "path";

const dist = path.resolve("dist");
const pages = [];

function walk(dir, base = "") {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = path.join(base, e.name).replace(/\\/g, "/");
    if (e.isDirectory()) walk(p, rel);
    else if (e.name === "index.html") pages.push("/" + rel.replace(/\/index\.html$/, "").replace(/^\/$/, "/") || "/");
  }
}

walk(dist);

const coreMeta = {
  "/": { title: "Kent Render Systems | Silicone & Monocouche Rendering Kent", desc: null },
  "/about": { title: "About Kent Render Systems | Owner-Led Rendering Experts", desc: "Kent Render Systems is an owner-led rendering company serving Kent. Every job is led by Jack, a time-served specialist with nearly 20 years in the trade." },
  "/contact": { title: "Contact Kent Render Systems | Free Rendering Quotes in Kent", desc: "Contact Kent Render Systems for a free, no-obligation rendering quote. Call 07707 564597 or email info@kentrendersystems.co.uk. Serving Kent and beyond." },
  "/areas-we-cover": { title: "Areas We Cover | Kent Render Systems", desc: "Kent Render Systems covers towns across Kent and the south east London border. Find your local rendering page for silicone and monocouche render. Free quotes." },
  "/silicone-rendering-kent": { title: "Silicone Rendering in Kent | Kent Render Systems", desc: "Expert silicone rendering in Kent from Kent Render Systems. Exterior and external silicone render by Jack. Free surveys with clear silicone render Kent prices." },
  "/monocouche-rendering-kent": { title: "Monocouche Rendering in Kent | Kent Render Systems", desc: "Monocouche rendering in Kent by Kent Render Systems. Through-coloured mono render with monocouche render colours to choose from. Free quotes and Kent prices." },
};

console.log("=== BUILT HTML AUDIT ===\n");
const results = [];

for (const slug of pages.sort()) {
  const file = slug === "/" ? path.join(dist, "index.html") : path.join(dist, slug.slice(1), "index.html");
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, "utf8");
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const ogImage = html.match(/property="og:image"/);
  const noindex = /noindex/i.test(html);
  const todo = /TODO_/.test(html);
  const hasBody = html.includes("<main");
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  const mainText = mainMatch ? mainMatch[1].replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
  const emDash = /[—–]/.test(mainText);
  const imgsNoAlt = [...html.matchAll(/<img(?![^>]*alt=)[^>]*>/gi)].length;
  const heroLazy = /<section class="location-hero"[\s\S]*?<img[^>]*loading="lazy"/.test(html) || /<section class="service-hero"[\s\S]*?<img[^>]*loading="lazy"/.test(html);

  results.push({ slug, h1Count: h1s.length, h1: h1s[0], canonical, ogImage: !!ogImage, noindex, todo, hasBody, mainLen: mainText.length, emDash, imgsNoAlt, heroLazy });
}

for (const r of results) {
  const issues = [];
  if (r.h1Count !== 1) issues.push(`h1=${r.h1Count}`);
  if (!r.ogImage) issues.push("no og:image");
  if (r.todo) issues.push("TODO in schema");
  if (r.noindex) issues.push("noindex");
  if (r.canonical && !r.canonical.endsWith("/") && r.slug !== "/") issues.push("canonical no trailing slash");
  if (r.mainLen < 200) issues.push(`thin main ${r.mainLen}`);
  if (r.emDash) issues.push("em dash in body");
  if (r.imgsNoAlt) issues.push(`img no alt ${r.imgsNoAlt}`);
  if (r.heroLazy) issues.push("hero lazy");
  console.log(`${r.slug}: ${issues.join(", ") || "OK"}`);
}

console.log("\n=== CORE META LENGTHS ===");
for (const [slug, m] of Object.entries(coreMeta)) {
  if (m.desc) console.log(`${slug}: title=${m.title.length} desc=${m.desc.length}`);
}
