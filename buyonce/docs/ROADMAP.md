# Roadmap

The four steps, mapped to what exists in this repo.

| # | Step | Owner | Status | Where |
|---|---|---|---|---|
| 1 | **Intake and price comparison**: request by text, voice, or PDF → ranked results | S | Comparison engine done and tested. Voice/PDF/photo intake is handled by Claude itself and described in the skill | `tools/compare.py`, `skills/buyonce-buy` |
| 2 | **Record a purchasing workflow** (human doing it) | S | Skill and template done. Needs a first real recording | `skills/buyonce-record`, `templates/` |
| 2.1 | → Create a skill file, text-forward | S | Template, linter, and a reference example done. **Next: record SauceDemo and replace the draft** | `skills/saucedemo-buy` |
| 3 | **Make it more user-friendly** | JK | Not started. See ideas below | n/a |
| 4 | **Execute the purchase** (agent doing it) | PK | Orchestration written; gate and card cap tested. **Not yet run against a live site** | `skills/buyonce-buy`, `tools/gate.py`, `tools/issue_card.py` |

## Next up (in order)
1. Record the SauceDemo purchase with Cowork's Record a skill or Claude in Chrome, compare against `skills/saucedemo-buy`, and fix the draft. (S)
2. Run the quote phase of that skill in a browser, then cart and checkout. Fix drift. (PK)
3. Record a **second** vendor so the comparison is across two real sites. (S)
4. Create a Stripe test account with Issuing and run `issue_card.py --execute` once. (PK)
5. Wire one real connector for budget (accounting) and one for stock. (PK)
6. Make the approval card pretty: a one-screen view the owner can approve from a phone. (JK)

## Ideas for step 3 (user-friendliness)
- Approval as a single card with Approve / Change / Cancel, readable on a phone.
- "Why" lines in the owner's own words (tone setting in the policy).
- A weekly digest: what was bought, what it saved against the cheapest option, and what's about to run out.
- A guided first-run: three questions that write `policy.toml`, so nobody edits TOML by hand.
- Show the skill as a readable checklist with an "edit this step" button.

## Later
- A skill reliability score (how many runs worked) and self-repair when a vendor changes its site.
- Reorder prediction from stock and sales.
- Hand payment to the owner's password manager instead of a manual step.
- Live Stripe Issuing, behind a clearly separate switch from test mode.
