import fs from "fs";
import path from "path";

// Matches astro.config.mjs: build.format "file" (about.html) and trailingSlash "never".
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
    else if (e.name.endsWith(".html")) {
      const slug = rel === "index.html" ? "/" : `/${rel.replace(/\.html$/, "")}`;
      pages.push({ slug, file: p, html: fs.readFileSync(p, "utf8") });
    }
  }
  return pages;
}

const pages = walkHtml(DIST);
const slugs = new Set(pages.map((p) => p.slug));
const isStub = (html) => /http-equiv="refresh"/.test(html);
const stubs = pages.filter((p) => isStub(p.html)).map((p) => p.slug);
const livePages = pages.filter((p) => !isStub(p.html) && p.slug !== "/404");
const locationPages = livePages.filter((p) => p.slug.startsWith("/rendering-"));

// _redirects sources count as valid link targets
const redirects = fs.readFileSync(path.join(DIST, "_redirects"), "utf8");
const redirectSources = new Set(
  redirects.split(/\r?\n/).map((l) => l.trim().split(/\s+/)[0]).filter((s) => s?.startsWith("/")),
);

// Core pages
for (const r of ["/", "/about", "/contact", "/areas-we-cover", "/projects", "/silicone-rendering-kent", "/monocouche-rendering-kent"]) {
  if (!slugs.has(r)) add("blocker", `Missing page: ${r}`);
}
if (!slugs.has("/404")) add("important", "No 404 page (dist/404.html)");

// Sitemap: every live page, nothing else, no trailing slashes
const sitemap = fs.readFileSync(path.join(DIST, "sitemap-0.xml"), "utf8");
const sitemapSlugs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "") || "/");
for (const s of sitemapSlugs) {
  if (s !== "/" && s.endsWith("/")) add("blocker", `Sitemap has trailing slash: ${s}`);
  if (!slugs.has(s)) add("blocker", `Sitemap URL not built: ${s}`);
  if (stubs.includes(s) || s === "/404") add("blocker", `Sitemap includes non-content URL: ${s}`);
}
for (const { slug } of livePages) {
  if (!sitemapSlugs.includes(slug)) add("important", `Live page missing from sitemap: ${slug}`);
}

// Hub links
const hub = fs.readFileSync("src/data/locationHub.ts", "utf8");
for (const m of hub.matchAll(/href: "(\/rendering-[^"]+)"/g)) {
  if (!slugs.has(m[1])) add("blocker", `Hub link broken: ${m[1]}`);
}

const assetExists = (url) => fs.existsSync(path.join(DIST, decodeURI(url).slice(1)));

// Per live page
for (const { slug, html } of livePages) {
  if (/TODO/i.test(html)) add("blocker", `${slug}: TODO in output`);
  if (!html.includes('property="og:image"')) add("blocker", `${slug}: missing og:image`);
  if (/aggregateRating|ratingValue|"@type":\s*"Review"/i.test(html)) add("blocker", `${slug}: review schema`);
  if (/elfsight/i.test(html)) add("blocker", `${slug}: Elfsight still loaded`);

  const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
  if (h1s !== 1) add("important", `${slug}: ${h1s} H1 tags`);

  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const expected = slug === "/" ? `${SITE}/` : `${SITE}${slug}`;
  if (canonical !== expected) add("blocker", `${slug}: canonical ${canonical} (expected ${expected})`);

  // Internal page links
  for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    const href = m[1];
    if (href.startsWith("//") || href.startsWith("/_astro/") || /\.[a-z0-9]{2,5}$/i.test(href)) continue;
    if (href !== "/" && href.endsWith("/")) add("blocker", `${slug}: link has trailing slash ${href}`);
    else if (!slugs.has(href) && !redirectSources.has(href)) add("blocker", `${slug}: broken link ${href}`);
    else if (stubs.includes(href) || redirectSources.has(href)) add("minor", `${slug}: links to redirect ${href}`);
  }

  // Images and other local assets
  for (const m of html.matchAll(/(?:src|href|content)="(\/(?!\/)[^"]+\.(?:jpe?g|png|webp|avif|svg|ico|gif))"/gi)) {
    if (!assetExists(m[1])) add("blocker", `${slug}: missing asset ${m[1]}`);
  }

  // Same-page anchors
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${m[1]}"`)) add("important", `${slug}: anchor #${m[1]} has no target`);
  }
}

// Static assets
for (const f of ["robots.txt", "_redirects", "_headers", "sitemap-index.xml"]) {
  if (!fs.existsSync(path.join(DIST, f))) add("blocker", `Missing dist/${f}`);
}
if (!redirects.includes("/locations /areas-we-cover")) add("blocker", "_redirects: /locations must 301 to /areas-we-cover");
if (!redirects.includes("/rendering-maidenstone /rendering-maidstone")) add("blocker", "_redirects: maidenstone typo redirect missing");
if (!/^\/review\s+https:\/\/g\.page\//m.test(redirects)) add("blocker", "_redirects: /review short link missing");

// Report
const dedupe = (list) => [...new Set(list)];
console.log("=== PRE-LAUNCH AUDIT ===\n");
console.log(`Live pages: ${livePages.length} (+ ${stubs.length} redirect stubs)`);
console.log(`Location pages: ${locationPages.length}`);
console.log(`Sitemap URLs: ${sitemapSlugs.length}\n`);

for (const level of ["blocker", "important", "minor"]) {
  const list = dedupe(issues[level]);
  if (list.length) {
    console.log(`${level.toUpperCase()} (${list.length})`);
    list.forEach((i) => console.log(`  - ${i}`));
    console.log("");
  }
}
let verdict = "READY TO SHIP";
if (issues.blocker.length) verdict = "HOLD — fix blockers";
else if (issues.important.length) verdict = "SHIP — minor items only";

console.log(`VERDICT: ${verdict}`);
process.exit(issues.blocker.length ? 1 : 0);
