// Usage:
//   npx tsx --env-file=.env.local scripts/test-research.ts --search "bread flour 50 lb bag"
//   npx tsx --env-file=.env.local scripts/test-research.ts "bread flour 50 lb bag" 50 lb
//   npx tsx --env-file=.env.local scripts/test-research.ts --all
import { extractPages, searchItem } from "../lib/tavily";

async function runSearch(query: string) {
  const t = Date.now();
  const hits = await searchItem(query);
  const pages = await extractPages(hits);
  for (const p of pages) console.log(`${p.text.includes("$") ? "$  " : "-  "} ${p.url}`);
  const withPrice = pages.filter((p) => p.text.includes("$")).length;
  console.log(`${withPrice}/${pages.length} pages with "$" in ${((Date.now() - t) / 1000).toFixed(1)} s`);
  return withPrice;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--search") {
    const n = await runSearch(args[1]);
    process.exit(n >= 3 ? 0 : 1);
  }
  console.error("unknown args");
  process.exit(1);
}

main();
