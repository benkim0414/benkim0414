# DORA Radar Sharp Grid Design

## Goal

Render the DORA capability Radar with sharp polygon grid rings instead of circular rings so its geometry matches the angular capability profile.

## Recommended approach

Set the existing MUI `RadarChart` `shape` prop explicitly to `"sharp"`. This uses the component's supported public API and makes the intended visual behavior clear rather than relying on MUI's default value.

## Scope

- Change only the Radar grid shape from circular to sharp.
- Preserve the 0–5 domain and ten half-step grid divisions.
- Preserve the evidence-derived scores and their order.
- Preserve dimensions, margins, colors, labels, tooltip behavior, accessibility summary, keyboard behavior, and animation settings.
- Add focused regression coverage for the sharp grid configuration while retaining the existing Radar behavior tests.

## Out of scope

- Changes to the scoring formula or capability evidence.
- Changes to card content or page layout.
- Custom Radar grid slots or bespoke SVG rendering.
- Changes to responsive dimensions or typography.

## Validation

- Use test-driven development: first add an assertion that fails while the chart uses `shape="circular"`, then change it to `shape="sharp"` and confirm the focused Radar test passes.
- Run the `github.io` test target and static Storybook build.
- Inspect the `Default` and `NarrowViewport` Radar stories over the existing Tailscale-accessible Storybook session, checking polygon rings, label legibility, clipping, and overflow.

## Risks

- Ten polygon rings may look visually denser than circular rings at narrow widths. The narrow story is the acceptance check; no spacing or styling changes are included unless separately approved.
- A DOM-only assertion can be coupled to MUI internals. Prefer an assertion against the rendered grid geometry or another stable observable supported by the installed MUI version.
