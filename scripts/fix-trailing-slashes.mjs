import fs from "fs";
import path from "path";

const SRC = path.resolve("src");

function ensureTrailingSlash(url) {
  if (url === "/" || url.endsWith("/")) return url;
  return `${url}/`;
}

function patchContent(content) {
  return content
    .replace(/href=\\?"(\/[a-z0-9-]+)\\?"/g, (match, url) => {
      const fixed = ensureTrailingSlash(url);
      return match.replace(url, fixed);
    })
    .replace(/href: "(\/[a-z0-9-]+)"/g, (match, url) => {
      const fixed = ensureTrailingSlash(url);
      return `href: "${fixed}"`;
    })
    .replace(/path: "(\/[a-z0-9-]+)"/g, (match, url) => {
      const fixed = ensureTrailingSlash(url);
      return `path: "${fixed}"`;
    });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(astro|ts|tsx|js|mjs)$/.test(entry.name)) {
      const original = fs.readFileSync(full, "utf8");
      const updated = patchContent(original);
      if (updated !== original) {
        fs.writeFileSync(full, updated);
        console.log("updated", path.relative(SRC, full));
      }
    }
  }
}

walk(SRC);
