import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");

const inventoryPath =
  "docs/design-system/audits/ui-react-export-inventory.json";
const supportPolicyPath = "docs/design-system/ui-react-support-policy.json";
const jsonOutputPath =
  "docs/design-system/audits/ui-react-monitor-evidence-matrix.json";
const markdownOutputPath =
  "docs/design-system/ui-react-monitor-evidence-matrix.md";

const familyPlans = {
  "components/animated-check": {
    owner: "design-system-interactions",
    riskLevel: "medium",
    userValue: "Animated state feedback for small success/completion moments.",
    evidence: [
      "reduced-motion behavior",
      "animation timing/snapshot test",
      "packed render smoke",
    ],
    qa: ["default", "reduced motion", "theme contrast"],
    stableDecision:
      "Promote only if motion is tokenized and reduced-motion behavior is documented.",
  },
  "components/autocomplete": {
    owner: "design-system-forms",
    riskLevel: "high",
    userValue:
      "Combobox/search suggestion patterns for product forms and command surfaces.",
    evidence: [
      "keyboard navigation",
      "filter behavior",
      "empty/loading states",
      "Base UI type policy",
      "mobile viewport QA",
    ],
    qa: [
      "mouse",
      "keyboard",
      "screen reader labels",
      "mobile popover",
      "no-results state",
    ],
    stableDecision:
      "Promote only after focused interaction tests and browser evidence cover the combobox contract.",
    status: "partial-evidence-recorded",
    evidenceReference: "docs/design-system/ui-react-forms-evidence.md",
  },
  "components/calendar": {
    owner: "design-system-forms",
    riskLevel: "high",
    userValue: "Date picking and calendar display patterns.",
    evidence: [
      "date-fns/react-day-picker dependency policy",
      "keyboard navigation",
      "locale/date boundary tests",
      "mobile viewport QA",
    ],
    qa: ["single month", "keyboard", "disabled dates", "mobile", "light/dark"],
    stableDecision:
      "Promote only with dependency pin policy and date interaction evidence.",
    status: "partial-evidence-recorded",
    evidenceReference: "docs/design-system/ui-react-forms-evidence.md",
  },
  "components/card": {
    owner: "design-system-surfaces",
    riskLevel: "medium",
    userValue: "Cursor-follow/card affordance helpers used by rich cards.",
    evidence: [
      "pointer behavior",
      "reduced-motion fallback",
      "touch/no-pointer fallback",
    ],
    qa: ["desktop pointer", "touch viewport", "reduced motion"],
    stableDecision:
      "Keep core Card stable; promote cursor helpers only if documented as an intentional card interaction API.",
  },
  "components/carousel": {
    owner: "design-system-media",
    riskLevel: "high",
    userValue: "Carousel composition and controls for galleries/content rails.",
    evidence: [
      "Embla dependency policy",
      "keyboard controls",
      "loop/disabled state tests",
      "mobile swipe QA",
    ],
    qa: [
      "previous/next",
      "keyboard",
      "mobile swipe",
      "short item count",
      "RTL/focus if supported",
    ],
    stableDecision:
      "Promote only after gesture, focus, and dependency behavior are locked.",
  },
  "components/copy-button": {
    owner: "design-system-feedback",
    riskLevel: "medium",
    userValue: "Clipboard action with feedback states.",
    evidence: [
      "clipboard success/failure tests",
      "aria-live feedback",
      "permission failure behavior",
    ],
    qa: ["success", "failure", "keyboard", "screen reader label"],
    stableDecision:
      "Promote if clipboard failure and feedback semantics are documented.",
  },
  "components/destination-link": {
    owner: "design-system-navigation",
    riskLevel: "medium",
    userValue: "External/internal destination indicator and link treatment.",
    evidence: [
      "routing/link semantics",
      "icon override policy",
      "accessible name behavior",
    ],
    qa: ["internal", "external", "new tab", "custom icon", "keyboard"],
    stableDecision:
      "Promote if destination semantics and icon customization are documented.",
  },
  "components/input-otp": {
    owner: "design-system-forms",
    riskLevel: "high",
    userValue: "One-time-password segmented input.",
    evidence: [
      "input-otp dependency policy",
      "paste behavior",
      "mobile numeric keyboard",
      "error/disabled states",
    ],
    qa: ["paste full code", "backspace", "mobile", "disabled", "invalid state"],
    stableDecision:
      "Promote only with dependency policy and mobile/paste evidence.",
    status: "partial-evidence-recorded",
    evidenceReference: "docs/design-system/ui-react-forms-evidence.md",
  },
  "components/load-more-trigger": {
    owner: "design-system-data-display",
    riskLevel: "medium",
    userValue: "Incremental pagination/load-more affordance.",
    evidence: [
      "loading/disabled contract",
      "intersection/manual trigger behavior",
      "empty/end state",
    ],
    qa: ["idle", "loading", "end reached", "keyboard"],
    stableDecision:
      "Promote if loading state model and pagination semantics are documented.",
  },
  "components/marquee": {
    owner: "design-system-motion",
    riskLevel: "medium",
    userValue: "Ambient moving content strip.",
    evidence: [
      "reduced-motion fallback",
      "overflow behavior",
      "performance sanity",
    ],
    qa: ["default", "reduced motion", "long content", "mobile"],
    stableDecision:
      "Promote only if reduced-motion and performance constraints are explicit.",
  },
  "components/panel-setting-button": {
    owner: "design-system-settings",
    riskLevel: "medium",
    userValue: "Panel-setting affordance used by configuration surfaces.",
    evidence: [
      "button semantics",
      "icon override policy",
      "compact hit target QA",
    ],
    qa: ["default", "disabled", "keyboard", "mobile hit target"],
    stableDecision:
      "Promote if it is generalized beyond one product setting surface.",
  },
  "components/portal-container": {
    owner: "design-system-infrastructure",
    riskLevel: "high",
    userValue: "Shared portal target management for overlays.",
    evidence: [
      "SSR/client behavior",
      "nested provider behavior",
      "overlay integration tests",
    ],
    qa: ["dialog", "popover", "nested provider", "missing container"],
    stableDecision:
      "Promote only if portal ownership and SSR constraints are documented.",
  },
  "components/progressive-blur": {
    owner: "design-system-surfaces",
    riskLevel: "medium",
    userValue: "Edge blur affordance for scroll/media surfaces.",
    evidence: ["CSS support/fallback", "performance sanity", "theme contrast"],
    qa: ["top", "bottom", "light/dark", "mobile"],
    stableDecision:
      "Promote if CSS fallback and supported positions are documented.",
  },
  "components/text-ticker": {
    owner: "design-system-motion",
    riskLevel: "medium",
    userValue: "Ticker-style text motion for dynamic labels.",
    evidence: [
      "reduced-motion fallback",
      "content change behavior",
      "layout stability",
    ],
    qa: ["short", "long", "changed text", "reduced motion"],
    stableDecision:
      "Promote only with reduced-motion and layout stability evidence.",
  },
  "hooks/use-extract-color": {
    owner: "design-system-media",
    riskLevel: "high",
    userValue: "React hook for deriving dominant/tint colors from images.",
    evidence: [
      "CORS/error behavior",
      "cache behavior",
      "loading states",
      "contrast cap policy",
    ],
    qa: ["same-origin", "cross-origin failure", "cached", "dark/light surface"],
    stableDecision:
      "Promote only if browser image-loading failures and cache semantics are documented.",
  },
  "lib/extract-color": {
    owner: "design-system-media",
    riskLevel: "high",
    userValue: "Lower-level color extraction utilities backing media theming.",
    evidence: [
      "algorithm determinism",
      "contrast caps",
      "cache key compatibility",
      "browser canvas/CORS behavior",
    ],
    qa: ["fixture images", "transparent image", "dark image", "CORS failure"],
    stableDecision:
      "Prefer keeping low-level utilities monitor/internal unless a stable color-extraction API is intentionally designed.",
  },
};

function readJson(relativePath) {
  return readFile(resolve(repositoryRoot, relativePath), "utf8").then(
    JSON.parse,
  );
}

function collectMonitorGroups(inventory) {
  return inventory.rootExports
    .map((group) => {
      const symbols = [...group.values, ...group.types].filter(
        (entry) => entry.proposedTier === "monitor-high-risk",
      );
      return {
        source: group.source,
        family: group.source.replace(/^\.\//, ""),
        symbols: symbols
          .map((entry) => entry.name)
          .sort((a, b) => a.localeCompare(b)),
        valueCount: group.values.filter(
          (entry) => entry.proposedTier === "monitor-high-risk",
        ).length,
        typeCount: group.types.filter(
          (entry) => entry.proposedTier === "monitor-high-risk",
        ).length,
      };
    })
    .filter((group) => group.symbols.length > 0)
    .sort((a, b) => a.family.localeCompare(b.family));
}

function buildRows(monitorGroups) {
  return monitorGroups.map((group) => {
    const plan = familyPlans[group.family];
    if (!plan)
      throw new Error(`Missing monitor evidence plan for ${group.family}`);
    return {
      ...group,
      symbolCount: group.symbols.length,
      owner: plan.owner,
      riskLevel: plan.riskLevel,
      userValue: plan.userValue,
      requiredEvidence: plan.evidence,
      qaMatrix: plan.qa,
      stableDecision: plan.stableDecision,
      status: plan.status ?? "blocked-until-evidence-recorded",
      ...(plan.evidenceReference
        ? { evidenceReference: plan.evidenceReference }
        : {}),
    };
  });
}

function summarize(rows) {
  const byRisk = {};
  const byOwner = {};
  for (const row of rows) {
    byRisk[row.riskLevel] = (byRisk[row.riskLevel] ?? 0) + 1;
    byOwner[row.owner] = (byOwner[row.owner] ?? 0) + 1;
  }
  return {
    monitorFamilies: rows.length,
    monitorSymbols: rows.reduce((total, row) => total + row.symbolCount, 0),
    byRisk,
    byOwner,
    highRiskFamilies: rows
      .filter((row) => row.riskLevel === "high")
      .map((row) => row.family),
  };
}

function renderMarkdown(matrix) {
  const p = [];
  p.push("# @atom63/ui-react Monitor-high-risk Evidence Matrix");
  p.push("");
  p.push("**Status:** generated stable-readiness artifact; no export changes.");
  p.push("");
  p.push(
    "**Source of truth:** `docs/design-system/audits/ui-react-export-inventory.json`, `docs/design-system/ui-react-support-policy.json`",
  );
  p.push("");
  p.push("## Summary");
  p.push("");
  p.push(`- Monitor families: **${matrix.summary.monitorFamilies}**.`);
  p.push(`- Monitor symbols/types: **${matrix.summary.monitorSymbols}**.`);
  p.push(
    `- High-risk families: **${matrix.summary.highRiskFamilies.length}** (${matrix.summary.highRiskFamilies.map((name) => `\`${name}\``).join(", ")}).`,
  );
  p.push("");
  p.push("## Evidence checklist by family");
  p.push("");
  p.push(
    "| Family | Risk | Owner lane | Symbols | Evidence status | Required evidence | QA matrix | Stable decision |",
  );
  p.push("| --- | --- | --- | ---: | --- | --- | --- | --- |");
  for (const row of matrix.rows) {
    const status = row.evidenceReference
      ? `[\`${row.status}\`](./${row.evidenceReference.replace("docs/design-system/", "")})`
      : `\`${row.status}\``;
    p.push(
      `| \`${row.family}\` | ${row.riskLevel} | \`${row.owner}\` | ${row.symbolCount} | ${status} | ${row.requiredEvidence.map((item) => `\`${item}\``).join("<br>")} | ${row.qaMatrix.map((item) => `\`${item}\``).join("<br>")} | ${row.stableDecision} |`,
    );
  }
  p.push("");
  p.push("## Symbol inventory");
  p.push("");
  for (const row of matrix.rows) {
    p.push(`### ${row.family}`);
    p.push("");
    p.push(`- Owner lane: \`${row.owner}\``);
    p.push(`- Risk: **${row.riskLevel}**`);
    p.push(`- User value: ${row.userValue}`);
    p.push(`- Evidence status: \`${row.status}\``);
    if (row.evidenceReference) {
      p.push(
        `- Evidence packet: [${row.evidenceReference}](./${row.evidenceReference.replace("docs/design-system/", "")})`,
      );
    }
    p.push("- Symbols:");
    for (const symbol of row.symbols) p.push(`  - \`${symbol}\``);
    p.push("");
  }
  p.push("## Stable/latest rule");
  p.push("");
  p.push(
    "A monitor family cannot become stable-root-supported until its owner lane records the required evidence, QA matrix, and a final stable decision. If evidence is missing, keep it importable during beta but treat it as monitor or move it behind a preview/subpath boundary before stable/latest.",
  );
  p.push("");
  p.push("## How to update");
  p.push("");
  p.push("```bash");
  p.push("pnpm check:ui-react-monitor-evidence --write");
  p.push("```");
  p.push("");
  p.push(
    "CI should run the same check without `--write` and fail if the generated JSON or Markdown drifts.",
  );
  p.push("");
  return `${p.join("\n")}\n`;
}

async function main() {
  const write = process.argv.includes("--write");
  const [inventory, supportPolicy] = await Promise.all([
    readJson(inventoryPath),
    readJson(supportPolicyPath),
  ]);

  const matrix = {
    schemaVersion: 1,
    inputs: [inventoryPath, supportPolicyPath],
    tier: "monitor-high-risk",
    policy: supportPolicy.tiers["monitor-high-risk"],
    summary: summarize(buildRows(collectMonitorGroups(inventory))),
    rows: buildRows(collectMonitorGroups(inventory)),
  };
  const json = await prettier.format(JSON.stringify(matrix), {
    parser: "json",
  });
  const markdown = await prettier.format(renderMarkdown(matrix), {
    parser: "markdown",
  });

  const existingJson = await readFile(
    resolve(repositoryRoot, jsonOutputPath),
    "utf8",
  ).catch(() => null);
  const existingMarkdown = await readFile(
    resolve(repositoryRoot, markdownOutputPath),
    "utf8",
  ).catch(() => null);

  if (write) {
    await Promise.all([
      writeFile(resolve(repositoryRoot, jsonOutputPath), json),
      writeFile(resolve(repositoryRoot, markdownOutputPath), markdown),
    ]);
    console.log(
      `Wrote @atom63/ui-react monitor evidence matrix -> ${jsonOutputPath}, ${markdownOutputPath}`,
    );
    return;
  }

  if (existingJson !== json || existingMarkdown !== markdown) {
    console.error(
      `@atom63/ui-react monitor evidence matrix is stale. Run: pnpm check:ui-react-monitor-evidence --write`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `@atom63/ui-react monitor evidence matrix is current (${jsonOutputPath}, ${markdownOutputPath})`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
