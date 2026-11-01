import type { Editor } from '@tiptap/react'

interface Props {
  editor: Editor | null
}

function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function Toolbar({ editor }: Props) {
  const disabled = !editor

  return (
    <div className="toolbar" role="toolbar" aria-label="Strumenti">
      <div className="toolbar-brand">
        <span className="brand-mark">αβ</span>
        <div>
          <p className="brand-name">Scrittura Greco</p>
          <p className="brand-sub">Editor politonico</p>
        </div>
      </div>

      <div className="toolbar-actions">
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor?.chain().focus().undo().run()}
          title="Annulla"
        >
          Annulla
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => editor?.chain().focus().redo().run()}
          title="Ripeti"
        >
          Ripeti
        </button>
        <button
          type="button"
          disabled={disabled}
          className={editor?.isActive('bold') ? 'is-active' : ''}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Grassetto
        </button>
        <button
          type="button"
          disabled={disabled}
          className={editor?.isActive('italic') ? 'is-active' : ''}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          Corsivo
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!editor) return
            editor.commands.clearContent(true)
            editor.commands.focus()
          }}
        >
          Nuovo
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={async () => {
            if (!editor) return
            await navigator.clipboard.writeText(editor.getText())
          }}
        >
          Copia
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!editor) return
            downloadText('testo-greco.txt', editor.getText(), 'text/plain;charset=utf-8')
          }}
        >
          .txt
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!editor) return
            downloadText('testo-greco.md', editor.getText(), 'text/markdown;charset=utf-8')
          }}
        >
          .md
        </button>
      </div>
    </div>
  )
}
