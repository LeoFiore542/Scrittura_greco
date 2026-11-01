import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { applyDiacritic, type DiacriticKind } from './combineDiacritics'
import { shiftRows, type KeyAction } from './layout'
import './keyboard.css'

interface Props {
  editor: Editor | null
}

function getCharBeforeCursor(editor: Editor): { char: string; from: number; to: number } | null {
  const { $from } = editor.state.selection
  const pos = $from.pos
  if (pos <= 0) return null

  // Walk back one grapheme-ish: take last character of text before cursor in this node
  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - 8),
    $from.parentOffset,
    '',
  )
  if (!textBefore) return null

  const chars = [...textBefore]
  const char = chars[chars.length - 1]
  if (!char) return null

  const from = pos - char.length
  const to = pos
  if (from < 0) return null
  return { char, from, to }
}

export function PolytonicKeyboard({ editor }: Props) {
  const [shifted, setShifted] = useState(false)
  const rows = shiftRows(shifted)

  const run = (fn: () => void) => {
    if (!editor) return
    fn()
  }

  const insertChar = (value: string) => {
    run(() => {
      editor!.chain().focus().insertContent(value).run()
      if (shifted) setShifted(false)
    })
  }

  const applyMark = (kind: DiacriticKind) => {
    run(() => {
      const before = getCharBeforeCursor(editor!)
      if (!before) return
      const combined = applyDiacritic(before.char, kind)
      if (!combined) return
      editor!
        .chain()
        .focus()
        .deleteRange({ from: before.from, to: before.to })
        .insertContent(combined)
        .run()
    })
  }

  const onKey = (key: KeyAction) => {
    if (key.type === 'char') {
      insertChar(key.value)
      return
    }
    if (key.type === 'diacritic') {
      applyMark(key.kind)
      return
    }
    switch (key.action) {
      case 'backspace':
        run(() => {
          const { empty } = editor!.state.selection
          if (!empty) {
            editor!.chain().focus().deleteSelection().run()
            return
          }
          const before = getCharBeforeCursor(editor!)
          if (!before) return
          editor!.chain().focus().deleteRange({ from: before.from, to: before.to }).run()
        })
        break
      case 'space':
        insertChar(' ')
        break
      case 'enter':
        run(() => editor!.chain().focus().splitBlock().run())
        break
      case 'shift':
        setShifted((s) => !s)
        break
    }
  }

  return (
    <div className="keyboard" role="group" aria-label="Tastiera greco antico">
      {rows.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {row.keys.map((key, j) => {
            const wide =
              key.type === 'special' &&
              (key.action === 'space' || key.action === 'shift' || key.action === 'enter' || key.action === 'backspace')
            const active = key.type === 'special' && key.action === 'shift' && shifted
            const title = key.type === 'diacritic' ? key.title : undefined
            return (
              <button
                key={`${i}-${j}`}
                type="button"
                className={`key${wide ? ` key-${key.type === 'special' ? key.action : ''}` : ''}${active ? ' key-active' : ''}${key.type === 'diacritic' ? ' key-dia' : ''}`}
                title={title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onKey(key)}
              >
                {key.label}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
