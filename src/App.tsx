import { useCallback, useState } from 'react'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { Editor } from './components/Editor'
import { Toolbar } from './components/Toolbar'
import { IssuesPanel } from './components/IssuesPanel'
import { PolytonicKeyboard } from './keyboard/PolytonicKeyboard'
import { InstallPrompt } from './components/InstallPrompt'
import type { GrammarIssue } from './grammar/types'
import './App.css'

export default function App() {
  const [editor, setEditor] = useState<TiptapEditor | null>(null)
  const [issues, setIssues] = useState<GrammarIssue[]>([])
  const [issuesOpen, setIssuesOpen] = useState(false)

  const onEditorReady = useCallback((ed: TiptapEditor) => {
    setEditor(ed)
  }, [])

  const onIssues = useCallback((next: GrammarIssue[]) => {
    setIssues(next)
  }, [])

  return (
    <div className="app">
      <div className="app-glow" aria-hidden="true" />
      <Toolbar
        editor={editor}
        issuesOpen={issuesOpen}
        issueCount={issues.length}
        onToggleIssues={() => setIssuesOpen((v) => !v)}
      />
      <InstallPrompt />
      <main className="workspace">
        <div className="workspace-scroll">
          <Editor onEditorReady={onEditorReady} onIssues={onIssues} />
          <IssuesPanel
            issues={issues}
            open={issuesOpen}
            onClose={() => setIssuesOpen(false)}
          />
        </div>
        <PolytonicKeyboard editor={editor} />
      </main>
    </div>
  )
}
