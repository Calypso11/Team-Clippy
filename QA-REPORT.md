# QA Report — Clippy 2.0

QA by Agent 5. Each run does: `npx tsc --noEmit`, `npx vitest run`, `npm run build`, `npx playwright test`
(real @real tests run once, on the desktop project only, against the dev server on port 3000).

## Runs

| Time (PDT) | tsc | vitest | build | playwright | Notes |
| --- | --- | --- | --- | --- | --- |
| 13:56 | PASS | FAIL (lib tests 65/65 pass; e2e specs are loaded by vitest, see bug 1) | PASS | PASS (27 passed, 3 skipped) | @real: list, cafe invoice (5 items, $358.12/mo), not-an-invoice all pass |

## Open bugs

### 1. vitest runs the Playwright files and fails
- **Agent:** whoever owns vitest/tooling config (Agent 1 set up the project). Needs a new file `vitest.config.ts`.
- **File:** missing `vitest.config.ts`
- **Steps:** `npx vitest run`
- **Expected:** only `lib/**/*.test.ts` run; all pass.
- **Actual:** vitest also loads `e2e/*.spec.ts` and fails with "Playwright Test did not expect test() to be called here" (3 failed files). Fix: `export default defineConfig({ test: { exclude: ["e2e/**", "node_modules/**"] } })`. Workaround: `npx vitest run --exclude 'e2e/**'` (65/65 pass).

### 2. Lids are priced "per cup"
- **Agent:** 1 · **File:** `lib/units.ts` (`unitLabel`, line 32)
- **Steps:** "See a real example" or upload `samples/invoice-cafe.png`; look at "12 oz Hot Cup Lids, Black Sip-Thru".
- **Expected:** "$0.071 per lid".
- **Actual:** "$0.071 per cup". `EACH_WORDS` is checked in order and "cup" matches first in "Hot Cup Lids". Should pick the last matching word in the name (the noun), or check "lid" before "cup".

### 3. "You already pay good prices" when the owner gave no prices
- **Agent:** 3 · **File:** `lib/suggest.ts` (`GOOD_PRICES_TIP`)
- **Steps:** type "1000 12 oz paper hot cups" (no price) and submit.
- **Expected:** no "good prices" claim, because Clippy does not know what the owner pays.
- **Actual:** the speech bubble says "Great news: you already pay good prices for these items." The UI headline (Agent 5) now says "Here are the best prices Clippy found" in this case; the suggestion text still claims good prices.

## Fixed by Agent 5
- Submit button screenshot looked disabled during a colour transition → removed the transition.
- Big headline wrapped badly on phones → smaller text on mobile.
- No-price list showed "You already pay good prices" and "Not on invoice" → now "Here are the best prices Clippy found" and "Not given".
