'use client'

import * as React from 'react'

/* Marks the subtree as living inside a ButtonGroup so member controls (Button,
   Input, Select) can flatten their own radius/shadow. Faithful to prod
   @atom63/ui: a boolean context, default false. */
const ButtonGroupContext = React.createContext(false)

export function ButtonGroupProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return <ButtonGroupContext.Provider value={true}>{children}</ButtonGroupContext.Provider>
}

export function useButtonGroupContext(): boolean {
  return React.useContext(ButtonGroupContext)
}
