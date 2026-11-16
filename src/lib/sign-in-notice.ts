/*
 * Splits the approved sign-in notice (content/public-site.ts, task 2-3) into text and link parts.
 * Returns null when the sentence is missing or does not contain both {terms} and {privacy}, so a
 * half-finished notice is never shown.
 */
export type NoticePart = { kind: 'text'; text: string } | { kind: 'link'; to: '/terms' | '/privacy'; text: string }

const LINKS = { terms: { to: '/terms', text: 'Terms of Use' }, privacy: { to: '/privacy', text: 'Privacy Policy' } } as const

export function signInNoticeParts(sentence: string | null): NoticePart[] | null {
  if (!sentence || !sentence.includes('{terms}') || !sentence.includes('{privacy}')) return null
  return sentence
    .split(/(\{terms\}|\{privacy\})/)
    .filter(Boolean)
    .map((piece): NoticePart => {
      if (piece === '{terms}') return { kind: 'link', ...LINKS.terms }
      if (piece === '{privacy}') return { kind: 'link', ...LINKS.privacy }
      return { kind: 'text', text: piece }
    })
}
