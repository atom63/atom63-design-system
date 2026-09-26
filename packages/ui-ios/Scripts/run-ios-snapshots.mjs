// Runs the demo catalog's screenshot tests (CatalogSnapshotTests) on the pinned simulator.
//
//   node Scripts/run-ios-snapshots.mjs            compare with the baselines
//   node Scripts/run-ios-snapshots.mjs --record   rewrite the baselines, then stop
//
// The simulator is pinned in examples/ios-demo/snapshot-simulator.json. On CI the pinned device
// and iOS version must exist. Locally, when they do not, the tests run on the closest iPhone and
// use their own git-ignored baselines under __Snapshots__/local/.
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const demoRoot = join(repositoryRoot, 'examples', 'ios-demo')
const snapshotsRoot = join(demoRoot, 'Atom63DemoTests', '__Snapshots__')
const failuresRoot = join(demoRoot, 'snapshot-failures')
const record = process.argv.includes('--record')
const pin = JSON.parse(readFileSync(join(demoRoot, 'snapshot-simulator.json'), 'utf8'))

const simctl = (...args) => execFileSync('xcrun', ['simctl', ...args], { encoding: 'utf8' })
const { devices } = JSON.parse(simctl('list', '--json', 'devices', 'available'))
const { runtimes } = JSON.parse(simctl('list', '--json', 'runtimes', 'available'))
const { devicetypes } = JSON.parse(simctl('list', '--json', 'devicetypes'))

const runtime = runtimes.find(
  candidate => candidate.platform === 'iOS' && candidate.version === pin.os
)
const deviceType = devicetypes.find(candidate => candidate.name === pin.device)

let device
let pinned = false
if (runtime && deviceType) {
  pinned = true
  device = devices[runtime.identifier]?.find(candidate => candidate.name === pin.device)
  if (!device) {
    const udid = simctl('create', pin.device, deviceType.identifier, runtime.identifier).trim()
    device = { name: pin.device, udid }
  }
} else if (process.env.CI) {
  throw new Error(
    `The pinned snapshot simulator (${pin.device}, iOS ${pin.os}) is not installed on this runner. ` +
      'Pin an installed one in examples/ios-demo/snapshot-simulator.json and record new baselines.'
  )
} else {
  const iPhones = Object.entries(devices)
    .filter(([identifier]) => identifier.includes('SimRuntime.iOS'))
    .sort(([left], [right]) => right.localeCompare(left, undefined, { numeric: true }))
    .flatMap(([, runtimeDevices]) => runtimeDevices)
    .filter(candidate => candidate.name.startsWith('iPhone'))
  device = iPhones.find(candidate => candidate.name === pin.device) ?? iPhones[0]
  if (!device) throw new Error('No available iPhone Simulator was found')
  console.log(
    `The pinned simulator (${pin.device}, iOS ${pin.os}) is not installed. Using ${device.name}; ` +
      'its baselines are local and git-ignored, under __Snapshots__/local/.'
  )
}

if (record && pinned) {
  // Start from an empty folder so baselines of removed catalog entries go away.
  rmSync(join(snapshotsRoot, `${pin.device.replaceAll(' ', '-')}_iOS-${pin.os}`), {
    recursive: true,
    force: true,
  })
}
rmSync(failuresRoot, { recursive: true, force: true })

console.log(
  `${record ? 'Recording' : 'Comparing'} catalog snapshots on ${device.name} (${device.udid})`
)
const result = spawnSync(
  'xcodebuild',
  [
    'test',
    '-project',
    join(demoRoot, 'Atom63Demo.xcodeproj'),
    '-scheme',
    'Atom63Demo',
    '-destination',
    `platform=iOS Simulator,id=${device.udid}`,
    '-only-testing:Atom63DemoTests/CatalogSnapshotTests',
    'CODE_SIGNING_ALLOWED=NO',
  ],
  {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      // xcodebuild passes TEST_RUNNER_-prefixed variables to the tests without the prefix.
      TEST_RUNNER_ATOM63_SNAPSHOT_RECORD: record ? '1' : '0',
      TEST_RUNNER_SNAPSHOT_ARTIFACTS: failuresRoot,
    },
    stdio: 'inherit',
  }
)

if (result.error) throw result.error
process.exit(result.status ?? 1)
