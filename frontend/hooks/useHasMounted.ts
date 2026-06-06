import { useEffect, useState } from 'react'

/**
 * Returns false during server render and the first client render, then true
 * after mount. Use it to gate UI that depends on client-only state (auth token
 * in localStorage, TanStack Query that is disabled on the server, etc.) so the
 * server HTML and the first client render agree — avoiding hydration mismatches.
 *
 * Render the SAME stable placeholder while this is false on both server and
 * client; reveal the real, state-dependent UI only once it is true.
 */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}
