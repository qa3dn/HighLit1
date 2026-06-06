/** Company size choices (backend Company.size) → Arabic labels. Shared so the
 * public page and the settings form agree on the wording. */
export const SIZE_LABEL: Record<string, string> = {
  SOLO: 'موظف واحد',
  SMALL: '2-10 موظفين',
  MEDIUM: '11-50 موظفاً',
  LARGE: '51-200 موظف',
  ENTERPRISE: 'أكثر من 200 موظف',
}

/** Parse + validate a user-supplied URL, returning it only if it is safe to
 * link to (http/https). Rejects javascript:/data: and malformed input. */
export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

/** The display host of a URL (e.g. "example.com"), or null if invalid. */
export function urlHost(raw: string | null | undefined): string | null {
  const safe = safeExternalUrl(raw)
  if (!safe) return null
  try {
    return new URL(safe).host
  } catch {
    return null
  }
}
