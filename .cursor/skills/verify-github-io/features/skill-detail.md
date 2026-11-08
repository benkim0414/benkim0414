# Skill detail

Skill detail shows one skill’s overview, experience, and projects, with an on-page outline on tablet/desktop widths.

## Sub-features

- `detail-open` opens a known skill such as Kubernetes.
- `detail-outline` uses On this page links (tablet/desktop).
- `detail-unknown` shows the full-width not-found page for an unknown skill under `/skills/:id`.

## How to get to it (user POV)

- Choose a skill from `/skills`.
- Open `/skills/kubernetes` directly.
- Use outline links labeled Overview / Experience / Projects when visible.

## Driving it with control-github-io

Preconditions:

- Doctor is healthy.
- For outline checks, viewport width ≥768px.
- Kubernetes skill data is present in the static catalogue.

- **Direct open.** Run `control-github-io browser navigate --url /skills/kubernetes` and `control-github-io browser ready --selector 'main[aria-label="Skill detail"] h1'`. The detail heading is present.
- **Outline presence.** Run `control-github-io browser eval --expression '({ hashes: [...document.querySelectorAll("nav[aria-label=\\"On this page\\"] a")].map((a) => a.hash), visible: Boolean(document.querySelector("nav[aria-label=\\"On this page\\"]")?.offsetParent) })'`. At ≥768px, `visible` is true and hashes include `#skill-overview-heading` and `#skill-experience-narrative-heading`.
- **Outline navigation.** Click the Experience outline link. Run `control-github-io browser click --selector 'nav[aria-label="On this page"] a[href="#skill-experience-narrative-heading"]'` then eval `location.hash` and the outline `aria-current="location"` hash. Both refer to Experience.
- **Unknown skill.** Run `control-github-io browser navigate --url /skills/not-real` and `control-github-io browser ready --selector '[data-testid="not-found-page"][data-layout="full-width"]'`. The framed not-found page is shown (not the standalone wildcard).
- **Proof.** Capture Kubernetes detail with outline visible: `skill-detail/kubernetes.aria.txt` and `skill-detail/kubernetes.png`.

## Gotchas

- Phone widths hide the outline; report outline as unmet precondition under 768px rather than claiming pass.
- Unknown skills under `/skills/:id` use the full-width not-found inside the global frame. Standalone not-found is only for routes outside the layout (for example `/not-a-route`).
- Focus moves to the detail `h1` on navigation; do not assert outline focus instead.
