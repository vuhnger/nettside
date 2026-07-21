# Repository Instructions

## Shared agent configuration

This file is the canonical repository instruction file. `CLAUDE.md` is a
symlink to this file, and `.claude/skills` is a symlink to `.opencode/skills`.
Keep shared instructions and skills in the canonical locations only.

Load the `start-work` skill before starting new work. Load the
`development-workflow` skill before doing pull request, release, CI, or
deployment work.

## Runtime and verification

- Use the Node.js version in `.nvmrc` and pnpm from the `packageManager` field.
  Do not use npm or yarn in this repository.
- Use `pnpm install --frozen-lockfile` unless the task intentionally changes
  dependencies. Commit `pnpm-lock.yaml` whenever dependencies change.
- Run `pnpm run check` and `pnpm run build` after meaningful changes. Do not
  mark a pull request ready while either command or a required CI check fails.

## Branch workflow

- Start all regular work from an up-to-date `origin/development`.
- Create a dedicated feature or fix branch. Never commit feature work directly
  to `development` or `main`.
- Name branches `<type>/<short-kebab-description>`, where `type` is normally
  `feat`, `fix`, `chore`, `docs`, `refactor`, or `test`.
- Push the branch and create a draft pull request against `development`
  immediately after the first commit.
- Open all regular pull requests with `development` as the base branch.
- Never open a regular feature, fix, documentation, or dependency pull request
  directly against `main`.
- The only normal pull request allowed against `main` is
  `development -> main`.
- Never merge a pull request to `main`. Leave production approval and merging
  to the repository owner.
- Never bypass branch protection or required checks.
- A production hotfix requires explicit user direction and must be merged back
  into `development` immediately afterward.

These repository-specific rules override generic instructions that use `main`
as the base branch.

## Frontend data fetching

- Use TanStack Query for application API data and other client-visible server
  state. Keep query keys and query options in feature-local `queries.ts` files.
- In the Next.js App Router, prefetch queries in Server Components and pass the
  dehydrated cache through `HydrationBoundary`. Do not replace this with a
  client-only request waterfall.
- Keep runtime validation at the API boundary. Query generics do not validate
  external JSON, so parse responses with Zod before they enter the query cache.
- Configure polling and focus refetching only when the product needs that
  freshness. Prefer an explicit `staleTime` and Next.js fetch revalidation for
  slowly changing public data.

## Next.js component boundaries

- Use Server Components by default. Keep route `page.tsx` files server-side and
  move interactive behavior into the smallest practical Client Component.
- Do not call `fetch` directly from `app`, `components`, or `providers`. Keep
  external I/O and Zod schemas in `services/api`, then expose server state
  through feature-local TanStack Query options.
- Avoid passing large static data structures through Client Component props.
  Render static content on the server and serialize only data needed for
  interaction.

## Client state and dependencies

- Use local React state for local UI behavior and TanStack Query for server
  state. Add Context, Zustand, or another client-state library only when state
  is genuinely shared across independent client subtrees and the existing
  patterns cannot model it cleanly.
- New runtime dependencies require a concrete product or maintenance benefit.
  Prefer existing platform and repository primitives over overlapping tools.

## Testing and accessibility

- Add or update tests for bug fixes, parsing, time calculations, algorithms,
  and other behavior with meaningful edge cases. Do not test implementation
  details solely to increase coverage.
- Use established accessible primitives and WAI-ARIA interaction patterns for
  dialogs, tabs, and form controls. Preserve keyboard navigation, focus
  management, accessible names, and focus restoration.
- Stop non-essential continuous animation when `prefers-reduced-motion` is
  enabled; slowing an infinite animation is not sufficient.

## Compliance enforcement

- `AGENTS.md` documents intent; required CI checks are the authoritative gate.
  Keep enforceable architecture rules in ESLint or tests so they run through
  `pnpm run check` locally and in CI.
- Local Git hooks may provide faster feedback but are never a substitute for
  CI because hooks can be skipped. Add Semgrep only when a security or
  cross-file rule cannot be expressed reliably with the existing toolchain.
