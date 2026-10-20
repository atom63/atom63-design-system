/**
 * Runs package-manager commands (`pnpm`, `npm`, `node_modules/.bin/*`) the
 * same way on every platform. On Windows those are `.cmd` shims, which Node
 * can only start through a shell, and Node 24 deprecates passing an argument
 * list together with `shell: true` (DEP0190), so there the arguments are quoted
 * into one command line. Everywhere else the command runs without a shell.
 */
import { execFileSync, spawn, spawnSync } from 'node:child_process'

const windows = process.platform === 'win32'

/** Quote one argument for cmd.exe unless it only has characters it leaves alone. */
export const quoteArg = arg =>
  /^[\w@+=:,./\\-]+$/.test(arg) ? arg : `"${arg.replace(/"/g, '\\"')}"`

export const commandLine = (command, args) => [command, ...args].map(quoteArg).join(' ')

/** `execFileSync(command, args, options)` that also starts `.cmd` shims on Windows. */
export function execCommandSync(command, args, options = {}) {
  return windows
    ? execFileSync(commandLine(command, args), { ...options, shell: true })
    : execFileSync(command, args, options)
}

/** `spawnSync(command, args, options)` that also starts `.cmd` shims on Windows. */
export function spawnCommandSync(command, args, options = {}) {
  return windows
    ? spawnSync(commandLine(command, args), { ...options, shell: true })
    : spawnSync(command, args, options)
}

/** `spawn(command, args, options)` that also starts `.cmd` shims on Windows. */
export function spawnCommand(command, args, options = {}) {
  return windows
    ? spawn(commandLine(command, args), { ...options, shell: true })
    : spawn(command, args, options)
}

/**
 * Stop a child from `spawnCommand`. On Windows the child is the shell, so
 * killing it alone would leave the real process (a `vite preview` server, say)
 * running; `taskkill /T` ends the whole tree.
 */
export function stopCommand(child) {
  if (windows) spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  else child.kill('SIGTERM')
}
