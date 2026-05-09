## Context

The user wants a skills showcase for recruiters and fellow developers, with search as the main feature. The page should feel quiet and professional, not like a marketing landing page. Existing README contact links provide email and LinkedIn references.

## Goals / Non-Goals

**Goals:**

- Compose the final v1 single-page UI around search and filters.
- Make skill level and relevant project evidence easy to scan.
- Provide responsive layouts for desktop and mobile.
- Include accessible labels, keyboard-friendly controls, and visible empty states.

**Non-Goals:**

- Do not add multi-route navigation.
- Do not introduce a CMS or remote content source.
- Do not add deployment automation in this change.

## Decisions

- Use a single-page layout because the user selected it and URL-synced search already provides shareable state.
- Put search and filters near the top of the page so the primary feature is immediately available.
- Use compact cards and badges for skills because the content is comparison-oriented and should be scannable.
- Show related projects inline with each skill result so visitors can connect level claims to usage evidence.
- Use existing README contact URLs rather than inventing new profile destinations.

## Risks / Trade-offs

- Placeholder content can weaken the impression if it looks final. Mitigation: keep placeholders clearly structured and easy to replace.
- Dense UI can become cramped on mobile. Mitigation: include responsive Playwright smoke tests and avoid fixed-width controls.
- Search-first layout may underplay personal introduction. Mitigation: include a concise header, but keep search as the main interaction.
