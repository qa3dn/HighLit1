/** Developer rank codes (backend User.rank) → Arabic labels. Shared so every
 * surface (public profile, room header) presents ranks identically. Unknown
 * codes fall back to the raw value rather than rendering an empty badge. */
const RANK_LABELS: Record<string, string> = {
  NOVICE: 'مبتدئ',
  INTERN: 'متدرّب',
  JUNIOR: 'مطوّر مبتدئ',
  MID: 'مطوّر',
  SENIOR: 'خبير',
  LEAD: 'قائد فريق',
  ARCHITECT: 'مهندس برمجيات',
  LEGEND: 'أسطورة',
}

export function rankLabel(rank: string | undefined | null): string {
  if (!rank) return ''
  return RANK_LABELS[rank.toUpperCase()] ?? rank
}
