# Repository Instructions

## Shared agent configuration

This file is the canonical repository instruction file. `CLAUDE.md` is a
symlink to this file, and `.claude/skills` is a symlink to `.opencode/skills`.
Keep shared instructions and skills in the canonical locations only.

Load the `start-work` skill before starting new work. Load the
`development-workflow` skill before doing pull request, release, CI, or
deployment work.

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
