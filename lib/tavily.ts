import { tavily } from "@tavily/core";

export interface SearchHit { url: string; title: string; content: string }
export interface Page { url: string; title: string; text: string }

// Domains that never give a usable store price.
export const SKIP_DOMAINS = [
  "reddit.com", "youtube.com", "pinterest.com", "facebook.com", "instagram.com", "tiktok.com",
  "quora.com", "wikipedia.org", "medium.com", "twitter.com", "x.com", "linkedin.com",
  "yelp.com", "tripadvisor.com", "nytimes.com", "seriouseats.com", "kingarthurbaking.com",
  "allrecipes.com", "foodnetwork.com", "thekitchn.com", "bonappetit.com", "consumerreports.org",
  "wirecutter.com", "goodhousekeeping.com", "bhg.com", "forbes.com", "businessinsider.com",
  "alibaba.com", "made-in-china.com", "indiamart.com", "ebay.com", "etsy.com",
];

const NOT_A_STORE = /\b(blog|article|articles|news|review|reviews|best\s+\d*|top\s+\d+|vs\.?|recipe|recipes|how\s+to|guide|forum)\b/i;
const NOT_A_STORE_PATH = /\/(blog|blogs|news|article|articles|reviews?|recipes?|guides?|forum|wiki)(\/|$)/i;

const MAX_RESULTS = 6;
const PAGE_CHARS = 6000;

const searchCache = new Map<string, SearchHit[]>();
const pageCache = new Map<string, Page>();

let client: ReturnType<typeof tavily> | null = null;
function tvly() {
  if (!client) client = tavily({ apiKey: process.env.TAVILY_API_KEY! });
  return client;
}

function host(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

export function isSkipped(url: string): boolean {
  const h = host(url);
  return !h || SKIP_DOMAINS.some((d) => h === d || h.endsWith("." + d));
}

export function looksLikeStore(hit: SearchHit): boolean {
  if (isSkipped(hit.url)) return false;
  if (NOT_A_STORE.test(hit.title)) return false;
  try { if (NOT_A_STORE_PATH.test(new URL(hit.url).pathname)) return false; } catch { return false; }
  return true;
}

export async function searchItem(query: string): Promise<SearchHit[]> {
  const cached = searchCache.get(query);
  if (cached) return cached;
  const queries = [`${query} price`, `${query} wholesale buy`];
  const responses = await Promise.all(
    queries.map((q) =>
      tvly().search(q, { maxResults: 5, excludeDomains: SKIP_DOMAINS }).catch((err: Error) => {
        console.error(`tavily search failed for "${q}":`, err.message);
        return null;
      }),
    ),
  );
  if (responses.every((r) => r === null)) return []; // don't cache failures
  const seen = new Set<string>();
  const hits: SearchHit[] = [];
  for (const r of responses.flatMap((res) => res?.results ?? [])) {
    const hit = { url: r.url, title: r.title ?? "", content: r.content ?? "" };
    if (seen.has(hit.url) || !looksLikeStore(hit)) continue;
    seen.add(hit.url);
    hits.push(hit);
  }
  const result = hits.slice(0, MAX_RESULTS);
  searchCache.set(query, result);
  return result;
}

// Keep a window of the page around the first "$" so the price survives the cut.
export function trimAroundPrice(text: string, max = PAGE_CHARS): string {
  if (text.length <= max) return text;
  const i = text.indexOf("$");
  if (i < 0) return text.slice(0, max);
  const start = Math.max(0, Math.min(i - Math.floor(max / 3), text.length - max));
  return text.slice(start, start + max);
}

export async function extractPages(hits: SearchHit[]): Promise<Page[]> {
  const todo = hits.filter((h) => !pageCache.has(h.url));
  if (todo.length) {
    const res = await tvly().extract(todo.map((h) => h.url)).catch((err: Error) => {
      console.error("tavily extract failed:", err.message);
      return { results: [] as { url: string; title: string | null; rawContent: string }[] };
    });
    const byUrl = new Map(res.results.map((r) => [r.url, r]));
    for (const h of todo) {
      const raw = byUrl.get(h.url)?.rawContent ?? "";
      // Fall back to the search snippet when extract fails or the page has no price.
      const text = raw.includes("$") ? trimAroundPrice(raw) : raw ? `${h.content}\n\n${trimAroundPrice(raw)}` : h.content;
      pageCache.set(h.url, { url: h.url, title: h.title, text });
    }
  }
  return hits.map((h) => pageCache.get(h.url)!);
}
