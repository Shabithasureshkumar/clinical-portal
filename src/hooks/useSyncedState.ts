import { useState, type Dispatch, type SetStateAction } from 'react'

/**
 * Local editable state that is re-derived whenever `source` changes (for example server data that the
 * user then edits locally, or a page number that must reset when a filter changes).
 *
 * This is React's documented "adjust state during render" pattern: it avoids an extra effect pass and
 * the stale frame that `useEffect(() => setState(...), [source])` produces.
 */
export function useSyncedState<S>(source: unknown, compute: () => S): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(compute)
  const [previous, setPrevious] = useState(source)
  if (!Object.is(previous, source)) {
    setPrevious(source)
    setState(compute())
  }
  return [state, setState]
}
