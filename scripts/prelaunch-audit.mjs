import fs from "fs";
import path from "path";

const DIST = path.resolve("dist");
const SITE = "https://kentrendersystems.co.uk";
const issues = { blocker: [], important: [], minor: [] };
const add = (level, msg) => issues[level].push(msg);

function walkHtml(dir, base = "") {
  const pages = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) pages.push(...walkHtml(p, rel));
    else if (e.name === "index.html") {
      const slug = base ? `/${base.replace(/\\/g, "/")}` : "/";
      pages.push({ slug, file: p });
    }
  }
  return pages;
}

const pages = walkHtml(DIST);
const slugs = new Set(pages.map((p) => p.slug));
const livePages = pages.filter((p) => !["/locations", "/rendering-maidenstone"].includes(p.slug));
const locationPages = livePages.filter((p) => p.slug.startsWith("/rendering-"));

// Core checks
if (locationPages.length !== 26) add("blocker", `Expected 26 live location pages, found ${locationPages.length}`);
for (const r of ["/", "/about", "/contact", "/areas-we-cover", "/silicone-rendering-kent", "/monocouche-rendering-kent"]) {
  if (!slugs.has(r)) add("blocker", `Missing page: ${r}`);
}

// Sitemap
const sitemap = fs.readFileSync(path.join(DIST, "sitemap-0.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (sitemapUrls.length !== 38) add("important", `Sitemap has ${sitemapUrls.length} URLs (expected 38)`);
for (const url of sitemapUrls) {
  const slug = url.replace(SITE, "") || "/";
  if (slug !== "/" && !slug.endsWith("/")) add("blocker", `Sitemap missing trailing slash: ${slug}`);
  if (!slugs.has(slug)) add("blocker", `Sitemap URL not built: ${slug}`);
}
if (sitemapUrls.some((u) => u.includes("locations") || u.includes("maidenstone"))) {
  add("blocker", "Sitemap includes redirect-only URLs");
}

// Hub links
const hub = fs.readFileSync("src/data/locationHub.ts", "utf8");
for (const m of hub.matchAll(/href: "(\/rendering-[^"]+)"/g)) {
  if (!slugs.has(m[1])) add("blocker", `Hub link broken: ${m[1]}`);
}

// Per live page
for (const { slug, file } of livePages) {
  const html = fs.readFileSync(file, "utf8");
  if (/TODO/i.test(html)) add("blocker", `${slug}: TODO in output`);
  if (!html.includes('property="og:image"')) add("blocker", `${slug}: missing og:image`);
  if (/aggregateRating|"@type":"Review"/i.test(html)) add("blocker", `${slug}: review schema`);

  const h1s = [...html.matchAll(/<h1[^>]*>/gi)].length;
  if (h1s !== 1) add("important", `${slug}: ${h1s} H1 tags`);

  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const expected = slug === "/" ? `${SITE}/` : `${SITE}${slug}`;
  if (canonical !== expected) add("blocker", `${slug}: canonical ${canonical} (expected ${expected})`);

  for (const m of html.matchAll(/href="(\/(?:about|contact|areas-we-cover|silicone-rendering-kent|monocouche-rendering-kent|rendering-[^"#?]*))"/g)) {
    const href = m[1];
    if (!href.endsWith("/")) add("blocker", `${slug}: link missing trailing slash ${href}`);
    if (!slugs.has(href)) add("blocker", `${slug}: broken link ${href}`);
  }

  for (const m of html.matchAll(/src="(\/images\/[^"]+)"/g)) {
    if (!fs.existsSync(path.join(DIST, m[1].slice(1).replace(/\//g, path.sep)))) {
      add("blocker", `${slug}: missing image ${m[1]}`);
    }
  }
}

// Static assets
for (const f of ["robots.txt", "_redirects", "_headers", "sitemap-index.xml"]) {
  if (!fs.existsSync(path.join(DIST, f))) add("blocker", `Missing dist/${f}`);
}

const redirects = fs.readFileSync(path.join(DIST, "_redirects"), "utf8");
if (!redirects.includes("/locations /areas-we-cover")) add("blocker", "_redirects: /locations must 301 to /areas-we-cover");
if (!redirects.includes("/rendering-maidenstone /rendering-maidstone")) add("blocker", "_redirects: maidenstone typo redirect missing");

// Report
console.log("=== PRE-LAUNCH AUDIT ===\n");
console.log(`Live pages: ${livePages.length} (+ 2 redirect stubs)`);
console.log(`Location pages: ${locationPages.length}`);
console.log(`Sitemap URLs: ${sitemapUrls.length}\n`);

let verdict = "READY TO SHIP";
for (const level of ["blocker", "important", "minor"]) {
  if (issues[level].length) {
    console.log(`${level.toUpperCase()} (${issues[level].length})`);
    issues[level].forEach((i) => console.log(`  - ${i}`));
    console.log("");
  }
}
if (issues.blocker.length) verdict = "HOLD — fix blockers";
else if (issues.important.length) verdict = "SHIP — minor items only";

console.log(`VERDICT: ${verdict}`);
process.exit(issues.blocker.length ? 1 : 0);
