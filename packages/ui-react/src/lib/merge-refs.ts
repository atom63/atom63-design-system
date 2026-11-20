import type * as React from 'react'

/** Combine refs into one callback ref, for a component that needs its own
 *  handle on a node while still forwarding the consumer's ref. */
export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
  return node => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }
  }
}
