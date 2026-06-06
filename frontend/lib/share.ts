/** Absolute permalink to a single rant. Falls back to a relative path during
 * SSR (where there's no origin); share actions only run on the client. */
export function postPermalink(postId: number | string): string {
  const path = `/rants/${postId}`
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}
