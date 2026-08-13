# GitHub.io Astryx Codex Context Design

## Goal

Give Codex version-matched Astryx guidance whenever it works in
`apps/github.io`, while preserving the app's existing handwritten engineering
rules. Make the generated guidance easy to refresh after Astryx upgrades and
easy to verify without changing the working tree.

## Context

The repository already installs matching `0.1.4` versions of
`@astryxdesign/cli`, `@astryxdesign/core`, and
`@astryxdesign/theme-neutral`. The app-level
`apps/github.io/AGENTS.md` already documents Nx, Astryx-first UI, StyleX,
Tailwind, Storybook, accessibility, and verification conventions.

Astryx's [Working with AI](https://astryx.atmeta.com/docs/working-with-ai)
guidance recommends generating agent documentation from the installed CLI. The
generated content supplies a template-first workflow, a live component index,
behavioral rules, and a CLI reference tied to the installed Astryx version.
Codex's [AGENTS.md documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
confirms that nested instructions apply more specifically as Codex walks from
the repository root toward the working directory. Therefore the app-level
`AGENTS.md` is the narrowest reliable scope for this context.

## Recommended Approach

Append a CLI-managed Astryx block to `apps/github.io/AGENTS.md`. Preserve all
existing handwritten content outside `<!-- ASTRYX:START -->` and
`<!-- ASTRYX:END -->`; the Astryx CLI owns only the content between those
markers.

Add repository commands that:

1. invoke the installed Astryx CLI through its documented entry point;
2. refresh the managed block at the explicit app-level path; and
3. verify that the checked-in block matches a fresh CLI-generated block.

This combines deterministic, version-aware generated guidance with the
repository's more detailed product and engineering conventions.

## Alternatives Considered

### Separate generated companion file

Generate `apps/github.io/ASTRYX.md` and tell agents to read it from
`AGENTS.md`. This isolates generated content but weakens reliability because
Codex does not discover `ASTRYX.md` automatically. It also adds an avoidable
second-hop instruction.

### Replace the app-level AGENTS.md

Let Astryx own the entire app-level instruction file. This is mechanically
simple but discards established rules for Nx, Storybook, StyleX boundaries,
visual QA, accessibility, and third-party components.

### Repository-wide or global installation

Generate the guidance in the repository root or global Codex home. This gives
Astryx instructions to unrelated tasks and projects, increasing context cost
and creating incorrect defaults outside `apps/github.io`.

## File and Ownership Boundaries

### `apps/github.io/AGENTS.md`

- Remains the single automatically discovered instruction file for the app.
- Retains all existing human-authored sections.
- Contains exactly one Astryx marker-delimited generated block.
- Receives generated content from the installed CLI rather than copied web
  documentation, so an Astryx dependency update can update the guidance in
  place.

### `package.json`

Add three scripts:

- `astryx`: invokes
  `node node_modules/@astryxdesign/cli/bin/astryx.mjs`, the executable declared
  by installed `@astryxdesign/cli@0.1.4`.
- `astryx:agents`: runs the CLI initializer with `--features agents` and
  `--agent-docs-path apps/github.io/AGENTS.md`.
- `astryx:agents:check`: runs the repository freshness checker.

The stable alias applies Astryx's guidance using the executable path actually
shipped by the installed package and prevents agents from guessing a CLI path.
The explicit output path ensures generation never targets the root `AGENTS.md`.

### Freshness checker

Add a small Node.js script under a new root `scripts/` directory. It will:

1. resolve the repository root and target app instruction file;
2. validate that the checked-in file has exactly one complete pair of Astryx
   markers;
3. create a uniquely named temporary directory inside the repository;
4. run the repository's Astryx CLI against a temporary agent document;
5. extract and compare the generated and checked-in marker blocks byte for
   byte;
6. report success or an actionable mismatch; and
7. remove the temporary directory in a `finally` block.

The checker treats the CLI as the sole generator. It will not import private
Astryx implementation modules, which avoids coupling repository automation to
undocumented package internals.

## Command and Data Flow

### Refresh

```text
pnpm astryx:agents
  -> installed Astryx CLI
  -> inspect installed core version and styling system
  -> generate current workflow, rules, component index, and CLI reference
  -> append or replace only the marker block in apps/github.io/AGENTS.md
```

Running refresh twice must leave no second-run diff.

### Check

```text
pnpm astryx:agents:check
  -> validate checked-in markers
  -> generate expected document at a temporary repository-local path
  -> compare marker blocks
  -> remove temporary data
  -> exit 0 when current; exit nonzero with refresh instructions when stale
```

The temporary file must never be committed or remain after normal success or
failure handling.

## Generated Guidance Contract

The checked-in Astryx block must teach agents to:

1. list related templates before designing a new UI;
2. inspect a selected template's skeleton;
3. read official component documentation for every Astryx component used;
4. prefer Astryx components over raw layout elements;
5. avoid invented props, inline style objects, and magic values; and
6. use Astryx tokens and the styling path detected for this repository.

The installed CLI remains authoritative for exact component APIs. The setup
knowledge check should resolve from current CLI output:

- `Button` uses its documented Astryx package import path.
- A non-dismissible `Dialog` uses `purpose="required"`.
- `Selector` receives its items through the required `options` prop.

These facts validate that agents can retrieve current API guidance rather than
relying on model memory.

## Error Handling

The freshness checker must distinguish these failures:

- Missing, incomplete, or duplicate markers: explain that the managed block is
  malformed and recommend `pnpm astryx:agents`.
- CLI execution failure: preserve the CLI's diagnostic output and exit nonzero.
- Stale content: report the target path and exact refresh command.
- Temporary cleanup failure: report the temporary path and exit nonzero rather
  than silently leaving repository-local artifacts.

The refresh command itself delegates write and merge behavior to the Astryx
CLI, whose marker protocol preserves surrounding handwritten content.

## Validation

Implementation verification will include:

1. `node --check` for the freshness-check script.
2. A refresh run that creates exactly one complete marker block.
3. A second refresh run with no resulting diff.
4. A successful freshness check against the checked-in block.
5. A failing check against a deliberately altered temporary copy, without
   changing the checked-in file.
6. Inspection of the generated block for the template-first workflow and
   component/docs commands.
7. CLI queries for `Button`, `Dialog`, and `Selector` to confirm the documented
   knowledge-check answers.

Application build and browser validation are unnecessary because this change
does not alter runtime application code. Existing `github.io` lint and test
targets provide the repository baseline; at design time they pass with 549
tests and no lint errors, alongside 23 pre-existing lint warnings.

## Scope

### In scope

- Generated Astryx guidance in `apps/github.io/AGENTS.md`.
- A stable Astryx CLI package script.
- Deterministic refresh and non-destructive freshness-check commands.
- Focused validation of marker integrity, idempotence, freshness, and CLI
  knowledge retrieval.

### Out of scope

- Global Codex configuration or guidance changes.
- Root `AGENTS.md` changes.
- Astryx dependency upgrades.
- UI, theme, or application-runtime changes.
- Rewriting existing app-specific guidance to duplicate generated wording.
- CI workflow integration; the freshness command will be available for later
  CI adoption.

## Risks and Mitigations

- **Generated and handwritten guidance overlap.** Keep generation marker-bound
  and preserve app-specific rules. More-specific handwritten constraints remain
  explicit outside the generated block.
- **Astryx upgrades make guidance stale.** Provide a checked-in refresh command
  and a deterministic freshness check that compares against the installed CLI.
- **A check mutates developer files.** Generate only into a unique temporary
  repository-local path and remove it in all handled outcomes.
- **CLI internals change.** Call the supported CLI surface rather than importing
  private generator functions.
- **Guidance leaks beyond the app.** Target only the nested app instruction
  file; do not modify repository-wide or global Codex configuration.

## Acceptance Criteria

- Codex sessions working under `apps/github.io` receive both the existing app
  rules and the current Astryx-generated context.
- Existing handwritten instruction text remains unchanged outside Astryx
  markers.
- The managed block is version-matched to installed Astryx packages and is
  idempotently refreshable.
- `pnpm astryx:agents:check` detects current, stale, and malformed guidance with
  actionable output and leaves no temporary files.
- No global configuration, runtime application code, dependency version, or CI
  workflow changes are introduced.
