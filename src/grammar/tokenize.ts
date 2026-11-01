export interface GreekToken {
  word: string
  from: number
  to: number
}

/** Match polytonic Greek words (letters + combining marks). */
const GREEK_WORD =
  /[\u0370-\u03FF\u1F00-\u1FFF]+(?:[\u0300-\u036F]+[\u0370-\u03FF\u1F00-\u1FFF]*)*/gu

export function tokenizeGreek(text: string): GreekToken[] {
  const normalized = text.normalize('NFC')
  const tokens: GreekToken[] = []
  let match: RegExpExecArray | null
  const re = new RegExp(GREEK_WORD.source, GREEK_WORD.flags)
  while ((match = re.exec(normalized)) !== null) {
    tokens.push({
      word: match[0],
      from: match.index,
      to: match.index + match[0].length,
    })
  }
  return tokens
}
