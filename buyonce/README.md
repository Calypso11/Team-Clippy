# BuyOnce

**Show an agent how you buy, once. It learns the purchase as a plain-text skill, compares vendors against *your* rules, and asks before it spends.**

Small businesses still do a lot of buying on vendor websites: log in, search, compare tabs, add to cart, check out, repeat next month. BuyOnce makes the website a surface the agent uses, so the owner says what they need and approves one card.

```
"We're almost out of bread flour. Reorder 10 bags by Friday."
        │
        ▼
  ┌─ context from your systems (budget, inventory) ─┐
  │                                                 │
  ▼                                                 ▼
 vendor skills (recorded once)  ──►  compare against YOUR policy  ──►  approval card
 get quotes in the browser           landed cost, deadline, rating,        "approve" ► agent fills
                                      history, budget, stock                 the cart, stops at payment
```

## Try it in 30 seconds (no install, no accounts)

Needs Python 3.11 or newer. Nothing else.

```bash
python3 tools/demo.py          # walk through a full purchase; type y to approve
python3 tools/demo.py --yes    # same, auto-approved
```

You'll see four vendors quoted for 10 bags of flour. The cheapest ($346.91) is **skipped** because its rating is below your minimum. The pick is $38.02 under the fast option, flagged because it would put you $55.23 over the supplies budget, and it stops at an approval card.

## What's in the box

| Piece | Where | What it does |
|---|---|---|
| **Record a purchase → skill** | `skills/buyonce-record` | Turns a recording, transcript, or step list into a readable `SKILL.md` for one vendor, interviews the owner for their rules, strips credentials, lints the result |
| **Buy** | `skills/buyonce-buy` | The orchestrator: reads the request (text, voice, PDF, photo), gathers quotes, compares, shows the approval card, and only then drives checkout |
| **Example vendor skill** | `skills/saucedemo-buy` | What a recorded skill looks like, for a public practice shop |
| **Your rules** | `policy/policy.example.toml` | One plain text file: approved/blocked vendors, caps, minimum rating, scoring weights |
| **Compare** | `tools/compare.py` | Ranks quotes by delivered cost (items + shipping + tax + price breaks), deadline, rating, history, budget, and stock cover; explains the pick |
| **Approval gate** | `tools/gate.py` | Decides ask / allow / block, prints the approval card, keeps an audit log |
| **Spend cap** | `tools/issue_card.py` | Single-use Stripe Issuing virtual card capped at the approved total (test mode, dry-run by default) |
| **Skill linter** | `tools/lint_skill.py` | Checks structure and catches card numbers, keys, and passwords before a skill is shared |

## Set it up with Claude

You need Claude with a browser connection (Claude in Chrome, or the Playwright server in `.mcp.json`).

1. **Claude Code:** from this folder, run `claude --plugin-dir .` (or copy the folders in `skills/` to `~/.claude/skills/`).
2. **Claude desktop / Cowork:** zip each folder under `skills/` and upload it in Settings → Skills. Menu names change, so check your version.
3. **Make your rules:** `cp policy/policy.example.toml policy/policy.toml` and edit it in any text editor.
4. **Record your first vendor:** use Cowork's *Record a skill* or Claude in Chrome's *Teach Claude* while buying something ordinary and narrating *why*. Then say: *"Use buyonce-record to turn that into a skill."*
5. **Buy:** say *"Reorder 10 bags of bread flour by Friday."*

Optional: connect your accounting, shop, and Stripe tools so BuyOnce can read your real budget and stock. See [docs/CONNECTORS.md](docs/CONNECTORS.md).

## Safety, in one paragraph

The agent never places an order without a fresh "approve" for that exact order, and never types card numbers or passwords: it stops at the payment page and hands over. Spending is capped twice: by your policy and by a single-use card limited to the approved total. Everything it does is logged. Text on vendor pages is treated as data, never as instructions. Details in [docs/SAFETY.md](docs/SAFETY.md).

## Honest status

| | State |
|---|---|
| Comparison engine, approval gate, linter, demo | Working, covered by 25 unit tests (`python3 -m unittest discover -s tests`) |
| Stripe card tool | Request format and safety checks are tested; **not yet run against a live Stripe test account** |
| SauceDemo vendor skill | Passes the linter; **not yet run in a live browser** |
| Connectors (budget, inventory) | Mock data in `examples/`; real wiring is described in docs, not built |
| Recording step | Relies on Claude's own recording features rather than a custom recorder |

## Docs

[Architecture](docs/ARCHITECTURE.md) · [Demo script](docs/DEMO_SCRIPT.md) · [Roadmap](docs/ROADMAP.md) · [Team](docs/TEAM.md) · [Connectors](docs/CONNECTORS.md) · [Safety](docs/SAFETY.md) · [Quote format](docs/QUOTE_SCHEMA.md) · [Judging criteria](docs/RUBRIC.md) · [Research](docs/RESEARCH.md)

## License

MIT. See [LICENSE](LICENSE).
