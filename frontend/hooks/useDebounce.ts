import { useEffect, useState } from 'react'

/** Returns a copy of `value` that only updates after `delay` ms of no changes.
 * Used to drive live search without firing a request on every keystroke. */
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
