import type { DiacriticKind } from './combineDiacritics'

export type KeyAction =
  | { type: 'char'; label: string; value: string }
  | { type: 'diacritic'; label: string; kind: DiacriticKind; title: string }
  | { type: 'special'; label: string; action: 'backspace' | 'space' | 'enter' | 'shift' }

export interface KeyboardRow {
  keys: KeyAction[]
}

/** Lowercase polytonic layout (QWERTY-Greek / Perseids-inspired). */
export const LOWER_ROWS: KeyboardRow[] = [
  {
    keys: [
      { type: 'char', label: ';', value: '·' },
      { type: 'char', label: 'ς', value: 'ς' },
      { type: 'char', label: 'ε', value: 'ε' },
      { type: 'char', label: 'ρ', value: 'ρ' },
      { type: 'char', label: 'τ', value: 'τ' },
      { type: 'char', label: 'υ', value: 'υ' },
      { type: 'char', label: 'θ', value: 'θ' },
      { type: 'char', label: 'ι', value: 'ι' },
      { type: 'char', label: 'ο', value: 'ο' },
      { type: 'char', label: 'π', value: 'π' },
      { type: 'diacritic', label: '͂', kind: 'circumflex', title: 'Circonflesso' },
      { type: 'diacritic', label: '̀', kind: 'grave', title: 'Grave' },
      { type: 'special', label: '⌫', action: 'backspace' },
    ],
  },
  {
    keys: [
      { type: 'char', label: 'α', value: 'α' },
      { type: 'char', label: 'σ', value: 'σ' },
      { type: 'char', label: 'δ', value: 'δ' },
      { type: 'char', label: 'φ', value: 'φ' },
      { type: 'char', label: 'γ', value: 'γ' },
      { type: 'char', label: 'η', value: 'η' },
      { type: 'char', label: 'ξ', value: 'ξ' },
      { type: 'char', label: 'κ', value: 'κ' },
      { type: 'char', label: 'λ', value: 'λ' },
      { type: 'diacritic', label: '́', kind: 'acute', title: 'Acuto' },
      { type: 'diacritic', label: '̓', kind: 'smooth', title: 'Spirito dolce' },
      { type: 'diacritic', label: '̔', kind: 'rough', title: 'Spirito aspro' },
      { type: 'special', label: '↵', action: 'enter' },
    ],
  },
  {
    keys: [
      { type: 'special', label: '⇧', action: 'shift' },
      { type: 'char', label: 'ζ', value: 'ζ' },
      { type: 'char', label: 'χ', value: 'χ' },
      { type: 'char', label: 'ψ', value: 'ψ' },
      { type: 'char', label: 'ω', value: 'ω' },
      { type: 'char', label: 'β', value: 'β' },
      { type: 'char', label: 'ν', value: 'ν' },
      { type: 'char', label: 'μ', value: 'μ' },
      { type: 'char', label: ',', value: ',' },
      { type: 'char', label: '.', value: '.' },
      { type: 'diacritic', label: 'ͅ', kind: 'iota', title: 'Iota sottoscritto' },
      { type: 'diacritic', label: '̈', kind: 'diaeresis', title: 'Dieresi' },
      { type: 'char', label: ';', value: ';' },
    ],
  },
  {
    keys: [{ type: 'special', label: 'spazio', action: 'space' }],
  },
]

const UPPER_MAP: Record<string, string> = {
  α: 'Α',
  β: 'Β',
  γ: 'Γ',
  δ: 'Δ',
  ε: 'Ε',
  ζ: 'Ζ',
  η: 'Η',
  θ: 'Θ',
  ι: 'Ι',
  κ: 'Κ',
  λ: 'Λ',
  μ: 'Μ',
  ν: 'Ν',
  ξ: 'Ξ',
  ο: 'Ο',
  π: 'Π',
  ρ: 'Ρ',
  σ: 'Σ',
  ς: 'Σ',
  τ: 'Τ',
  υ: 'Υ',
  φ: 'Φ',
  χ: 'Χ',
  ψ: 'Ψ',
  ω: 'Ω',
}

export function shiftRows(shifted: boolean): KeyboardRow[] {
  if (!shifted) return LOWER_ROWS
  return LOWER_ROWS.map((row) => ({
    keys: row.keys.map((key) => {
      if (key.type !== 'char') return key
      const upper = UPPER_MAP[key.value]
      if (!upper) return key
      return { ...key, label: upper, value: upper }
    }),
  }))
}
