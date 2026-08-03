# ProjectCard Final Review Fix Report

## Findings addressed

- Important 1: Updated both ProjectCard citation assertions to query the Astryx
  Citation semantic role, `doc-noteref`, with the exact accessible name
  `Citation 1: GitHub repository`. Both assertions retain the `href` check
  against `project.githubUrl`.
- Minor 1: Strengthened the section-label assertion using the stable Astryx
  Text DOM contract already used by `apps/github.io/src/app/skills/skill-card.spec.tsx`:
  `data-type="supporting"` and `data-color="secondary"`. The existing
  `astryx-text` class check remains as a structural guard.

## Commands run and exact results

1. `pnpm nx test github.io`
   - Exit code: `1`
   - Exact failure output before Nx started:
     ```text
     [ERR_SQLITE_ERROR] unable to open database file

     pnpm: unable to open database file
     [ERR_PNPM_META_FETCH_FAIL] GET https://registry.npmjs.org/pnpm: fetch failed
     [ERROR] Command failed with exit code 1: /home/benkim0414/.local/share/mise/installs/pnpm/11.16.0/pnpm install
     pnpm: Command failed with exit code 1: /home/benkim0414/.local/share/mise/installs/pnpm/11.16.0/pnpm install
     ```
2. `pnpm nx lint github.io`
   - Exit code: `1`
   - Exact failure output before Nx started: identical to command 1, including
     `ERR_SQLITE_ERROR` and `ERR_PNPM_META_FETCH_FAIL` for
     `https://registry.npmjs.org/pnpm`, followed by the failed implicit
     `pnpm install` command above.
3. `pnpm nx build github.io`
   - Exit code: `1`
   - Exact failure output before Nx started: identical to command 1, including
     `ERR_SQLITE_ERROR` and `ERR_PNPM_META_FETCH_FAIL` for
     `https://registry.npmjs.org/pnpm`, followed by the failed implicit
     `pnpm install` command above.
4. `git diff --check`
   - Exit code: `0`
   - Result: no whitespace errors.

## Files changed

- `apps/github.io/src/app/projects/project-card.spec.tsx`
- `.superpowers/sdd/2026-08-03-project-card/final-fix-report.md`

## Findings not addressable locally

- Important 2 remains externally blocked: this linked worktree has no usable
  local dependencies, and pnpm fails while opening its SQLite store before
  attempting the requested Nx target. It then attempts non-GitHub registry
  access, which was not used to install dependencies. Consequently the focused
  test, lint, and build cannot execute in this worktree.
