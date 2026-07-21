---
name: development-workflow
description: Use for branches, pull requests, GitHub CI, releases, Dependabot, or Vercel deployments in this repository; enforces development as the integration base and main as owner-approved production.
---

# Development Workflow

Use `development` as the integration branch and `main` as the production
branch. Vercel Preview deployments validate pull requests and `development`;
Vercel Production deploys only `main`.

## Start work

Before creating a feature or fix branch:

```bash
git fetch origin
git switch development
git pull --ff-only origin development
git switch -c <type>/<short-description>
```

Do not start regular work from `main`. Do not commit directly to either
protected branch.

## Pull requests

- Set `development` as the base for every regular pull request, including
  features, fixes, documentation, maintenance, and dependency updates.
- Pass the repository CI and Vercel Preview checks before considering work
  complete.
- Do not retarget a regular pull request to `main`.
- Do not merge by bypassing branch protection or required checks.

Example:

```bash
gh pr create --base development --head <branch> --fill
```

## Production releases

Production is promoted with a pull request whose head is `development` and
whose base is `main`.

```bash
gh pr create --base main --head development --title "Release development to production"
```

- Create a release pull request only when the user explicitly requests a
  release.
- Never merge a pull request to `main`; the repository owner reviews and
  merges it.
- Never use admin bypass for an agent-authored merge.
- Do not push directly to `main`.

## Hotfixes

Only use a `main`-based hotfix when the user explicitly requests an emergency
production fix. After release, immediately merge the hotfix back through a
pull request to `development` so the branches do not drift.
