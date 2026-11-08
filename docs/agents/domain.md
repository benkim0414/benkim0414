# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONCEPTS.md`** at the repo root (this repo's shared domain vocabulary; also reachable as `GLOSSARY.md` via symlink for mattpocock/skills defaults)
- **`docs/adr/`**: read ADRs that touch the area you're about to work in
- Root **`AGENTS.md`** for workflow and profile routing; **`docs/agents/`** for tracker, triage labels, and commit-scope rules

If a glossary or ADR file does not exist yet for a new area, **proceed silently**. Don't flag absence; don't suggest creating docs upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates or updates them lazily when terms or decisions actually get resolved. Prefer writing new terms into `CONCEPTS.md` (via the `GLOSSARY.md` symlink) so AGENTS.md and skills stay aligned.

## File structure

Single-context layout (current choice for this monorepo; one shared vocabulary):

```
/
├── CONCEPTS.md          ← canonical glossary content
├── GLOSSARY.md          ← symlink → CONCEPTS.md (skills compatibility)
├── docs/adr/
└── apps/ | packages/
```

Multi-context (`GLOSSARY-MAP.md` + per-package glossaries) was not enabled. Revisit via `/setup-matt-pocock-skills` if package-local vocabularies become necessary.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONCEPTS.md` / `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (…), but worth reopening because…_
