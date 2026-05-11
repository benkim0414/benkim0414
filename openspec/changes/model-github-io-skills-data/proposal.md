## Why

The showcase search experience needs structured local content before search and UI can be implemented. A typed static data model makes the first version fast, deployable on GitHub Pages, and easy to replace with real curated content later.

## What Changes

- Define local static skill and project data for the `github.io` app.
- Use numeric skill levels from 1 to 5.
- Group skills by DevOps-oriented categories.
- Seed realistic placeholder entries that demonstrate the final content shape.
- Keep search ranking, final UI composition, and deployment out of scope.

## Capabilities

### New Capabilities

- `github-io-skills-data`: Covers the local skills/projects data model, placeholder seed content, and validation expectations.

### Modified Capabilities

None.

## Impact

- Adds typed app data modules under `apps/github.io`.
- Adds validation or tests around skill level bounds, category values, project references, and placeholder completeness.
- Provides the data contract for later search and UI changes.
