Titolo: chore(ui): design tokens, dark-mode toggle, sidebar touch targets, typography

Descrizione

Questa PR introduce una serie di rifiniture estetiche e di usabilità per l'app:

- Introduce token di design in `app/globals.css` (colori, radius, shadow, focus), import dei font e scala tipografica.
- Aggiunge supporto esplicito per dark mode tramite `data-theme="dark"` e un toggle tema nella `Sidebar` (la scelta viene salvata in `localStorage`).
- Refactor dei componenti UI principali in `app/components/ui/`: `Button.tsx`, `Card.tsx`, `Input.tsx` per utilizzare i token e migliorare focus/hover/ombre.
- Migliora `Sidebar.tsx` per touch targets (min-height, padding, icone più grandi) e sposta il toggle del tema nella footer della sidebar per migliore accessibilità su tablet.
- Aggiunto uno script dev `tools/fetch_pages.js` per salvare snapshot HTML locali (usato per verifiche rapide).

File principali modificati

- `app/globals.css` — token, tipografia, font import, focus styles
- `app/components/ui/Button.tsx` — usa token per radius e shadow
- `app/components/ui/Card.tsx` — usa token per radius/shadow
- `app/components/ui/Input.tsx` — radius, focus transition
- `app/LayoutWrapper.tsx` — rimosso toggle fisso; il controllo tema è gestito dalla sidebar
- `app/Sidebar.tsx` — touch targets, toggle tema, layout tweaks
- `tools/fetch_pages.js` — helper per salvare HTML di pagine locali (dev)

How to test

1. Installa dipendenze:

```bash
npm install
```

2. Build e start in locale (uso porta 3001 evitata conflitti):

```bash
npm run build
npm run start -p 3001
```

3. Apri le pagine e verifica:
- `/` — layout generale
- `/dashboard` — card, bottoni, tipografia
- `/patients` — lista e input
- Controlla il toggle tema nella `Sidebar` e verifica che la preferenza sia persistente.

Note

- Le chiavi Supabase di produzione sono già state aggiunte a Vercel in una fase precedente; assicurati di non commitare segreti nel repo.
- Se preferisci che il toggle tema sia posizionato altrove (header o footer), lo riposizioniamo facilmente.

Commit message suggerito

```
chore(ui): design tokens, dark-mode toggle, sidebar touch targets, typography
```

Se vuoi, posso anche:
- creare automaticamente il branch e il commit (se `git` fosse disponibile nell'ambiente), oppure
- generare istruzioni/command per aprire la PR via `gh` CLI.
