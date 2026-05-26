// Curated "pain-point" hashtags — the single source of truth used by both the
// composer (suggestions) and the "وين الوجع؟" trends panel. They always appear
// even with no posts yet; real tags from the API rise above them by count.
export const SUGGESTED_TAGS = [
  'عميل_راسُه_يابس',
  'الكود_كان_شغال',
  'قبل_الديمو',
  'CSS_ليش',
  'اجتماع_ما_اله_داعي',
  'ديبلوي_فاشل',
  'تعبت_والله',
]

export interface TagCount {
  tag: string
  count: number
}

/**
 * Merge live tag counts from the API with the curated list so the curated
 * pain-points are always present (count 0 if unused), then rank like trends:
 * highest count first, ties fall back to the curated order.
 */
export function mergeWithSuggested(apiTags: TagCount[]): TagCount[] {
  const counts = new Map<string, number>()
  apiTags.forEach((item) => counts.set(item.tag, item.count))
  SUGGESTED_TAGS.forEach((tag) => {
    if (!counts.has(tag)) counts.set(tag, 0)
  })
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || suggestedRank(a.tag) - suggestedRank(b.tag),
  )
}

function suggestedRank(tag: string): number {
  const index = SUGGESTED_TAGS.indexOf(tag)
  return index === -1 ? SUGGESTED_TAGS.length : index
}
