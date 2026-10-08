---
'@atom63/figma': minor
---

Generates the Button component set, bound to the token variables. `atom63-figma components` writes use_figma scripts from the generated component model, each under the 50,000-character limit, plus read-only check scripts. A token at an opacity (`color-mix(…)`) binds through a derived variable in a `Component` collection, whose Dev Mode code syntax is the CSS expression, because Figma gives a bound paint the variable's alpha; a bound paint verifies only when Figma's stored color matches what the variable resolves to, so a rerun repairs a stale one.
