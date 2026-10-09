import type { ComponentPlan, Difference } from './sync-component'

/** A component plan as counts, so a script's result stays well under use_figma's 20 KB. */
export interface ComponentCounts {
  missingVariables: string[]
  /** Derived variables to create or update. */
  variables: number
  create: number
  update: number
  unchanged: number
  /** The first differing check of up to 12 differing variants; only when any. */
  differences?: Difference[]
  /**
   * Up to 12 variants with a component property reference on the default
   * variant (Label or Icon) Figma is still reconciling; only when any.
   */
  pendingReferences?: string[]
  /** Spec card parts to create, to update and as the model says; only in the part with the doc. */
  card?: { create: number; update: number; unchanged: number }
}
export const countsOf = (plan: ComponentPlan): ComponentCounts => ({
  missingVariables: plan.missingVariables,
  variables: plan.variables.length,
  create: plan.create.length,
  update: plan.update.length,
  unchanged: plan.unchanged,
  ...(plan.differences ? { differences: plan.differences } : {}),
  ...(plan.pendingReferences ? { pendingReferences: plan.pendingReferences } : {}),
  ...(plan.card
    ? {
        card: {
          create: plan.card.create.length,
          update: plan.card.update.length,
          unchanged: plan.card.unchanged,
        },
      }
    : {}),
})
