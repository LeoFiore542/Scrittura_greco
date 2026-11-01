import type { GrammarIssue } from '../grammar/types'

interface Props {
  issues: GrammarIssue[]
}

export function IssuesPanel({ issues }: Props) {
  return (
    <aside className="issues" aria-live="polite">
      <h2>Controllo basilare</h2>
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
