---
name: start-work
description: Use when starting any new feature, fix, chore, documentation, refactor, or test work in this repository; updates development, creates a standardized branch, and opens a draft PR after the first commit.
---

# Start New Work

Always follow this sequence for new work.

## 1. Update development

Confirm that the working tree is safe to switch, then run:

```bash
git fetch origin
git switch development
git pull --ff-only origin development
```

Never start regular work from `main` or from another feature branch.

## 2. Create a standardized branch

Use `<type>/<short-kebab-description>`.

Allowed types:

- `feat` for new functionality
- `fix` for bug fixes
- `chore` for maintenance, tooling, dependencies, or configuration
- `docs` for documentation-only work
- `refactor` for behavior-preserving code changes
- `test` for test-only work

Examples:

```text
feat/project-filtering
fix/mobile-navigation
chore/update-ci-workflow
docs/development-guide
```

Create the branch:

```bash
git switch -c <type>/<short-kebab-description>
```

## 3. Open a draft pull request

GitHub requires at least one commit that differs from `development` before a
pull request can be created. Immediately after the first meaningful commit,
push the branch and open a draft pull request without waiting for the work to
be finished:

```bash
git push --set-upstream origin <type>/<short-kebab-description>
gh pr create --draft --base development --head <type>/<short-kebab-description> --fill
```

Keep the pull request in draft while implementation or verification remains.
Mark it ready only after all local checks pass and the requested work is
complete. Never retarget the pull request to `main`.
