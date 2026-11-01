# Scrittura Greco

Editor web per scrivere in **greco antico politonico**, con tastiera digitale e controllo grammaticale basilare (client-side). Deploy statico su **GitHub Pages**.

## Funzionalità

- Foglio di scrittura (TipTap) con grassetto, corsivo, annulla/ripeti
- Tastiera digitale greca: lettere, spiriti, accenti, iota sottoscritto, dieresi
- Controllo in tempo reale: forme fuori lessico e diacritici sospetti
- Esporta `.txt` / `.md`, copia negli appunti

La grammatica attuale usa un lessico di base. L’interfaccia `GrammarProvider` è pronta per un futuro provider AI.

## Sviluppo locale

```bash
npm install
npm run dev
```

Build di produzione:

```bash
npm run build
npm run preview
```

## Deploy su GitHub Pages

1. Crea un repository GitHub e fai push di questo progetto
2. In **Settings → Pages → Build and deployment**, scegli **GitHub Actions**
3. Al push su `main`/`master`, il workflow `.github/workflows/deploy-pages.yml` pubblica `dist`

La `base` di Vite è `./`, così l’app funziona anche come project site (`https://USER.github.io/REPO/`).

## Struttura

- `src/components` — editor, toolbar, pannello avvisi
- `src/keyboard` — tastiera politonica e combinazione diacritici
- `src/grammar` — tokenizer, regole diacritici, `BasicLexiconProvider`
- `src/data/lexicon.json` — forme riconosciute (estensibile)
