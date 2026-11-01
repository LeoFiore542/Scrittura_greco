import { useCallback, useRef, useState, type PointerEvent } from 'react'
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
  const armedKey = useRef<string | null>(null)
  const rows = shiftRows(shifted)

  const run = useCallback(
    (fn: () => void) => {
      if (!editor) return
      fn()
    },
    [editor],
  )

  const insertChar = useCallback(
    (value: string) => {
      run(() => {
        editor!.chain().focus().insertContent(value).run()
        if (shifted) setShifted(false)
      })
    },
    [editor, run, shifted],
  )

  const applyMark = useCallback(
    (kind: DiacriticKind) => {
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
    },
    [editor, run],
  )

  const onKey = useCallback(
    (key: KeyAction) => {
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
    },
    [applyMark, editor, insertChar, run],
  )

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>, key: KeyAction, id: string) => {
    // Keep editor focus; suppress system keyboard / click delay.
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    armedKey.current = id
    onKey(key)
  }

  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    armedKey.current = null
  }

  return (
    <div className="keyboard-dock" role="group" aria-label="Tastiera greco antico">
      <div className="keyboard">
        {rows.map((row, i) => (
          <div className="keyboard-row" key={i}>
            {row.keys.map((key, j) => {
              const id = `${i}-${j}`
              const active = key.type === 'special' && key.action === 'shift' && shifted
              const title = key.type === 'diacritic' ? key.title : undefined
              const extra =
                key.type === 'special'
                  ? ` key-${key.action}`
                  : key.type === 'diacritic'
                    ? ' key-dia'
                    : ''
              return (
                <button
                  key={id}
                  type="button"
                  className={`key${extra}${active ? ' key-active' : ''}`}
                  title={title}
                  aria-label={title ?? key.label}
                  onPointerDown={(e) => handlePointerDown(e, key, id)}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <span className="key-label">{key.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
