This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Usare l'agente personalizzato (NUOVO AGENTE)

Se vuoi che l'assistente locale usi l'agente personalizzato `NUOVO AGENTE`, segui questi passaggi:

1. Ricarica VS Code (Command Palette → "Developer: Reload Window") per applicare le impostazioni della workspace.
2. Apri l'estensione Copilot Chat e verifica che l'agente mostrato sia `NUOVO AGENTE`.
3. I file che determinano la preferenza sono:
	- `.agent.md` (descrive l'agente) — vedi [\.agent.md](.agent.md)
	- `.agent.default` (marker con il nome dell'agente) — vedi [.agent.default](.agent.default)
	- `.vscode/settings.json` (impostazione workspace) — vedi [.vscode/settings.json](.vscode/settings.json)

Esempi di prompt rapidi da provare con `NUOVO AGENTE`:

- "Analizza `app/tablet/doctor/page.tsx`: proponi architettura, correggi bug e applica patch." 
- "Crea un componente `Header` riusabile e sposta lo stile condiviso in token CSS." 
- "Progetta l'API per la gestione documenti (endpoints, validation, error handling)."

Se preferisci, posso aggiungere una sezione più dettagliata nella documentazione o automatizzare ulteriori regole di selezione dell'agente.
