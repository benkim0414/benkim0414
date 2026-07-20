# DevOps Roadmap Token Icons Design

## Goal

Add optional Simple Icons logos to reusable skill tokens, starting with the DevOps roadmap nodes. The roadmap remains a read-only React Flow diagram with no heading or UI controls. Tokens keep their compact Astryx-aligned shape, and mapped tokens use the matching Simple Icons brand color.

## Current Context

The skills list already uses `simple-icons` through `SkillAvatar`, with an explicit local icon map and a safe fallback when an icon is unavailable. The DevOps roadmap currently renders each purple-ticked skill as an Astryx `Badge` with `variant="purple"` inside `DevOpsRoadmapNode`.

## Recommended Approach

Create a reusable `SkillToken` component that can be used by the DevOps roadmap now and by other skill surfaces later. It should render a compact token with the same visual radius as the token itself and an optional leading icon slot. When a Simple Icons match exists, the token background should use that icon's brand color. When no match exists, the token should preserve the current purple roadmap skill treatment. The token should use Astryx tokens and existing component patterns, but can be a small custom inline element if Astryx `Badge` does not support the required icon/color/radius composition cleanly.

## Behavior

- Each roadmap skill token shows its text label.
- If Simple Icons has a logo for the skill, render a small inline logo before the label.
- The whole token uses the brand color from the Simple Icons metadata (`hex`) when a logo is available.
- The logo glyph should remain readable on the brand-colored token. Prefer a high-contrast neutral glyph color over reusing the same brand color for the glyph.
- If no logo is available, render the token without an icon and keep the current purple roadmap token treatment.
- Do not render initials, placeholders, broken images, or fallback icons for missing logos.
- Keep the icon decorative with `aria-hidden="true"` because the visible label already names the skill.
- Preserve existing roadmap node order, reverse-order prop behavior, and content-aware row spacing.

## Icon Lookup

Use an explicit local mapping from skill label to imported Simple Icons icon. Do not dynamically import arbitrary icon names at runtime. This keeps the bundle predictable and makes unavailable icons intentional.

The initial map should include obvious available DevOps skills already in the roadmap, such as Python, Go, Git, GitHub, Docker, Nginx, AWS Lambda, Cloudflare, Terraform, Ansible, GitLab, CircleCI, GitHub Actions, Vault, Prometheus, Grafana, Datadog, Loki, Kubernetes, Artifactory, Argo CD, Istio, and Consul where Simple Icons provides matching exports. Skills without clear Simple Icons support remain text-only.

## Visual Design

- Keep tokens compact and scannable inside roadmap nodes.
- Use a small icon size that does not dominate the label.
- Render mapped tokens with their Simple Icons brand color while keeping the token shape compact and Astryx-aligned.
- Use a readable foreground color on brand-colored tokens; do not sacrifice label contrast for exact logo-color purity.
- Match the icon container radius to the token radius directionally, avoiding a circular avatar treatment.
- Do not add extra explanatory text, controls, or decorative chrome.
- Ensure long labels still wrap or fit cleanly without overlapping neighboring nodes.

## Accessibility

The token label remains visible text. Icons are decorative and hidden from assistive technology. The roadmap diagram keeps its existing non-visible accessible group label.

## Testing

Add or update tests to verify:

- A known mapped skill renders a token with an icon and text label.
- A known mapped skill token uses its Simple Icons brand color.
- A skill without a mapped icon renders text-only without fallback initials or placeholder art.
- A skill without a mapped icon keeps the purple roadmap token treatment.
- The icon is hidden from assistive technology.
- Existing reverse-order, diagram-only, Badge/purple-token, and spacing behavior still pass.

## Out of Scope

- No runtime icon search or network lookup.
- No UI controls for toggling icons.
- No changes to roadmap source data order or core-node selection.
- No visible component heading.
