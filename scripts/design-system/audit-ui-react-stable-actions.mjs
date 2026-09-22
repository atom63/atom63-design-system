import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");

const inventoryPath =
  "docs/design-system/audits/ui-react-export-inventory.json";
const supportPolicyPath = "docs/design-system/ui-react-support-policy.json";
const jsonOutputPath =
  "docs/design-system/audits/ui-react-stable-action-matrix.json";
const markdownOutputPath =
  "docs/design-system/ui-react-stable-action-matrix.md";

const tierActions = {
  "beta-supported-core": {
    action: "keep-stable-candidate",
    priority: "P2",
    stableDecision: "Keep in root for stable after standard QA.",
    requiredEvidence: [
      "visual QA for representative states",
      "external packed-consumer smoke",
      "dependency and public type compatibility review",
    ],
  },
  "beta-supported-composition-conditional": {
    action: "document-before-stable",
    priority: "P1",
    stableDecision:
      "Keep in root only if composition docs and focused coverage remain green; otherwise downgrade to monitor before stable.",
    requiredEvidence: [
      "composition usage docs or authored guidance",
      "focused interaction tests",
      "packed-consumer import/render smoke for a representative path",
    ],
  },
  "monitor-high-risk": {
    action: "assign-owner-and-evidence",
    priority: "P0",
    stableDecision:
      "Do not promise stable compatibility until an owner, adopter use case, and specific browser/interaction evidence are recorded.",
    requiredEvidence: [
      "named owner",
      "adopter use case or internal retention rationale",
      "browser/interaction evidence where relevant",
      "migration policy if kept public",
    ],
  },
  "preview-experimental-candidate": {
    action: "move-to-preview-or-approve",
    priority: "P0",
    stableDecision:
      "Move behind preview/experimental boundary, make private, or explicitly approve support before stable/latest.",
    requiredEvidence: [
      "YZ/design-engineering approval if kept in stable root",
      "migration notes if moved or removed",
      "preview boundary docs if retained publicly",
    ],
  },
};

function readJson(relativePath) {
  return readFile(resolve(repositoryRoot, relativePath), "utf8").then(
    JSON.parse,
  );
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function familyFromSource(source) {
  return source.replace(/^\.\//, "");
}

function sourceKind(source) {
  if (source.startsWith("./components/")) return "component-family";
  if (source.startsWith("./hooks/")) return "hook";
  if (source.startsWith("./lib/")) return "library-utility";
  if (source === "./conformance") return "conformance-evidence";
  return "module";
}

function addCount(target, key, amount = 1) {
  target[key] = (target[key] ?? 0) + amount;
}

function buildSourceRows(inventory, supportPolicy) {
  const rows = [];

  for (const group of inventory.rootExports) {
    const symbols = [
      ...group.values.map((entry) => ({ kind: "value", ...entry })),
      ...group.types.map((entry) => ({ kind: "type", ...entry })),
    ];
    const tierCounts = {};
    for (const symbol of symbols) addCount(tierCounts, symbol.proposedTier);
    const tiers = Object.entries(tierCounts)
      .sort(
        (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
      )
      .map(([tier]) => tier);
    const highestPriorityTier =
      tiers.find((tier) => tierActions[tier]?.priority === "P0") ?? tiers[0];
    const action = tierActions[highestPriorityTier];

    rows.push({
      source: group.source,
      family: familyFromSource(group.source),
      kind: sourceKind(group.source),
      totalExports: symbols.length,
      valueExports: group.values.length,
      typeExports: group.types.length,
      tierCounts,
      dominantTier: tiers[0],
      blockingTier: highestPriorityTier,
      recommendedAction: action.action,
      priority: action.priority,
      stableDecision: action.stableDecision,
      requiredEvidence: action.requiredEvidence,
      notableSymbols: symbols
        .filter((symbol) => symbol.proposedTier === highestPriorityTier)
        .map((symbol) => symbol.name)
        .slice(0, 12),
      policyNote: supportPolicy.tiers[highestPriorityTier]?.stableEligibility,
    });
  }

  return rows.sort(
    (left, right) =>
      left.priority.localeCompare(right.priority) ||
      left.recommendedAction.localeCompare(right.recommendedAction) ||
      left.family.localeCompare(right.family),
  );
}

function buildSubpathRows(inventory, supportPolicy) {
  const rows = [];

  for (const entry of inventory.packageExports) {
    let recommendedAction = "keep-import-path-stable";
    let priority = "P2";
    let stableDecision =
      "Keep public import path stable; treat removal/rename as an API change.";
    let policyNote = supportPolicy.subpathPolicy.css;

    if (entry.kind !== "css") {
      policyNote =
        supportPolicy.subpathPolicy[entry.subpath] ??
        "Root package API or public JavaScript subpath.";
      if (entry.subpath === "./preview") {
        recommendedAction = "keep-preview-labeled";
        priority = "P0";
        stableDecision =
          "Keep public only as a preview boundary; do not treat its symbols as stable root compatibility promises.";
      } else if (["./media", "./media/lightbox"].includes(entry.subpath)) {
        recommendedAction = "keep-preview-subpath-or-add-evidence";
        priority = "P0";
        stableDecision =
          "Do not promise stable compatibility without browser/media lifecycle evidence or preview labeling.";
      } else if (["./layout", "./theme"].includes(entry.subpath)) {
        recommendedAction = "document-subpath-contract";
        priority = "P1";
        stableDecision =
          "Keep public, but document supported high-level APIs versus monitored helpers before stable.";
      }
    }

    rows.push({
      subpath: entry.subpath,
      kind: entry.kind,
      target: entry.target,
      recommendedAction,
      priority,
      stableDecision,
      policyNote,
    });
  }

  return rows.sort(
    (left, right) =>
      left.priority.localeCompare(right.priority) ||
      left.kind.localeCompare(right.kind) ||
      left.subpath.localeCompare(right.subpath),
  );
}

function summarize(sourceRows, subpathRows) {
  const sourceActionCounts = {};
  const sourcePriorityCounts = {};
  const sourceTierCounts = {};
  const subpathActionCounts = {};
  const subpathPriorityCounts = {};

  for (const row of sourceRows) {
    addCount(sourceActionCounts, row.recommendedAction);
    addCount(sourcePriorityCounts, row.priority);
    for (const [tier, count] of Object.entries(row.tierCounts))
      addCount(sourceTierCounts, tier, count);
  }

  for (const row of subpathRows) {
    addCount(subpathActionCounts, row.recommendedAction);
    addCount(subpathPriorityCounts, row.priority);
  }

  return {
    sourceFamilies: sourceRows.length,
    sourceExports: sourceRows.reduce(
      (total, row) => total + row.totalExports,
      0,
    ),
    sourceTierCounts,
    sourceActionCounts,
    sourcePriorityCounts,
    packageSubpaths: subpathRows.length,
    subpathActionCounts,
    subpathPriorityCounts,
  };
}

function markdownTable(rows) {
  return rows
    .map(
      (row) =>
        `| \`${row.family}\` | ${row.priority} | \`${row.recommendedAction}\` | ${row.totalExports} | ${Object.entries(
          row.tierCounts,
        )
          .map(([tier, count]) => `\`${tier}\`: ${count}`)
          .join("<br>")} | ${row.stableDecision} |`,
    )
    .join("\n");
}

function subpathMarkdownTable(rows) {
  return rows
    .map(
      (row) =>
        `| \`${row.subpath}\` | ${row.kind} | ${row.priority} | \`${row.recommendedAction}\` | ${row.stableDecision} |`,
    )
    .join("\n");
}

function buildMarkdown(matrix) {
  const p0Sources = matrix.sourceActions.filter((row) => row.priority === "P0");
  const p1Sources = matrix.sourceActions.filter((row) => row.priority === "P1");
  const p0Subpaths = matrix.subpathActions.filter(
    (row) => row.priority === "P0",
  );
  const p1Subpaths = matrix.subpathActions.filter(
    (row) => row.priority === "P1",
  );

  return `# @atom63/ui-react Stable Promotion Action Matrix

**Status:** generated stable-readiness planning artifact; no export changes.

**Source of truth:** \`${matrix.inputs.join("`, `")}\`

## Summary

- Root export symbols: **${matrix.summary.sourceExports}** across **${matrix.summary.sourceFamilies}** source families.
- Package export-map subpaths: **${matrix.summary.packageSubpaths}**.
- P0 root/source families: **${matrix.summary.sourcePriorityCounts.P0 ?? 0}**.
- P1 root/source families: **${matrix.summary.sourcePriorityCounts.P1 ?? 0}**.
- P0 package subpaths: **${matrix.summary.subpathPriorityCounts.P0 ?? 0}**.
- P1 package subpaths: **${matrix.summary.subpathPriorityCounts.P1 ?? 0}**.

### Root export tier counts

${Object.entries(matrix.summary.sourceTierCounts)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([tier, count]) => `- \`${tier}\`: ${count}`)
  .join("\n")}

## P0: must resolve before stable/latest

| Family | Priority | Action | Exports | Tier mix | Stable decision |
| --- | --- | --- | ---: | --- | --- |
${markdownTable(p0Sources)}

### P0 public subpaths

| Subpath | Kind | Priority | Action | Stable decision |
| --- | --- | --- | --- | --- |
${subpathMarkdownTable(p0Subpaths)}

## P1: document or prove before stable/latest

| Family | Priority | Action | Exports | Tier mix | Stable decision |
| --- | --- | --- | ---: | --- | --- |
${markdownTable(p1Sources)}

### P1 public subpaths

| Subpath | Kind | Priority | Action | Stable decision |
| --- | --- | --- | --- | --- |
${subpathMarkdownTable(p1Subpaths)}

## P2: stable candidates after standard QA

P2 entries are not expanded here to keep the stable-readiness page focused. See the machine-readable JSON matrix for the full list:

\`docs/design-system/audits/ui-react-stable-action-matrix.json\`

## How to update

Run:

\`\`\`bash
pnpm check:ui-react-exports --write
pnpm check:ui-react-stable-actions --write
\`\`\`

CI should run the same checks without \`--write\` and fail if either generated artifact drifts.
`;
}

async function format(relativePath, raw) {
  const outputPath = resolve(repositoryRoot, relativePath);
  try {
    const prettier = await import("prettier");
    const config = (await prettier.resolveConfig(outputPath)) ?? {};
    return prettier.format(raw, { ...config, filepath: outputPath });
  } catch {
    return raw;
  }
}

async function writeIfRequestedOrCheck(relativePath, expected) {
  const outputPath = resolve(repositoryRoot, relativePath);
  if (process.argv.includes("--write")) {
    await writeFile(outputPath, expected);
    return;
  }

  let actual = "";
  try {
    actual = await readFile(outputPath, "utf8");
  } catch {
    // Missing files are reported as drift below.
  }

  if (actual !== expected) {
    console.error(
      `@atom63/ui-react stable action matrix is stale. Regenerate it with:`,
    );
    console.error(`  pnpm check:ui-react-stable-actions --write`);
    process.exitCode = 1;
  }
}

const [inventory, supportPolicy] = await Promise.all([
  readJson(inventoryPath),
  readJson(supportPolicyPath),
]);
const sourceActions = buildSourceRows(inventory, supportPolicy);
const subpathActions = buildSubpathRows(inventory, supportPolicy);
const matrix = {
  schemaVersion: 1,
  status: "stable-readiness-action-matrix",
  packageName: supportPolicy.packageName,
  inputs: [inventoryPath, supportPolicyPath],
  generatedFrom: {
    inventorySchemaVersion: inventory.schemaVersion,
    supportPolicySchemaVersion: supportPolicy.schemaVersion,
    supportPolicyEffectiveFrom: supportPolicy.effectiveFrom,
  },
  actionDefinitions: tierActions,
  summary: summarize(sourceActions, subpathActions),
  sourceActions,
  subpathActions,
};

const json = await format(
  jsonOutputPath,
  `${JSON.stringify(matrix, null, 2)}\n`,
);
const markdown = await format(markdownOutputPath, buildMarkdown(matrix));

await writeIfRequestedOrCheck(jsonOutputPath, json);
await writeIfRequestedOrCheck(markdownOutputPath, markdown);

if (process.argv.includes("--write")) {
  console.log(
    `Wrote @atom63/ui-react stable action matrix -> ${jsonOutputPath}, ${markdownOutputPath}`,
  );
} else if (!process.exitCode) {
  console.log(
    `@atom63/ui-react stable action matrix is current (${jsonOutputPath}, ${markdownOutputPath})`,
  );
}
