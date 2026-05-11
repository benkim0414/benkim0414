## Context

The app uses local typed skill/project data from an earlier change. Since the audience includes recruiters and developers, the search must tolerate partial terms and typos while still making skill level and evidence easy to narrow.

## Goals / Non-Goals

**Goals:**

- Provide Fuse.js fuzzy search over all relevant skill and project text.
- Combine text search with category and level filters.
- Keep search state in URL parameters for shareable views.
- Provide deterministic utility functions that can be tested without rendering the whole app.

**Non-Goals:**

- Do not add server-side search or remote indexing.
- Do not add application routing.
- Do not finalize the full visual showcase layout in this change.

## Decisions

- Use Fuse.js because the user selected fuzzy search and v1 data is small enough for client-side indexing.
- Build the search index from local data at app startup instead of generating an external index file; this keeps v1 simple and static.
- Use URLSearchParams directly instead of adding a routing library because the app remains single-page.
- Keep filter state explicit: query text, selected categories, and selected levels.
- Return a stable ordered result list so tests can assert ranking behavior for common queries.

## Risks / Trade-offs

- Fuse scoring can change if options are tuned later. Mitigation: cover expected high-value queries with tests rather than asserting every score.
- URL parameter parsing can create invalid state. Mitigation: ignore unknown categories/levels and normalize output.
- Client-side search scales only to modest local data. Mitigation: acceptable for a personal portfolio v1.
