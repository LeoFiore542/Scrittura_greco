import { useCallback, useState } from 'react'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { Editor } from './components/Editor'
import { Toolbar } from './components/Toolbar'
import { IssuesPanel } from './components/IssuesPanel'
import { PolytonicKeyboard } from './keyboard/PolytonicKeyboard'
import type { GrammarIssue } from './grammar/types'
import './App.css'

export default function App() {
  const [editor, setEditor] = useState<TiptapEditor | null>(null)
  const [issues, setIssues] = useState<GrammarIssue[]>([])

  const onEditorReady = useCallback((ed: TiptapEditor) => {
    setEditor(ed)
  }, [])

  const onIssues = useCallback((next: GrammarIssue[]) => {
    setIssues(next)
  }, [])

  return (
    <div className="app">
      <div className="app-glow" aria-hidden="true" />
      <Toolbar editor={editor} />
      <main className="workspace">
        <div className="workspace-main">
          <Editor onEditorReady={onEditorReady} onIssues={onIssues} />
          <PolytonicKeyboard editor={editor} />
        </div>
        <IssuesPanel issues={issues} />
      </main>
    </div>
  )
}
