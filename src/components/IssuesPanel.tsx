import type { GrammarIssue } from '../grammar/types'

interface Props {
  issues: GrammarIssue[]
  open: boolean
  onClose: () => void
}

export function IssuesPanel({ issues, open, onClose }: Props) {
  if (!open) return null

  return (
    <aside className="issues-sheet" aria-live="polite">
      <div className="issues-sheet-header">
        <h2>Controllo basilare</h2>
        <button type="button" className="issues-close" onClick={onClose} aria-label="Chiudi avvisi">
          Chiudi
        </button>
      </div>
      <p className="issues-hint">
        Lessico di base e diacritici. L’analisi AI arriverà in seguito.
      </p>
      {issues.length === 0 ? (
        <p className="issues-ok">Nessun avviso sul testo attuale.</p>
      ) : (
        <ul>
          {issues.map((issue) => (
            <li key={issue.id} className={`issue issue-${issue.kind}`}>
              <span className="issue-word">{issue.word}</span>
              <span className="issue-msg">{issue.message}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
