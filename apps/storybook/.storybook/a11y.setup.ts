// Portable stories in the `a11y` project get the same decorators and
// parameters as Storybook itself.
import { setProjectAnnotations } from '@storybook/react-vite'

import preview from './preview'

setProjectAnnotations(preview)
