import fs from "fs";
import path from "path";

const SRC = path.resolve("src");

function patchContent(content) {
  return content
    .replace(/href=(\\?")(\/[a-z0-9-]+)\/(\\?")/g, (_m, open, url, close) => `href=${open}${url}${close}`)
    .replace(/href: "(\/[a-z0-9-]+)\/"/g, (_m, url) => `href: "${url}"`)
    .replace(/path: "(\/[a-z0-9-]+)\/"/g, (_m, url) => `path: "${url}"`)
    .replace(/path="(\/[a-z0-9-]+)\/"/g, (_m, url) => `path="${url}"`);
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
