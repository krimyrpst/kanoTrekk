# kanoTrekk

Liten webapp som tar bilder av deltakere via telefonkameraet og fordeler dem tilfeldig på et konfigurerbart antall kanoer — med slot-machine-animasjon for selve trekningen. Alt kjører i nettleseren, ingen server, ingen data forlater enheten.

## Utvikling

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest, dekker fordelingsalgoritmen
npm run build        # Statisk eksport til out/
```

## Deploy: GitHub Pages

Repo-navnet antas å være `kanoTrekk` (gir URL `https://<bruker>.github.io/kanoTrekk/`).

1. Push til `main`.
2. I repo-settings: **Pages → Source = GitHub Actions**.
3. Workflowen `.github/workflows/deploy.yml` bygger og deployer automatisk.

### Endre repo-navn eller bruke egendefinert domene

`basePath` styres av env-var `NEXT_PUBLIC_BASE_PATH` (default `/kanoTrekk`). Tre filer må holdes i sync:

- `next.config.js` — `repoBasePath`
- `src/lib/config.ts` — `BASE_PATH` (leser samme env-var)
- `.github/workflows/deploy.yml` — `NEXT_PUBLIC_BASE_PATH`-env

For egendefinert domene: sett `NEXT_PUBLIC_BASE_PATH=""` i workflow-en, legg `public/CNAME` med domenet, og konfigurer DNS.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (state) + idb (IndexedDB wrapper)
- framer-motion (kun for kortinngang-animasjon)
- Vitest (unit-tester for fordelingsalgoritmen)
