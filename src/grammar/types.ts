export type GrammarIssueKind = 'unknown_form' | 'bad_diacritics'

export interface GrammarIssue {
  id: string
  kind: GrammarIssueKind
  message: string
  /** Character offset in plain text (from doc.textContent) */
  from: number
  to: number
  word: string
}

export interface GrammarProvider {
  check(text: string): Promise<GrammarIssue[]>
}
