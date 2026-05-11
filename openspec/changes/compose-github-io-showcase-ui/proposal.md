## Why

After the app shell, design system, data model, and search behavior exist, the app needs the final single-page experience that recruiters and developers will actually use. This change composes the searchable skills showcase into a polished v1 page.

## What Changes

- Build a single-page recruiter/developer-facing showcase UI.
- Keep search as the primary interaction on the first screen.
- Render skill cards with level, category, tags, usage descriptions, and related projects.
- Include contact links from the existing README context.
- Add responsive and accessibility-focused verification for the composed page.
- Keep deployment automation out of scope.

## Capabilities

### New Capabilities

- `github-io-showcase-ui`: Covers the final single-page showcase composition and user-facing rendering behavior.

### Modified Capabilities

None.

## Impact

- Replaces temporary app/search rendering with the v1 showcase experience.
- Uses previously added shadcn components, theme behavior, local data, and search utilities.
- Adds or updates tests for user-facing states and responsive smoke coverage.
