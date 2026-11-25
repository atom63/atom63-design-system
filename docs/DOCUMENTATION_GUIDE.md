# Documentation guide

Rules and templates for writing design system documentation pages. This guide ensures every page reflects personal design thinking rather than generic library reference.

## Purpose

This documentation site serves two jobs:

1. **Portfolio artifact** — demonstrate the ability to architect a scalable design system in both design and code. The documentation itself is the craft sample.
2. **System reference** — provide enough practical detail that a collaborator (or future self) can use the system correctly.

Job 1 sets the craft standard, but it does not turn every page into an architecture essay. A reference page should still be fast to scan, and a task page should still get the reader to a result.

## Voice and tone

### Be direct and opinionated
Write in first person when explaining decisions, alternatives, and tradeoffs. "I chose X because Y" is stronger than "X was chosen." Use neutral, authoritative language for reference facts and imperative language for tasks.

### Be specific, not comprehensive
One well-explained decision is worth more than ten prop descriptions. Don't document what the code already says — document what the code can't say.

### Avoid these patterns
- **Mirror voice**: "A button is a clickable element that triggers an action." This is what every library says. Skip it.
- **Exhaustive API tables**: Props are in the code and in TypeScript. A reader who needs the full API can check the types. Only surface props that carry a design decision.
- **Obvious import narration**: Don't explain syntax the reader can see. Show one canonical import when choosing the correct package or subpath is part of using the component safely.
- **Variant galleries without commentary**: Showing every variant is fine for a storybook. Here, only show variants that illustrate a design choice.

### Aim for this
- **Job-first**: Start a concept page with the decision or problem, a task page with the reader's goal, and a reference page with scope and authoritative facts.
- **Honest about tradeoffs**: If something is a compromise, say so. "I went with X. The downside is Y, but it's worth it because Z."
- **Concise**: If a section doesn't reveal thinking, cut it. Shorter pages that say something beat longer pages that describe everything.

## Choose the page's primary job

Every page should have one primary reader outcome. A page may contain supporting topic types, but they must not compete with its primary job.

| Archetype | Reader outcome | Typical structure |
|-----------|----------------|-------------------|
| Overview / concept | Understand a system or decision | Value promise → model → rationale → implications |
| Quickstart | Reach a first useful result | Outcome → prerequisites → shortest path → verify |
| How-to | Complete one real task | Goal → prerequisites → steps → result → related reference |
| Reference | Look up authoritative facts | Scope → stable facts grouped like the code → examples → related topics |
| Troubleshooting | Recover from a known failure | Symptom → cause → fix → verify |
| Migration | Move safely between contracts | Who is affected → before/after → steps → compatibility limits |
| Component guidance | Choose and use a component correctly | When to use → when not to use → curated examples → decisions → consumer obligations |
| Pattern | Solve a recurring product problem | Trigger → composition → rationale → alternatives |

Do not add an archetype merely to complete the set. Create troubleshooting or migration content only when a repeated failure or contract change gives it a real job.

## Copy craft

- **Opening:** State reader value and scope in one direct, present-tense sentence.
- **Voice:** Use neutral present tense for reference, imperative second person for tasks, and first-person singular only for explicit rationale or tradeoffs. Do not use organizational "we."
- **Guidance:** Prefer condition → recommendation → rationale: "When X, use Y because Z."
- **Alternatives:** Contrast related components by behavior, state model, or navigation outcome, not appearance alone.
- **Accessibility:** Name the observable consequence and the consumer action. State what the component cannot infer.
- **Responsive behavior:** Name the viewport or form factor, the exact behavior change, and any defined breakpoint, width, or target-size constraint.
- **Tasks:** Put the goal or condition before the action. Give each numbered step one action and an observable result.
- **Recovery:** Explain what happened, why it happened, and the exact action that restores a valid state. Show the valid form when useful.
- **Examples:** Keep examples curated, valid, and self-contained. Do not place hooks outside components or imply behavior that the example does not implement.
- **Headings:** Use sentence case. Write task headings as bare imperatives and concept headings as noun phrases.
- **Tables:** Use tables for genuine comparison or structured lookup across multiple attributes. Use lists for a single sequence or one-dimensional set.
- **Editing:** Remove filler or hedging only when the replacement is more specific; do not enforce a mechanical banned-word list.

## Page structures

The following templates are starting points for common page families, not universal outlines.

### Architecture pages

These carry the deepest narrative. They explain the system's shape and the reasoning behind it.

```
# [Topic]

[1-2 sentence thesis: what this layer/concept does and why it exists.]

## The problem

[What goes wrong without this. Concrete scenario, not abstract principle.]

## How it works

[Explain the mechanism. Diagrams welcome. Keep it to how a reader
would mentally model it, not implementation line-by-line.]

## Key decisions

[2-4 decisions, each as a subsection:]

### [Decision]

[What I chose, what I didn't, and why. Name the tradeoff.]

## What this enables

[Concrete outcomes. What can a consumer do now that they couldn't
before? What stays stable when things change?]
```

### Foundation pages (color, typography, motion, radius, effects)

Foundations are where design rationale matters most. These aren't token dumps — they're explanations of why the system looks and feels the way it does.

```
# [Foundation name]

[1-2 sentences: what role this foundation plays in the system's identity.]

## Design intent

[What feeling, quality, or constraint drives these choices.
Example for typography: "The type scale is designed for dense
information interfaces, not marketing pages. That's why..."]

## How the scale works

[The structure — steps, mappings, layers. Live swatches/previews
where they help, but don't let them dominate.]

## Decisions worth knowing

[2-3 specific choices with rationale:]

### [Decision]

[What, why, what I considered instead.]

## Usage guidance

[Short practical rules — when to reach for what. Table format is
fine here. Keep it to the choices that aren't obvious.]
```

### Component pages

Authored component pages extend the generated reference with selection guidance, rationale, and consumer obligations.

```
# [Component name]

[1 sentence: what this component is, positioned within the system —
not a dictionary definition.]

## When to use

[Name the specific product conditions that make this component the right choice.]

## Choose another component when

[Contrast the nearest alternatives by behavior or state model.]

## Curated example

[Show the smallest valid example that demonstrates the component's main job.]

## Design decisions

[The core of the page. 2-4 decisions, each brief:]

### [Decision]

[What I chose and why. Examples:
- Why this component uses Base UI instead of a custom implementation
- Why it has these specific variants and not others
- Why the API surface is shaped this way
- An accessibility choice that wasn't obvious
- A constraint I imposed and why]

## Anatomy

[Optional. Only if the component has meaningful internal structure
worth explaining. A simple diagram or labeled preview, not a
parts-list for its own sake.]

## Additional examples

[A few examples, chosen to illustrate decisions — not to be
exhaustive. Each example should have a short note explaining
what it demonstrates.]

## Accessibility

[Only non-obvious accessibility details. Skip "uses semantic HTML"
and "has keyboard support" — that's baseline. Explain the observable
consequence and anything the consumer must supply.]
```

### Pattern pages

Patterns document solutions to recurring product-level problems. They're higher-level than components.

```
# [Pattern name]

[What product scenario this pattern addresses.]

## When to use

[Concrete triggers — not "when you need an empty state" but
"when a collection view has zero items and the user needs to
understand why and what to do next."]

## How it works

[The composition: which components, what layout logic, what
content rules.]

## Design rationale

[Why this pattern looks and behaves the way it does.
What I tried that didn't work.]
```

## Page audit rules

Before publishing any page, verify:

- [ ] The page has one primary reader outcome
- [ ] The opening states reader value and scope instead of restating the title
- [ ] Task prerequisites appear before steps, followed by a verifiable result
- [ ] The main path stays visible; only alternatives and edge cases are disclosed
- [ ] Headings use sentence case and name a decision, question, or goal
- [ ] The page links to the next likely task, concept, or alternative
- [ ] Non-obvious accessibility obligations owned by the consumer are explicit
- [ ] Factual claims have been checked against a source path, symbol, or generated inventory
- [ ] Volatile counts and statuses are generated rather than copied into prose
- [ ] The page says something that shadcn/Radix docs don't
- [ ] At least one design decision is explained with a tradeoff
- [ ] No section exists purely to be comprehensive — every section earns its space
- [ ] First-person voice is reserved for decisions, not reference facts or task steps
- [ ] Examples shown are chosen for what they illustrate, not for coverage
- [ ] The page could stand alone as a writing sample in a portfolio review

## Tone calibration

**Too casual**: "So yeah, I just went with Base UI because it seemed cool."

**Too formal**: "The architectural decision was made to utilize Base UI's unstyled primitive layer in order to facilitate maximum compositional flexibility."

**Right**: "I built on Base UI instead of Radix because I wanted unstyled primitives I could map directly to my token system. Radix bundles its own styling opinions — subtle ones, but they fight the token layer. Base UI gives me a behavior contract and nothing else."

## Component documentation boundary

The public design-system site owns curated guidance, representative previews, canonical imports, root-export visibility, and related-component navigation. Storybook and TypeScript remain the exhaustive state and prop reference. Authored component pages should add judgment and consumer obligations without duplicating either source.

## Maintenance boundaries

Generate facts that already exist in code or the filesystem. Author the judgment that code cannot supply. Props, exports, versions, route inventories, release entries, and implementation status belong to their executable source. Selection guidance, rationale, tradeoffs, accessibility consequences, and migrations belong in MDX.

| Change | Authority | Minimum focused check |
|--------|-----------|-----------------------|
| Add or rename an MDX page | `src/pages` discovery and `doc-taxonomy.ts` ordering | Design-system build, page tests, and LLM inventory tests |
| Add or change a component family or root export | TypeScript barrel and component catalog | Component-catalog test and representative Storybook story |
| Change curated guidance | Authored MDX | Design-system build and a source/API comparison |
| Change a non-ignored versioned package's public API, behavior, styles, exports, or runtime dependencies | Package source and a Changeset | Package test/typecheck and a changeset |
| Change changelog rendering | `.changeset` files, package changelogs, and the changelog plugin | Changelog-data test |
| Change agent-readable output | `llms-txt` generator and per-page Markdown twins | LLM inventory and twin-content tests |

Do not require documentation for app-only work, tests, or internal refactors that leave the public contract unchanged. Do not copy volatile counts into prose when a registry can own the inventory; omit the count or render it from that registry.
