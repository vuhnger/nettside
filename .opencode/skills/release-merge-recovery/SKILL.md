---
name: release-merge-recovery
description: Use when merging PRs into development, promoting development to main, or recovering stranded commits and conflicting release PRs in this repo. Captures that development squash-merges (which can drop late commits) while main uses merge commits, plus how to reconcile a diverged main for a development -> main release.
---

# Release & Merge Recovery

Repo-specific merge behaviour and recovery steps, learned the hard way. Read
alongside the `development-workflow` skill (this one only covers the sharp
edges).

## How each branch merges

- **PRs into `development` are squash-merged.** The whole branch collapses into
  one new commit on `development`; the branch's individual commit hashes are
  NOT ancestors of `development`.
- **Releases into `main` use merge commits** (`Merge pull request #NN from
  vuhnger/development`), so `main` keeps history.
- Both `development` and `main` are protected — you cannot push to them
  directly. Every change lands through a PR.
- The repo allows all three merge methods, so you can pick "Create a merge
  commit" per-PR when history must be preserved (see release recovery below).

## The squash-drop trap (this happened twice: #111 and #112)

The owner merges a PR the moment it is marked ready and CI is green — often
within minutes. Because `development` squash-merges, any commit pushed AFTER the
PR is marked ready but BEFORE it is merged gets stranded: its content never
reaches `development`.

Rules:

- **Before pushing more work onto an existing PR branch, verify it is still
  open:** `gh pr view <n> --json state,mergeable`. If it is merged, stop and
  recover.
- After a squash merge the branch's commits are not ancestors of `development`.
  Verify what actually landed by FILE, not by commit hash:
  `git cat-file -e origin/development:<path> && echo present`.
- **Recovery:** branch fresh from `origin/development`, cherry-pick the stranded
  commits, open a new PR. (This is exactly how #113 recovered the commit that
  the #112 squash dropped.)
- Keep every PR self-contained and merge-ready as a single unit. Do not rely on
  pushing follow-up commits to an already-ready PR.

## Reconciling a CONFLICTING `development -> main` release

`main` accumulates its own release/merge commits, so it drifts from
`development` over time and the `development -> main` PR eventually reports
CONFLICTING — even though `development` already contains everything of value and
`main` only holds older state.

`development` is authoritative for a release. Reconcile by bringing `main`'s
history into `development` while keeping `development`'s tree byte-for-byte:

```bash
git switch development && git pull --ff-only origin development
# confirm main has nothing unique first (should list only known-dead files):
git diff --name-only --diff-filter=A origin/development origin/main
# keep development's tree exactly, just absorb main's history:
git merge -s ours origin/main -m "Merge main into development for release"
git diff origin/development --stat   # MUST be empty — tree unchanged
```

Because `development` is protected, push this through an intermediate PR
(`chore/reconcile-main-into-development -> development`). It intentionally shows
**0 file changes** — it only pulls history in.

- **Merge the reconcile PR with "Create a merge commit", NOT squash.** A squash
  drops the second parent, so `main` never becomes an ancestor and the release
  PR stays conflicting.
- After it merges, the `development -> main` release PR is conflict-free. The
  owner merges that one (merge commit) to ship to production.

## Deployment reality check

Vercel Production deploys only from `main`. Work merged to `development` is live
on Preview URLs, not on `vuhnger.dev`. If a change "isn't live", first confirm it
is actually in `main` (`git cat-file -e origin/main:<path>`), not just in
`development` — a pending `development -> main` release is the usual cause.
