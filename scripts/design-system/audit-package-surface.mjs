import {
  readJson,
  relativeToRoot,
  fromRoot,
  writeAuditJson,
} from "./audit-utils.mjs";

const packageDirectories = [
  "packages/styles",
  "packages/ui-foundation",
  "packages/ui-react",
];

function selectQualityScripts(scripts = {}) {
  return Object.fromEntries(
    Object.entries(scripts)
      .filter(([name]) => /^(build|lint|test|typecheck)(:|$)/.test(name))
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

const packages = [];

for (const directory of packageDirectories) {
  const manifestPath = fromRoot(directory, "package.json");
  const manifest = await readJson(manifestPath);
  const exportsMap = manifest.exports ?? null;

  packages.push({
    directory,
    manifestPath: relativeToRoot(manifestPath),
    name: manifest.name ?? null,
    version: manifest.version ?? null,
    private: manifest.private === true,
    exports: exportsMap,
    exportKeys:
      exportsMap && typeof exportsMap === "object" && !Array.isArray(exportsMap)
        ? Object.keys(exportsMap).sort((a, b) => a.localeCompare(b))
        : [],
    files: manifest.files ?? null,
    sideEffects: manifest.sideEffects ?? null,
    peerDependencies: manifest.peerDependencies ?? {},
    qualityScripts: selectQualityScripts(manifest.scripts),
    publishConfig: manifest.publishConfig ?? null,
    publishAccess: manifest.publishConfig?.access ?? null,
  });
}

const audit = {
  schemaVersion: 1,
  inputs: packageDirectories.map((directory) => `${directory}/package.json`),
  summary: {
    packageCount: packages.length,
    publishableCount: packages.filter((item) => !item.private).length,
    privateCount: packages.filter((item) => item.private).length,
    packagesWithExports: packages.filter((item) => item.exportKeys.length > 0)
      .length,
    packagesWithFilesWhitelist: packages.filter((item) =>
      Array.isArray(item.files),
    ).length,
    packagesWithPeerDependencies: packages.filter(
      (item) => Object.keys(item.peerDependencies).length > 0,
    ).length,
    packagesWithPublishAccess: packages.filter(
      (item) => item.publishAccess !== null,
    ).length,
  },
  packages,
};

const outputPath = await writeAuditJson(
  "docs/design-system/audits/package-surface.json",
  audit,
);

console.log(
  `Audited ${packages.length} package surfaces -> ${relativeToRoot(outputPath)}`,
);
