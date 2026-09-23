import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");
const policyPath = "docs/design-system/dependency-version-policy.json";
const auditPath = "docs/design-system/audits/dependency-version-policy.json";
const packageDirs = [
  "packages/styles",
  "packages/ui-foundation",
  "packages/ui-react",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(repositoryRoot, path), "utf8"));
}

function ownObject(value, path) {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    `${path} must be an object`,
  );
  return value;
}

async function main() {
  const writeMode = process.argv.includes("--write");
  const policy = await readJson(policyPath);
  assert(policy.schemaVersion === 1, "schemaVersion must be 1");
  assert(
    policy.status === "beta-policy-active-stable-pending",
    "policy status must keep stable pending",
  );
  assert(
    policy.supportedReact?.peerRange === "^19.1.0",
    "supportedReact.peerRange must match current beta peer range",
  );
  assert(
    policy.supportedReact?.testedVersion === "19.2.7",
    "supportedReact.testedVersion must match root test version",
  );

  const coordinated = new Set(policy.coordinatedPackages ?? []);
  assert(
    coordinated.size === packageDirs.length,
    "coordinatedPackages must cover first-wave packages",
  );

  const runtimePolicy = ownObject(
    policy.runtimeDependencyPolicy,
    "runtimeDependencyPolicy",
  );
  const manifests = [];
  for (const dir of packageDirs) {
    const manifest = await readJson(`${dir}/package.json`);
    manifests.push({ dir, manifest });
    assert(
      coordinated.has(manifest.name),
      `${manifest.name} missing from coordinatedPackages`,
    );
    const packagePolicy = ownObject(
      runtimePolicy[manifest.name],
      `runtimeDependencyPolicy[${manifest.name}]`,
    );
    const deps = manifest.dependencies ?? {};
    for (const [name, range] of Object.entries(deps)) {
      assert(
        Object.hasOwn(packagePolicy, name),
        `${manifest.name} dependency ${name} is missing from runtimeDependencyPolicy`,
      );
      if (name === "@base-ui/react") {
        assert(
          range === "1.6.0",
          "@base-ui/react must remain exact-pinned through beta",
        );
      }
      if (name === "input-otp") {
        assert(
          range === "^1.4.2",
          "input-otp manifest range must stay aligned with root override policy",
        );
      }
    }
    for (const name of Object.keys(packagePolicy)) {
      assert(
        Object.hasOwn(deps, name),
        `${manifest.name} runtime policy mentions non-dependency ${name}`,
      );
    }
  }

  const uiReact = manifests.find(
    (entry) => entry.manifest.name === "@atom63/ui-react",
  )?.manifest;
  assert(uiReact, "@atom63/ui-react manifest missing");
  assert(
    uiReact.peerDependencies?.react === policy.supportedReact.peerRange,
    "React peer range drifted",
  );
  assert(
    uiReact.peerDependencies?.["react-dom"] === policy.supportedReact.peerRange,
    "React DOM peer range drifted",
  );

  const typeVisibleByPackage = ownObject(
    policy.typeVisibleDependencies,
    "typeVisibleDependencies",
  );
  const uiReactTypeVisible = typeVisibleByPackage["@atom63/ui-react"];
  assert(
    Array.isArray(uiReactTypeVisible) && uiReactTypeVisible.length > 0,
    "@atom63/ui-react type-visible dependency policy is required",
  );
  for (const entry of uiReactTypeVisible) {
    assert(
      isNonEmptyString(entry.name),
      "type-visible dependency name is required",
    );
    assert(
      isNonEmptyString(entry.currentRange),
      `${entry.name}.currentRange is required`,
    );
    assert(isNonEmptyString(entry.policy), `${entry.name}.policy is required`);
    assert(isNonEmptyString(entry.reason), `${entry.name}.reason is required`);
    assert(
      uiReact.dependencies?.[entry.name] === entry.currentRange,
      `${entry.name} currentRange drifted from @atom63/ui-react manifest`,
    );
  }

  const stableSemver = ownObject(
    policy.stableSemverPolicy,
    "stableSemverPolicy",
  );
  for (const field of ["breakingChanges", "minorChanges", "patchChanges"]) {
    assert(
      Array.isArray(stableSemver[field]) && stableSemver[field].length > 0,
      `stableSemverPolicy.${field} must not be empty`,
    );
  }

  const audit = {
    schemaVersion: 1,
    status: "dependency-version-policy-current",
    policy: policyPath,
    generatedFrom: "scripts/design-system/audit-dependency-version-policy.mjs",
    supportedReact: policy.supportedReact,
    coordinatedPackages: [...coordinated],
    packages: manifests.map(({ dir, manifest }) => ({
      name: manifest.name,
      version: manifest.version,
      dir,
      peerDependencies: manifest.peerDependencies ?? {},
      dependencies: manifest.dependencies ?? {},
    })),
    typeVisibleDependencies: policy.typeVisibleDependencies,
    stableSemverPolicy: policy.stableSemverPolicy,
  };

  const formatted = await prettier.format(JSON.stringify(audit), {
    parser: "json",
  });
  const outputFile = resolve(repositoryRoot, auditPath);
  if (writeMode) {
    await writeFile(outputFile, formatted);
    console.log(`Wrote dependency/version policy audit -> ${auditPath}`);
    return;
  }
  let existing = "";
  try {
    existing = await readFile(outputFile, "utf8");
  } catch {
    throw new Error(
      `${auditPath} is missing; run pnpm check:dependency-version-policy -- --write`,
    );
  }
  assert(
    existing === formatted,
    `${auditPath} is stale; run pnpm check:dependency-version-policy -- --write`,
  );
  console.log(`Dependency/version policy is current (${auditPath})`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
