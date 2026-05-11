## Why

The main feature of the showcase is making skills easy to search by recruiters and fellow developers. The app needs fuzzy search and shareable search state before the final page composition is built around it.

## What Changes

- Add Fuse.js-powered client-side search across local skill/project data.
- Search skill names, tags, descriptions, project names, project descriptions, and usage notes.
- Add category and level filters that combine with text search.
- Synchronize query and filters with URL parameters so filtered views are shareable.
- Keep final visual composition and deployment automation out of scope.

## Capabilities

### New Capabilities

- `github-io-search-experience`: Covers fuzzy search, filter behavior, empty states, and URL-synced search state.

### Modified Capabilities

None.

## Impact

- Adds Fuse.js as a runtime dependency.
- Adds search/filter utilities and tests under `apps/github.io`.
- Updates the app shell enough to exercise search controls, without completing the final showcase layout.
