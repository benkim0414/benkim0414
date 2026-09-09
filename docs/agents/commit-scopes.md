# Commit scope ownership

Choose a scope for the affected product, package, tool, or domain—not a page name, file extension, or documentation directory. The shared checker is used by the commit hook and CI; commitlint separately preserves Conventional Commit syntax, bodies, and breaking-change handling.

Canonical examples include `feat(github.io): add skills search`, `docs(profile): update contact links`, `fix(date-interval): handle open intervals`, `chore(nx): migrate workspace`, `chore(openspec): update configuration`, and `fix(astryx): validate agent docs`. Dedicated root release scripts such as `scripts/github-io-release.mjs` belong to `github.io`; Astryx agent-document maintenance scripts belong to `astryx`.

Approved scopes are `github.io`, `github-pages`, `gh-pages`, `date-interval`, `profile`, `nx`, `openwiki`, `openspec`, `codex`, `commitizen`, `commitlint`, `astryx`, `deps`, `deps-dev`, `release`, and `workflow`. The `github-pages` and `gh-pages` scopes remain valid for their historical applications. Put app subdomains such as skills, home, navigation, or roadmap in the description or body, not the scope.

An unscoped header is legitimate when a change is genuinely repository-wide and no domain dominates, for example `chore: tidy repository metadata`. Dependency-only updates use `deps` or `deps-dev`. Ordinary merge and revert headers remain valid.

Paths cannot reliably establish the purpose of general documentation. Documentation-only changes and changes spanning root files or multiple owners emit a review diagnostic. The author should explain the dominant domain in the PR, and the reviewer must confirm that choice; the diagnostic is guidance, not fabricated approval. An allowed scope can still be the wrong scope.

CI checks only commits introduced between an explicit base and head. Pull requests check both introduced commit subjects and the proposed squash title; pushes check the before/after range. A range preflight runs before commitlint, so a missing, all-zero, or unreachable push base fails with an adoption message without inspecting replacement or legacy history. For a new branch or rewritten boundary, record and supply an explicit full baseline OID before rerunning.
