## Context

The app shell exists before this change. The user selected shadcn/ui, which is not a black-box component library; it generates component source into the app and styles it with Tailwind. The visual target is quiet professional rather than decorative or marketing-heavy.

## Goals / Non-Goals

**Goals:**

- Configure Tailwind v4 using current shadcn Vite guidance.
- Initialize shadcn/ui with `new-york` style.
- Provide app-local components needed for the shell and theme toggle.
- Implement light, dark, and system theme modes with persisted user preference.

**Non-Goals:**

- Do not build the full showcase UI or search experience.
- Do not add a route system.
- Do not introduce a separate component library that overlaps shadcn/ui.

## Decisions

- Use Tailwind v4 because it was explicitly selected and is the current shadcn direction for new Vite projects.
- Use shadcn `new-york` style because it gives compact, professional defaults that fit a recruiter-facing skills interface.
- Keep generated components inside the app source so they can be reviewed and changed like normal code.
- Implement theme mode with a small provider/hook instead of a broad state library; the app is single-page and does not need global state infrastructure.
- Persist theme preference in localStorage while resolving `system` mode from `prefers-color-scheme`.

## Risks / Trade-offs

- Tailwind v4 setup differs from older config-file examples. Mitigation: follow current shadcn Vite instructions and verify with a real app build.
- shadcn writes source files that can diverge from upstream. Mitigation: keep generated components minimal and app-owned.
- Theme tests can be brittle around browser media queries. Mitigation: isolate theme resolution logic for unit tests and cover the UI with a Playwright smoke test.
