import lexicon from '../data/lexicon.json'
import { hasBadDiacritics } from './diacriticRules'
import { tokenizeGreek } from './tokenize'
import type { GrammarIssue, GrammarProvider } from './types'

const forms = new Set(
  (lexicon.forms as string[]).map((f) => f.normalize('NFC').toLowerCase()),
)

export class BasicLexiconProvider implements GrammarProvider {
  async check(text: string): Promise<GrammarIssue[]> {
    const normalized = text.normalize('NFC')
    const tokens = tokenizeGreek(normalized)
    const issues: GrammarIssue[] = []

    for (const token of tokens) {
      if (hasBadDiacritics(token.word)) {
        issues.push({
          id: `dia-${token.from}-${token.to}`,
          kind: 'bad_diacritics',
          message: 'Combinazione diacritici sospetta',
          from: token.from,
          to: token.to,
          word: token.word,
        })
        continue
      }

      const key = token.word.toLowerCase()
      if (!forms.has(key)) {
        issues.push({
          id: `unk-${token.from}-${token.to}`,
          kind: 'unknown_form',
          message: 'Forma non riconosciuta nel lessico di base',
          from: token.from,
          to: token.to,
          word: token.word,
        })
      }
    }

    return issues
  }
}

export const basicGrammarProvider = new BasicLexiconProvider()
