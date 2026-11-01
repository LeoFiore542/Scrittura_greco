import { Extension } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Editor } from '@tiptap/react'
import type { GrammarIssue } from './types'

export const grammarHighlightKey = new PluginKey<DecorationSet>('grammarHighlight')

function buildDecorations(doc: ProseMirrorNode, issues: GrammarIssue[]): DecorationSet {
  const decorations: ReturnType<typeof Decoration.inline>[] = []
  const text = doc.textContent
  if (!text || issues.length === 0) return DecorationSet.empty

  const posAtOffset: number[] = new Array(text.length + 1)
  let offset = 0
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    for (let i = 0; i < node.text.length; i++) {
      posAtOffset[offset + i] = pos + i
    }
    offset += node.text.length
  })
  const last = posAtOffset[text.length - 1]
  posAtOffset[text.length] = last != null ? last + 1 : 1

  for (const issue of issues) {
    const from = posAtOffset[issue.from]
    const toExclusive = posAtOffset[issue.to - 1]
    if (from == null || toExclusive == null) continue
    const to = toExclusive + 1
    if (from >= to) continue
    decorations.push(
      Decoration.inline(from, to, {
        class:
          issue.kind === 'bad_diacritics'
            ? 'grammar-bad-diacritics'
            : 'grammar-unknown',
        title: issue.message,
      }),
    )
  }

  return DecorationSet.create(doc, decorations)
}

export const GrammarHighlight = Extension.create({
  name: 'grammarHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: grammarHighlightKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            const meta = tr.getMeta(grammarHighlightKey) as GrammarIssue[] | undefined
            if (meta) {
              return buildDecorations(tr.doc, meta)
            }
            if (tr.docChanged) {
              return old.map(tr.mapping, tr.doc)
            }
            return old
          },
        },
        props: {
          decorations(state) {
            return grammarHighlightKey.getState(state)
          },
        },
      }),
    ]
  },
})

export function setGrammarIssues(editor: Editor, issues: GrammarIssue[]) {
  const tr = editor.state.tr.setMeta(grammarHighlightKey, issues)
  editor.view.dispatch(tr)
}
