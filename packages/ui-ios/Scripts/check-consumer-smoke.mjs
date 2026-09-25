import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
// The consumer must see every contract in the source, however many there are.
const contractCount = JSON.parse(
  readFileSync(
    join(repositoryRoot, 'packages', 'ui-foundation', 'contracts', 'cross-renderer-contracts.json'),
    'utf8'
  )
).contracts.length
const temporaryRoot = mkdtempSync(join(tmpdir(), 'atom63-ui-consumer-'))
const packageCopy = join(temporaryRoot, 'Atom63UI')
const consumerRoot = join(temporaryRoot, 'Consumer')

try {
  mkdirSync(join(packageCopy, 'packages', 'ui-ios'), { recursive: true })
  cpSync(join(repositoryRoot, 'Package.swift'), join(packageCopy, 'Package.swift'))
  cpSync(
    join(repositoryRoot, 'packages', 'ui-ios', 'Sources'),
    join(packageCopy, 'packages', 'ui-ios', 'Sources'),
    { recursive: true }
  )

  mkdirSync(join(consumerRoot, 'Sources', 'Consumer'), { recursive: true })
  writeFileSync(
    join(consumerRoot, 'Package.swift'),
    `// swift-tools-version: 6.0

import PackageDescription

let package = Package(
  name: "Consumer",
  platforms: [.macOS(.v14)],
  dependencies: [.package(path: "../Atom63UI")],
  targets: [
    .executableTarget(
      name: "Consumer",
      dependencies: [.product(name: "Atom63UI", package: "Atom63UI")]
    )
  ]
)
`
  )
  writeFileSync(
    join(consumerRoot, 'Sources', 'Consumer', 'main.swift'),
    `import Atom63UI

precondition(AtomComponentContracts.all.count == ${contractCount})
precondition(AtomRendererConformance.verified.count == ${contractCount})
print("Atom63UI consumer compiled with \\(AtomComponentContracts.all.count) contracts")
`
  )
  cpSync(
    join(repositoryRoot, 'packages', 'ui-ios', 'Examples', 'ProjectFeatureTemplate.swift'),
    join(consumerRoot, 'Sources', 'Consumer', 'ProjectFeatureTemplate.swift')
  )

  execFileSync('swift', ['build', '--package-path', consumerRoot], {
    stdio: 'inherit',
  })
  console.log('Isolated Atom63UI consumer build succeeded')
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
