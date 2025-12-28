# Nettside

Personlig portfolio bygget med Next.js App Router, Designsystemet fra DigDir og Tailwind. Inneholder CV, prosjekter og små visualiseringer/eksperimenter.

## Kjør lokalt

```bash
npm install
npm run dev
```

Åpne http://localhost:3000

## Build og start

```bash
npm run build
npm run start
```

## Deploy (Vercel)

- Push til repo og la Vercel bygge automatisk, eller:
```bash
vercel
vercel --prod
```





## Commitzen

Dette prosjektet bruker commitzen for strukturerte commit-meldinger og sporbarhet.

[Commitzen](https://commitizen-tools.github.io/commitizen/)

`cz commit`
`> følg instruks`


## Avhengigheter (kort)

Runtime:
- `next`, `react`, `react-dom` – app og rendering
- `@digdir/designsystemet-*` – design tokens/komponenter
- `tailwindcss` + `tw-animate-css` – styling/anim
- `framer-motion` – animasjoner
- `react-icons` – ikoner
- `next-themes` – light/dark
- `swr` – data fetching
- `react-hook-form` + `zod` – skjema + validering
- `@vercel/analytics` – analytics

Tooling:
- `typescript`, `eslint`, `eslint-config-next`
