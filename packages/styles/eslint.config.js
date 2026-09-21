import { node } from '@atom63/eslint-config/node'

/*
 * @atom63/styles — CSS-first style system (contracts, tokens, themes, skins).
 *
 * Almost all of it is .css; the only JS/TS surface is `z-layers.ts` plus configs.
 * typeAware is off because this package has no tsconfig.json for the type-aware
 * preset to build a program from.
 */
export default node({ tsconfigRootDir: import.meta.dirname, typeAware: false })
