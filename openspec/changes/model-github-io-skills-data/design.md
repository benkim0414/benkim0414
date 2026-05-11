## Context

The app is a static GitHub Pages site. Runtime API dependencies would increase failure modes and rate-limit concerns for a recruiter-facing page, so v1 uses local curated data. The initial data may be placeholder content, but it must have the same shape as the future real portfolio content.

## Goals / Non-Goals

**Goals:**

- Define a TypeScript data model for skills, projects, categories, tags, levels, and usage descriptions.
- Seed enough placeholder content to exercise the search and showcase UI.
- Validate data consistency with tests before later features depend on it.

**Non-Goals:**

- Do not fetch GitHub API data at runtime.
- Do not require real resume content before v1 can be built.
- Do not implement Fuse.js search or filters in this change.

## Decisions

- Use local TypeScript data instead of JSON so the compiler can enforce level/category values and project relationships.
- Represent skill level as `1 | 2 | 3 | 4 | 5` because the user selected a numeric scale.
- Keep categories explicit: Cloud, Kubernetes, IaC, CI/CD, Observability, Backend, Frontend, and Tools.
- Include project references inside skill records so the search UI can show relevant usage evidence without joining remote data.
- Use placeholder entries that are clearly replaceable and avoid presenting invented personal claims as final facts.

## Risks / Trade-offs

- Placeholder content may look real if not labeled carefully. Mitigation: mark seed copy as placeholder-oriented and make replacement straightforward.
- Local data can become verbose. Mitigation: centralize types and export normalized arrays for search/UI use.
- Numeric levels can be ambiguous. Mitigation: include display labels or descriptions for each level in the data model.
