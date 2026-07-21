# Nettside

Personlig portfolio bygget med Next.js App Router, Designsystemet fra DigDir
og Tailwind. Inneholder CV, prosjekter og små visualiseringer/eksperimenter.

## Kjør lokalt

Krav: Node.js 24 og pnpm 11.

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

Åpne http://localhost:3000.

## Kvalitetssjekker

```bash
pnpm run lint
pnpm run typecheck
pnpm run check
pnpm run build
```

`pnpm run check` kjører lint og TypeScript-sjekk. GitHub Actions kjører
`pnpm install --frozen-lockfile`, `pnpm run check` og `pnpm run build` for pull requests og pushes mot
`development` og `main`.

Prosjektet har foreløpig ingen automatiserte enhets- eller ende-til-ende-tester.

## Brancher og pull requests

- `development` er GitHubs default branch og integrasjonsmiljø.
- Opprett feature- og fix-brancher fra oppdatert `development`.
- Alle vanlige pull requests skal ha `development` som base.
- `main` er produksjonsbranchen og mottar bare release-PR-er fra
  `development`.
- Release-PR-en til `main` merges av repository owner etter godkjenning og
  beståtte checks.
- Dependabot sender oppdateringer til `development`.

Eksempel på vanlig utviklingsflyt:

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch -c feat/min-endring

# Gjør endringer og kjør pnpm run check og pnpm run build.

git push -u origin feat/min-endring
gh pr create --base development --head feat/min-endring --fill
```

En produksjonsrelease opprettes som `development -> main`. Agenter skal aldri
merge release-PR-en. En eventuell hotfix direkte mot produksjonsløpet krever
eksplisitt beslutning og må tilbakeføres til `development` etterpå.

## Deploy med Vercel

- Pull requests får en isolert Vercel Preview deployment.
- Pushes til `development` gir et oppdatert preview av integrasjonsbranchen.
- Bare `main` er Vercel Production Branch.
- Produksjon deployes automatisk når en godkjent release-PR merges til `main`.

Manuell lokal preview kan startes med `vercel`. `vercel --prod` skal ikke
brukes som del av normal releaseflyt, fordi det omgår branchen som
produksjonsgate.

## Delt agentkonfigurasjon

`AGENTS.md` er kanonisk instruksjonsfil for agenter. `CLAUDE.md` er en symlink
til denne filen.

Skills vedlikeholdes kun i `.opencode/skills`. `.claude/skills` er en symlink
til samme mappe, slik at OpenCode og Claude Code bruker identiske skills.

Den delte `start-work`-skillen standardiserer oppstart fra `development`,
branch-navn og tidlig draft-PR. `development-workflow` beskriver PR-, release-,
CI- og deployflyten. Etter endringer i OpenCode-konfigurasjon eller skills må
OpenCode startes på nytt for å laste dem inn.

## Viktige avhengigheter

Runtime:

- `next`, `react`, `react-dom` - app og rendering
- `@digdir/designsystemet-*` - design tokens og komponenter
- `tailwindcss` og `tw-animate-css` - styling og animasjon
- `framer-motion` - animasjoner
- `react-icons` - ikoner
- `react-hook-form` og `zod` - skjema og runtime-validering av API-data
- `@vercel/analytics` - analytics

Tooling:

- `typescript`
- `eslint`
- `eslint-config-next`
