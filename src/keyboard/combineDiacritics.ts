import { COMBINING } from '../grammar/diacriticRules'

export type DiacriticKind =
  | 'smooth'
  | 'rough'
  | 'acute'
  | 'grave'
  | 'circumflex'
  | 'iota'
  | 'diaeresis'

const MARK: Record<DiacriticKind, string> = {
  smooth: COMBINING.smooth,
  rough: COMBINING.rough,
  acute: COMBINING.acute,
  grave: COMBINING.grave,
  circumflex: COMBINING.circumflex,
  iota: COMBINING.iota,
  diaeresis: COMBINING.diaeresis,
}

const BREATHINGS: Set<string> = new Set([COMBINING.smooth, COMBINING.rough])
const ACCENTS: Set<string> = new Set([COMBINING.acute, COMBINING.grave, COMBINING.circumflex])

/**
 * Apply a diacritic to a single Greek character (possibly already accented).
 * Returns NFC-normalized result, or null if not applicable.
 */
export function applyDiacritic(char: string, kind: DiacriticKind): string | null {
  if (!char) return null
  const nfd = char.normalize('NFD')
  const base = nfd[0]
  if (!base) return null

  // Must start with a Greek letter or rho
  if (!/[\u0370-\u03FF\u1F00-\u1FFFΑ-Ωα-ω]/.test(base) && !/[ρΡ]/.test(base)) {
    // Strip already-composed check: base after NFD of Greek is often plain α-ω
    if (!/[Α-Ωα-ω]/.test(base)) return null
  }

  let marks = [...nfd.slice(1)].filter((c) => {
    const code = c.charCodeAt(0)
    return code >= 0x0300 && code <= 0x036f
  })

  const next = MARK[kind]

  if (BREATHINGS.has(next)) {
    marks = marks.filter((m) => !BREATHINGS.has(m))
    marks.push(next)
  } else if (ACCENTS.has(next)) {
    marks = marks.filter((m) => !ACCENTS.has(m))
    marks.push(next)
  } else if (next === COMBINING.iota) {
    marks = marks.filter((m) => m !== COMBINING.iota)
    marks.push(next)
  } else if (next === COMBINING.diaeresis) {
    marks = marks.filter((m) => m !== COMBINING.diaeresis)
    marks.push(next)
  }

  // Canonical-ish order: breathing, diaeresis, accent, iota
  const order = (m: string) => {
    if (BREATHINGS.has(m)) return 0
    if (m === COMBINING.diaeresis) return 1
    if (ACCENTS.has(m)) return 2
    if (m === COMBINING.iota) return 3
    return 4
  }
  marks.sort((a, b) => order(a) - order(b))

  return (base + marks.join('')).normalize('NFC')
}

export function isDiacriticKind(value: string): value is DiacriticKind {
  return value in MARK
}
