import { createFakeApi } from './fake-api'

type Script = (figma: unknown) => Promise<unknown>
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...args: string[]
) => Script

/** A `figma` global over the fake API, and a runner for `use_figma` script bodies. */
export function createFakeFigma() {
  const fake = createFakeApi()
  const figma = { variables: fake.api }
  const run = (script: string) => new AsyncFunction('figma', script)(figma)
  return { ...fake, figma, run }
}
