import reviewsData from "./reviews.json";

// Update this one number as new Google reviews come in.
export const REVIEW_COUNT = 18;

// Opens the "write a review" box on Google (not the review list).
// Short link for clients: kentrendersystems.co.uk/review (see public/_redirects).
export const GBP_REVIEW_URL = "https://g.page/r/Cdv9zBnPTuZbEBM/review";

export interface Review {
  name: string;
  service: string;
  town?: string;
  tags: string[];
  text: string;
}

export const reviews: Review[] = reviewsData;

// Reviews this short are used to pad out the contact page block.
const SHORT_REVIEW_MAX = 130;

interface SelectOptions {
  tag: string;
  count?: number;
  town?: string;
  // Names shown first, in this order, before any tag matching.
  lead?: string[];
  includeShort?: boolean;
}

// Selection order: lead names, town match, page tag, short reviews (if asked),
// then the "location" and "home" tags as fallbacks. No review appears twice.
export function selectReviews({
  tag,
  count = 3,
  town,
  lead = [],
  includeShort = false,
}: SelectOptions): Review[] {
  const picked: Review[] = [];
  const add = (list: Review[]) => {
    for (const r of list) {
      if (picked.length >= count) return;
      if (!picked.includes(r)) picked.push(r);
    }
  };

  add(lead.map((name) => findReview(name)));
  if (town) {
    const t = town.toLowerCase();
    add(reviews.filter((r) => r.town?.toLowerCase() === t));
  }
  add(reviews.filter((r) => r.tags.includes(tag)));
  if (includeShort) add(reviews.filter((r) => r.text.length <= SHORT_REVIEW_MAX));
  add(reviews.filter((r) => r.tags.includes("location")));
  add(reviews.filter((r) => r.tags.includes("home")));
  return picked;
}

export function findReview(name: string): Review {
  const review = reviews.find((r) => r.name === name);
  if (!review) throw new Error(`Unknown reviewer "${name}" in reviews.json`);
  return review;
}

const PREVIEW_CHARS = 280;

// Split a long review into a visible head and a collapsible tail, cutting at
// the end of a sentence near PREVIEW_CHARS. Short reviews have no tail.
export function splitReview(text: string): { head: string; tail: string } {
  if (text.length <= PREVIEW_CHARS + 40) return { head: text, tail: "" };
  const ends = [...text.matchAll(/[.!?…](?=\s)/g)].map((m) => m.index! + 1);
  const before = ends.filter((i) => i <= PREVIEW_CHARS);
  const cut = before.length ? before[before.length - 1] : ends[0];
  if (!cut || cut >= text.length) return { head: text, tail: "" };
  return { head: text.slice(0, cut), tail: text.slice(cut) };
}
