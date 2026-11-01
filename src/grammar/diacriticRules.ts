/** Combining marks used in polytonic Greek */
export const COMBINING = {
  smooth: '\u0313',
  rough: '\u0314',
  acute: '\u0301',
  grave: '\u0300',
  circumflex: '\u0342',
  iota: '\u0345',
  diaeresis: '\u0308',
} as const

const BREATHINGS: Set<string> = new Set([COMBINING.smooth, COMBINING.rough])
const ACCENTS: Set<string> = new Set([COMBINING.acute, COMBINING.grave, COMBINING.circumflex])
function isGreekLetter(ch: string): boolean {
  return /[\u0370-\u03FF\u1F00-\u1FFF]/.test(ch)
}

function isVowelBase(ch: string): boolean {
  const nfd = ch.normalize('NFD')
  const base = nfd[0] ?? ''
  return /[αεηιουωΑΕΗΙΟΥΩρΡ]/.test(base)
}

/**
 * Returns true if the word has an impossible diacritic sequence
 * (after NFC → NFD inspection).
 */
export function hasBadDiacritics(word: string): boolean {
  if (!word || ![...word].some(isGreekLetter)) return false

  const nfd = word.normalize('NFD')
  let i = 0
  while (i < nfd.length) {
    const base = nfd[i]
    if (!base || !isGreekLetter(base) && !/[αεηιουωΑΕΗΙΟΥΩρΡ]/.test(base)) {
      i++
      continue
    }

    const marks: string[] = []
    let j = i + 1
    while (j < nfd.length) {
      const code = nfd.charCodeAt(j)
      // Combining marks range
      if (code >= 0x0300 && code <= 0x036f) {
        marks.push(nfd[j]!)
        j++
      } else {
        break
      }
    }

    if (marks.length > 0) {
      const breathings = marks.filter((m) => BREATHINGS.has(m))
      const accents = marks.filter((m) => ACCENTS.has(m))
      const iotas = marks.filter((m) => m === COMBINING.iota)
      const diaereses = marks.filter((m) => m === COMBINING.diaeresis)

      if (breathings.length > 1) return true
      if (accents.length > 1) return true
      if (iotas.length > 1) return true
      if (diaereses.length > 1) return true

      // Accent / breathing / iota only on vowels (rho may take rough breathing)
      const baseLower = base.toLowerCase()
      const isRho = baseLower === 'ρ'
      const vowel = isVowelBase(base)

      if (!vowel && !isRho) return true
      if (isRho && (accents.length > 0 || iotas.length > 0 || diaereses.length > 0)) {
        return true
      }
      if (isRho && breathings.some((b) => b === COMBINING.smooth)) {
        // smooth on rho is unusual but not always "invalid"; still flag rough-only preference lightly — skip
      }
      if (diaereses.length && !/[ιυΙΥ]/.test(base)) return true
      if (iotas.length && !/[αηωΑΗΩ]/.test(base)) return true
    }

    i = j > i + 1 ? j : i + 1
  }

  return false
}
