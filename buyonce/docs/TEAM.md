# Team

Replace the placeholders with real names, and keep this file honest: judges look for who did what.

| Initials | Name | Role | Owns | Visible work |
|---|---|---|---|---|
| S | _name_ | Capture + skills | Steps 1 and 2: intake, comparison, recording → skill | `skills/buyonce-record`, `templates/`, `tools/compare.py`, `skills/saucedemo-buy` |
| JK | _name_ | Experience | Step 3: making it usable by a non-technical owner | approval card, first-run, demo flow (`docs/DEMO_SCRIPT.md`) |
| PK | _name_ | Execution + safety | Step 4: agent runs the purchase safely | `skills/buyonce-buy`, `tools/gate.py`, `tools/issue_card.py`, `docs/SAFETY.md` |
| _name_ | _name_ | Business + pitch | Customer research, the story, judging-criteria fit | `docs/RUBRIC.md`, `docs/RESEARCH.md`, the pitch |

## How we work together
- One shared policy file and one quote format (`docs/QUOTE_SCHEMA.md`) are the contract between roles. Change them together.
- Every change comes with a test or an example. `python3 -m unittest discover -s tests` must pass.
- Skills are linted before they're shared: `python3 tools/lint_skill.py skills/`.
- Short written notes in `docs/` for decisions, so the pitch tells a true story about how we worked.

## Decisions log
| Date | Decision | Why |
|---|---|---|
| 2026-10-25 | Build on existing record-a-skill features instead of a custom recorder | Faster; shows judgment about what's already solved. We add the buying logic on top |
| 2026-10-25 | Approval by default; auto-approve is opt-in | A purchasing agent that surprises its owner loses trust on day one |
| 2026-10-25 | Agent stops at the payment page and never handles card details | Smaller blast radius and nothing sensitive in logs or skill files |
