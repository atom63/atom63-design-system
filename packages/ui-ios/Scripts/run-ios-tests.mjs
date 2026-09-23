import { execFileSync, spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const devices = JSON.parse(
  execFileSync('xcrun', ['simctl', 'list', 'devices', 'available', '--json'], {
    encoding: 'utf8',
  })
).devices

const iPhones = Object.entries(devices)
  .sort(([left], [right]) => right.localeCompare(left))
  .flatMap(([, runtimeDevices]) => runtimeDevices)
  .filter(device => device.isAvailable !== false && device.name.startsWith('iPhone'))

const device = iPhones.find(candidate => candidate.name.includes('Pro')) ?? iPhones[0]
if (!device) {
  throw new Error('No available iPhone Simulator was found')
}

console.log(`Running Atom63Demo tests on ${device.name} (${device.udid})`)
const result = spawnSync(
  'xcodebuild',
  [
    'test',
    '-project',
    join(repositoryRoot, 'examples', 'ios-demo', 'Atom63Demo.xcodeproj'),
    '-scheme',
    'Atom63Demo',
    '-destination',
    `platform=iOS Simulator,id=${device.udid}`,
    'CODE_SIGNING_ALLOWED=NO',
  ],
  {
    cwd: repositoryRoot,
    env: process.env,
    stdio: 'inherit',
  }
)

if (result.error) throw result.error
process.exit(result.status ?? 1)
