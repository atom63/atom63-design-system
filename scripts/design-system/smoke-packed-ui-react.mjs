import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");
const require = createRequire(import.meta.url);
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const packageDefinitions = [
  { name: "@atom63/styles", directory: "packages/styles", required: true },
  {
    name: "@atom63/ui-foundation",
    directory: "packages/ui-foundation",
    required: true,
  },
  { name: "@atom63/ui-react", directory: "packages/ui-react", required: true },
];

const tarballSearchDirectories = [
  repositoryRoot,
  ...packageDefinitions.map(({ directory }) =>
    resolve(repositoryRoot, directory),
  ),
];

function run(command, args, { cwd = repositoryRoot, capture = false } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      shell: false,
      stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
    });
    let stdout = "";

    if (capture && child.stdout) {
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk) => {
        stdout += chunk;
      });
    }

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise(stdout);
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`,
        ),
      );
    });
  });
}

async function readPackageManifest(directory) {
  const manifestPath = resolve(repositoryRoot, directory, "package.json");
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

async function runPackageScript(packageDefinition, scriptName) {
  const manifest = await readPackageManifest(packageDefinition.directory);
  if (!manifest.scripts?.[scriptName]) {
    throw new Error(
      `${packageDefinition.name} does not define a ${scriptName} script`,
    );
  }

  await run(pnpmCommand, ["--filter", packageDefinition.name, scriptName]);
}

async function listRepositoryTarballs() {
  const tarballs = new Set();

  for (const directory of tarballSearchDirectories) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".tgz")) {
        tarballs.add(resolve(directory, entry.name));
      }
    }
  }

  return tarballs;
}

async function cleanNewRepositoryTarballs(tarballsBefore) {
  const tarballsAfter = await listRepositoryTarballs();
  const generatedTarballs = [...tarballsAfter].filter(
    (path) => !tarballsBefore.has(path),
  );
  await Promise.all(generatedTarballs.map((path) => unlink(path)));
}

function parsePackResult(output, packageName) {
  let result;
  try {
    result = JSON.parse(output);
  } catch {
    throw new Error(`Could not parse pnpm pack JSON for ${packageName}`);
  }

  const packResult = Array.isArray(result) ? result[0] : result;
  if (!packResult?.filename) {
    throw new Error(`pnpm pack did not report a tarball for ${packageName}`);
  }

  return packResult.filename;
}

async function packPackage(packageDefinition, tarballDirectory) {
  const output = await run(
    pnpmCommand,
    [
      "--filter",
      packageDefinition.name,
      "pack",
      "--json",
      "--pack-destination",
      tarballDirectory,
    ],
    { capture: true },
  );
  const tarballPath = parsePackResult(output, packageDefinition.name);
  await access(tarballPath);

  return { ...packageDefinition, tarballPath };
}

function installedVersion(packageName) {
  let currentPath;
  try {
    currentPath = require.resolve(`${packageName}/package.json`);
  } catch {
    currentPath = require.resolve(packageName);
  }

  let currentDirectory = dirname(currentPath);
  while (currentDirectory !== dirname(currentDirectory)) {
    try {
      const manifest = require(join(currentDirectory, "package.json"));
      if (manifest.name === packageName && manifest.version) {
        return manifest.version;
      }
    } catch {
      // Keep walking from a package entry point to its owning manifest.
    }
    currentDirectory = dirname(currentDirectory);
  }

  throw new Error(
    `Could not determine the installed version of ${packageName}`,
  );
}

async function writeHarness(harnessDirectory, packedPackages) {
  const tarballSpec = (packageName) => {
    const packedPackage = packedPackages.find(
      (item) => item.name === packageName,
    );
    if (!packedPackage) {
      throw new Error(`Missing packed dependency ${packageName}`);
    }

    return `file:../tarballs/${basename(packedPackage.tarballPath)}`;
  };

  const manifest = {
    name: "atom63-packed-ui-react-smoke",
    private: true,
    version: "0.0.0",
    type: "module",
    packageManager: "pnpm@10.29.2",
    scripts: {
      check: "tsc --noEmit && vite build",
    },
    dependencies: {
      "@atom63/styles": tarballSpec("@atom63/styles"),
      "@atom63/ui-foundation": tarballSpec("@atom63/ui-foundation"),
      "@atom63/ui-react": tarballSpec("@atom63/ui-react"),
      react: installedVersion("react"),
      "react-dom": installedVersion("react-dom"),
    },
    devDependencies: {
      "@types/react": installedVersion("@types/react"),
      "@types/react-dom": installedVersion("@types/react-dom"),
      typescript: installedVersion("typescript"),
      vite: installedVersion("vite"),
    },
    pnpm: {
      overrides: {
        "@atom63/styles": tarballSpec("@atom63/styles"),
        "@atom63/ui-foundation": tarballSpec("@atom63/ui-foundation"),
        "@atom63/ui-react": tarballSpec("@atom63/ui-react"),
      },
    },
  };

  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      useDefineForClassFields: true,
      lib: ["ES2022", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "Bundler",
      allowImportingTsExtensions: false,
      isolatedModules: true,
      esModuleInterop: true,
      jsx: "react-jsx",
      strict: true,
      noEmit: true,
    },
    include: ["src"],
  };

  const source = `import '@atom63/styles'
import '@atom63/ui-react/styles.css'
import '@atom63/ui-react/recipes/media-lightbox.css'

import {
  Autocomplete,
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Carousel,
  Checkbox,
  CopyButton,
  DestinationLink,
  Dialog,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Input,
  InputOTP,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  useAutocompleteFilter,
  useCardCursor,
  useCarousel,
  type CarouselApi,
  type DialogSize,
} from '@atom63/ui-react'
import { buttonContract, type ButtonContract } from '@atom63/ui-foundation'
import { Container, type ContainerProps } from '@atom63/ui-react/layout'
import { Image, type ImageProps } from '@atom63/ui-react/media'
import { Lightbox, type LightboxState } from '@atom63/ui-react/media/lightbox'
import { MODE_OPTIONS, type ThemeMode } from '@atom63/ui-react/theme'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const foundationContract: ButtonContract = buttonContract
const publicApiReferences = {
  Autocomplete,
  Calendar,
  Carousel,
  CopyButton,
  DestinationLink,
  Dialog,
  Image,
  InputOTP,
  Lightbox,
  MODE_OPTIONS,
  useAutocompleteFilter,
  useCardCursor,
  useCarousel,
}
type PublicApiTypes = [CarouselApi, ContainerProps, DialogSize, ImageProps, LightboxState, ThemeMode]
const publicApiTypes: PublicApiTypes | undefined = undefined
void foundationContract
void publicApiReferences
void publicApiTypes

function App() {
  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle>Atom63 package smoke</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>External consumer</Badge>
          <Label htmlFor="packed-name">Name</Label>
          <Input id="packed-name" />
          <Textarea aria-label="Notes" />
          <Checkbox aria-label="Include details" defaultChecked />
          <Switch aria-label="Enable updates" />
          <Select defaultValue="one">
            <SelectTrigger aria-label="Packed choice">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one">One</SelectItem>
              <SelectItem value="two">Two</SelectItem>
            </SelectContent>
          </Select>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">Packed root exports resolve.</TabsContent>
            <TabsContent value="details">
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No missing exports</EmptyTitle>
                  <EmptyDescription>Core and composition APIs typecheck.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </TabsContent>
          </Tabs>
          <Button type="button">Built from tarballs</Button>
        </CardContent>
      </Card>
    </Container>
  )
}

const rootElement = document.querySelector('#root')
if (!(rootElement instanceof HTMLElement)) {
  throw new Error('Missing root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
`;

  await mkdir(resolve(harnessDirectory, "src"), { recursive: true });
  await Promise.all([
    writeFile(
      resolve(harnessDirectory, "package.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    ),
    writeFile(
      resolve(harnessDirectory, "tsconfig.json"),
      `${JSON.stringify(tsconfig, null, 2)}\n`,
    ),
    writeFile(
      resolve(harnessDirectory, "index.html"),
      '<!doctype html>\n<html lang="en"><head><meta charset="UTF-8" /></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
    ),
    writeFile(resolve(harnessDirectory, "src/main.tsx"), source),
  ]);
}

async function installHarness(harnessDirectory) {
  const installArgs = ["install", "--offline", "--no-frozen-lockfile"];

  try {
    await run(pnpmCommand, installArgs, { cwd: harnessDirectory });
    return "pnpm install --offline --no-frozen-lockfile";
  } catch {
    console.warn(
      "Offline install missed the local pnpm cache; retrying with registry access.",
    );
    await rm(resolve(harnessDirectory, "node_modules"), {
      recursive: true,
      force: true,
    });
    await rm(resolve(harnessDirectory, "pnpm-lock.yaml"), { force: true });
    await run(pnpmCommand, ["install", "--no-frozen-lockfile"], {
      cwd: harnessDirectory,
    });
    return "pnpm install --no-frozen-lockfile (online fallback)";
  }
}

async function main() {
  const tarballsBefore = await listRepositoryTarballs();
  const temporaryRoot = await mkdtemp(join(tmpdir(), "atom63-ds-pack-smoke-"));
  const tarballDirectory = resolve(temporaryRoot, "tarballs");
  const harnessDirectory = resolve(temporaryRoot, "consumer");
  let succeeded = false;

  await mkdir(tarballDirectory, { recursive: true });
  await mkdir(harnessDirectory, { recursive: true });

  try {
    const stylesPackage = packageDefinitions.find(
      (item) => item.name === "@atom63/styles",
    );
    const foundationPackage = packageDefinitions.find(
      (item) => item.name === "@atom63/ui-foundation",
    );
    const reactPackage = packageDefinitions.find(
      (item) => item.name === "@atom63/ui-react",
    );

    await runPackageScript(stylesPackage, "check:tokens");
    await runPackageScript(foundationPackage, "build");
    await runPackageScript(reactPackage, "build");

    const packedPackages = [];
    for (const packageDefinition of packageDefinitions) {
      packedPackages.push(
        await packPackage(packageDefinition, tarballDirectory),
      );
    }

    await writeHarness(harnessDirectory, packedPackages);
    const installCommand = await installHarness(harnessDirectory);
    await run(pnpmCommand, ["run", "check"], { cwd: harnessDirectory });

    const requiredTarballs = packedPackages
      .filter((item) => item.required)
      .map((item) => `${item.name} (${basename(item.tarballPath)})`)
      .join(", ");
    console.log("\nAtom63 packed package smoke passed.");
    console.log(`Harness: ${harnessDirectory} (removed after success)`);
    console.log(`Tarballs: ${requiredTarballs}`);
    console.log(`Install: ${installCommand}`);
    console.log("Command: pnpm run check (tsc --noEmit && vite build)");
    succeeded = true;
  } catch (error) {
    console.error(
      `\nAtom63 packed package smoke failed. Harness preserved at: ${harnessDirectory}`,
    );
    throw error;
  } finally {
    await cleanNewRepositoryTarballs(tarballsBefore);
    if (succeeded) {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
