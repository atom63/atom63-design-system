import { base } from './base.js'

/** Node preset — base only, no React plugins (CLIs, config packages, scripts). */
export function node(options) {
  return base(options)
}

export default node
