export const SITE_URL = "https://kentrendersystems.co.uk";

/** Normalise a site path to a canonical URL with trailing slash (except root). */
export function canonicalUrl(path: string): string {
  if (path === "/" || path === "") return `${SITE_URL}/`;
  return `${SITE_URL}${path.replace(/\/?$/, "/")}`;
}

/** Absolute URL for a public asset (e.g. OG image). */
export function assetUrl(assetPath: string): string {
  const normalised = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${SITE_URL}${normalised}`;
}
