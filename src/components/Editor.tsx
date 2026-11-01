import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { GrammarHighlight, setGrammarIssues } from '../grammar/GrammarHighlight'
import { basicGrammarProvider } from '../grammar/BasicLexiconProvider'
import type { GrammarIssue } from '../grammar/types'
import type { Editor as TiptapEditor } from '@tiptap/react'

interface Props {
  onEditorReady: (editor: TiptapEditor) => void
  onIssues: (issues: GrammarIssue[]) => void
  onTextChange?: (text: string) => void
}

export function Editor({ onEditorReady, onIssues, onTextChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({
        placeholder: 'Γράφε ἐνθάδε… Tocca la tastiera sotto…',
      }),
      GrammarHighlight,
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose-greek',
        spellcheck: 'false',
        lang: 'grc',
        // Suppress system soft keyboard on tablets; use on-screen Greek keyboard.
        inputmode: 'none',
        enterkeyhint: 'done',
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        virtualkeyboardpolicy: 'manual',
      },
    },
  })

  useEffect(() => {
    if (editor) onEditorReady(editor)
  }, [editor, onEditorReady])

  useEffect(() => {
    if (!editor) return

    const el = editor.view.dom as HTMLElement
    el.setAttribute('inputmode', 'none')
    el.setAttribute('enterkeyhint', 'done')
    el.setAttribute('virtualkeyboardpolicy', 'manual')

    let timer: ReturnType<typeof setTimeout> | undefined
    let generation = 0

    const runCheck = async () => {
      const gen = ++generation
      const text = editor.getText()
      onTextChange?.(text)
      const issues = await basicGrammarProvider.check(text)
      if (gen !== generation) return
      setGrammarIssues(editor, issues)
      onIssues(issues)
    }

    const onUpdate = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        void runCheck()
      }, 300)
    }

    editor.on('update', onUpdate)
    void runCheck()

    return () => {
      clearTimeout(timer)
      editor.off('update', onUpdate)
    }
  }, [editor, onIssues, onTextChange])

  return (
    <div className="sheet">
      <EditorContent editor={editor} />
    </div>
  )
}
