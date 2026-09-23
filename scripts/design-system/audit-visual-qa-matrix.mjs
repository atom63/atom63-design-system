import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");
const matrixPath = "docs/design-system/visual-qa-matrix.json";
const auditPath = "docs/design-system/audits/visual-qa-matrix.json";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function assertArray(value, path, min = 1) {
  assert(Array.isArray(value), `${path} must be an array`);
  assert(value.length >= min, `${path} must include at least ${min} item(s)`);
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(repositoryRoot, path), "utf8"));
}

async function main() {
  const writeMode = process.argv.includes("--write");
  const matrix = await readJson(matrixPath);
  assert(matrix.schemaVersion === 1, "schemaVersion must be 1");
  assert(
    matrix.status === "matrix-defined-partial-evidence",
    "visual QA matrix must stay explicit about partial evidence",
  );
  assert(
    matrix.baselineOwner === "visual-quality",
    "baselineOwner must be visual-quality",
  );
  assert(
    isNonEmptyString(matrix.currentEvidence?.productAdopterPr),
    "currentEvidence.productAdopterPr is required",
  );
  assertArray(matrix.currentEvidence.routes, "currentEvidence.routes", 3);
  assertArray(matrix.currentEvidence.viewports, "currentEvidence.viewports", 2);
  assertArray(matrix.currentEvidence.modes, "currentEvidence.modes", 2);

  const stable = matrix.stableCandidateMatrix;
  assert(
    stable && typeof stable === "object",
    "stableCandidateMatrix is required",
  );
  assertArray(stable.routes, "stableCandidateMatrix.routes", 4);
  assertArray(stable.viewports, "stableCandidateMatrix.viewports", 2);
  assertArray(stable.themes, "stableCandidateMatrix.themes", 4);
  assertArray(stable.colorSchemes, "stableCandidateMatrix.colorSchemes", 2);
  assertArray(
    stable.interactionStates,
    "stableCandidateMatrix.interactionStates",
    5,
  );
  assertArray(
    stable.motionPreferences,
    "stableCandidateMatrix.motionPreferences",
    2,
  );
  assertArray(matrix.stableExitCriteria, "stableExitCriteria", 5);
  assertArray(matrix.knownGaps, "knownGaps", 1);

  const routeIds = stable.routes.map((route) => route.id);
  for (const route of stable.routes) {
    assert(
      isNonEmptyString(route.id),
      "stableCandidateMatrix.routes[].id is required",
    );
    assert(isNonEmptyString(route.path), `${route.id}.path is required`);
    assert(isNonEmptyString(route.purpose), `${route.id}.purpose is required`);
  }
  for (const viewport of stable.viewports) {
    assert(
      isNonEmptyString(viewport.id),
      "stableCandidateMatrix.viewports[].id is required",
    );
    assert(
      Number.isInteger(viewport.width) && viewport.width > 0,
      `${viewport.id}.width must be positive`,
    );
    assert(
      Number.isInteger(viewport.height) && viewport.height > 0,
      `${viewport.id}.height must be positive`,
    );
  }

  const audit = {
    schemaVersion: 1,
    status: "visual-qa-matrix-current",
    matrix: matrixPath,
    generatedFrom: "scripts/design-system/audit-visual-qa-matrix.mjs",
    currentEvidence: matrix.currentEvidence,
    stableCoveragePlan: {
      routeCount: stable.routes.length,
      routeIds,
      viewportCount: stable.viewports.length,
      themes: stable.themes,
      colorSchemes: stable.colorSchemes,
      interactionStates: stable.interactionStates,
      motionPreferences: stable.motionPreferences,
    },
    stableExitCriteria: matrix.stableExitCriteria,
    knownGaps: matrix.knownGaps,
  };

  const formatted = await prettier.format(JSON.stringify(audit), {
    parser: "json",
  });
  const outputFile = resolve(repositoryRoot, auditPath);
  if (writeMode) {
    await writeFile(outputFile, formatted);
    console.log(`Wrote visual QA matrix audit -> ${auditPath}`);
    return;
  }
  let existing = "";
  try {
    existing = await readFile(outputFile, "utf8");
  } catch {
    throw new Error(
      `${auditPath} is missing; run pnpm check:visual-qa-matrix -- --write`,
    );
  }
  assert(
    existing === formatted,
    `${auditPath} is stale; run pnpm check:visual-qa-matrix -- --write`,
  );
  console.log(`Visual QA matrix is current (${auditPath})`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
