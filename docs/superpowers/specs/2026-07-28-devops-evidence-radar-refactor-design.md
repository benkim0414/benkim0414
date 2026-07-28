# DevOps Evidence Radar Refactor Design

## Goal

Consolidate the DevOps capability radar implementation under the DevOps capability evidence feature area.

`DevOpsCapabilityEvidenceRadar` should become the only supported radar chart component for the `github.io` app. The older standalone `DevOpsCapabilityRadar` surface is no longer needed because the evidence feature already owns the evidence-backed scoring model and radar visualization.

## Current State

The app currently has two radar concepts:

- `apps/github.io/src/app/devops-capability-radar/`
  - Exports `DevOpsCapabilityRadar`.
  - Uses static six-axis scores from `devops-capability-radar.data.ts`.
  - Has standalone tests and Storybook story.
- `apps/github.io/src/app/devops-capability-evidence/`
  - Exports `DevOpsCapabilityEvidenceRadar`.
  - Uses derived `DoraCapabilityScore[]` from public evidence.
  - Already has local tests and Storybook coverage.

Search results show no app-shell, route, or roadmap runtime imports of `DevOpsCapabilityRadar`. Most remaining references are its own tests, story, implementation files, and historical docs.

## Recommended Approach

Delete the standalone `devops-capability-radar` feature folder and keep `DevOpsCapabilityEvidenceRadar` as the canonical radar component inside `devops-capability-evidence`.

This avoids maintaining two competing radar models:

- static personal capability scores in the standalone component;
- evidence-derived DORA capability scores in the evidence feature.

The evidence-derived model is the better long-term boundary because capability scores should stay explainable from public portfolio evidence.

## Component Boundary

`DevOpsCapabilityEvidenceRadar` remains a reusable leaf visualization.

It should:

- accept `scores: readonly DoraCapabilityScore[]`;
- filter out scores with value `0`;
- return `null` when no visible scores remain;
- render the MUI X `RadarChart` as visual-only with hidden accessible summary text;
- keep Astryx token styling local to the component;
- avoid depending on the deleted static radar data module.

It should not become a page, card, dashboard shell, or route-level component in this refactor.

## Files To Remove

Remove the obsolete standalone radar files:

```text
apps/github.io/src/app/devops-capability-radar/devops-capability-radar.data.ts
apps/github.io/src/app/devops-capability-radar/devops-capability-radar.tsx
apps/github.io/src/app/devops-capability-radar/devops-capability-radar.spec.tsx
apps/github.io/src/app/devops-capability-radar/devops-capability-radar.stories.tsx
```

If the folder becomes empty, remove the folder as part of normal cleanup.

## Files To Keep

Keep the evidence radar files:

```text
apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx
apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx
```

These files may receive small updates if tests or stories need to cover the canonical boundary more clearly after removing the standalone component.

## Documentation Cleanup

Update or retire current documentation that treats `DevOpsCapabilityRadar` as an active standalone pattern.

Required cleanup:

- update evidence component docs or specs that mention the old standalone radar as an active dependency;
- update solution docs to point to `DevOpsCapabilityEvidenceRadar` where they describe the active radar implementation;
- avoid rewriting old historical plan files unless a stale reference would confuse current work.

Historical Superpowers specs and plans can remain as history, but active solution guidance should no longer direct future work toward the deleted folder.

## Testing

Focused validation should include:

- evidence radar test coverage;
- evidence scoring tests where relevant;
- a search confirming no runtime import of `DevOpsCapabilityRadar` remains;
- project-level `github.io` test and build commands if they run locally.

Preferred commands:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
pnpm nx build github.io
```

If the local Nx targets remain inferred and these commands fail for environment reasons, report the exact limitation and keep the diff review plus focused search results as fallback evidence.

## Out Of Scope

This refactor should not:

- change the evidence scoring rubric;
- remove non-radar DevOps capability evidence components;
- introduce a new generic radar abstraction;
- wire the radar into app routes or page sections;
- change Astryx theme files or global chart styling;
- rename `DevOpsCapabilityEvidenceRadar`.

## Risks

The main risk is stale documentation or Storybook references continuing to imply that `DevOpsCapabilityRadar` exists. The implementation plan should include a repo-wide search after deletion and update current guidance documents that describe active component boundaries.

There is low runtime risk because the standalone component appears unused outside its own files and historical docs.
