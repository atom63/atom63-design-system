import { createContext, useContext } from 'react'

/** True when rendering inside an ExampleContainer — MDX typography styles should not apply. */
export const ExampleContext = createContext(false)

export const useIsInsideExample = () => useContext(ExampleContext)
