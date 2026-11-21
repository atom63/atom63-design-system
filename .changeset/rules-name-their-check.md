---
'@atom63/cli': patch
---

Every rule in `atom63 rules` and the AGENTS.md block now says how it is enforced or why it is not. A rule carries `check` (the `check:craft` rules), `checkedBy` (another check, as a sentence) or `unchecked` (why no check can enforce it), and the block prints that sentence after the rule's reason. The tokens rule now also asks for text tokens on text and fill tokens on backgrounds, which `check:craft` enforces as `token-role`. `ruleEnforcementErrors()` from `@atom63/cli/agents-md` lists rules that say neither, and `check:agents-md` fails on any.
