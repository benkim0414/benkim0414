---
version: 1
scope:
  app: apps/github.io
  purpose: "Design-system contract for the personal GitHub Pages skills showcase"
visual_direction:
  mood: "dark, sparse, technical, recruiter-readable"
  inspiration:
    - "OpenClaw-style dark atmosphere and minimal first-screen chrome"
    - "aliased terminal and bits-inspired visual details"
  avoid:
    - "generic shadcn SaaS dashboard styling"
    - "full pixel-art novelty"
    - "copying OpenClaw's red mascot palette"
palette:
  background: "#050712"
  surface: "#0B1020"
  surface_raised: "#11182D"
  border: "#28314A"
  text: "#F4F0FF"
  text_muted: "#A9A3C7"
  text_subtle: "#716C8E"
  accent: "#A855F7"
  accent_strong: "#7C3AED"
  accent_soft: "#C084FC"
  signal: "#22D3EE"
  success: "#34D399"
  warning: "#F59E0B"
typography:
  body: "clean sans-serif"
  accent: "developer monospace or coding font"
  accent_usage:
    - "eyebrow labels"
    - "metadata"
    - "counters"
    - "tags"
    - "command-like text"
    - "compact status lines"
  avoid:
    - "monospace body copy"
    - "developer-font paragraphs"
    - "illegible pixel fonts for core content"
shape:
  radius: "4px to 8px"
  border: "1px crisp borders"
  shadow: "minimal; prefer glow or hard-edge highlight only where useful"
---

# GitHub.io Design System

## Intent

This app is a searchable skills showcase for recruiters and fellow developers.
It should feel technical and distinctive without becoming a novelty interface.
The default visual stance is dark, sparse, and precise: closer to a focused
terminal surface than a marketing landing page.

The design can borrow the restraint of `openclaw.ai`: minimal chrome, a dark
field, a strong center of gravity, and small signal details. It should not copy
OpenClaw's red palette or mascot-led identity. This site uses violet and purple
as the primary accent, with small cyan or green signal marks when useful.

## Visual Principles

- Keep search as the primary interaction. The first screen should quickly tell
  visitors who this is, what kind of work the site represents, and how to search
  the skill evidence.
- Use dark surfaces by default. Light mode may exist, but the signature design
  direction is a dark technical surface with violet highlights.
- Use developer fonts as accents only. Body copy, long descriptions, and main
  reading content should stay in a clean sans-serif for readability.
- Make the bits concept visible through structure: crisp borders, hard edges,
  square-ish controls, tiny status marks, segmented separators, and terminal-like
  labels.
- Prefer subtle atmospheric detail over decoration. A sparse dotted field, fine
  grid, scanline texture, or single glow is acceptable when it does not reduce
  contrast or distract from search results.
- Keep content dense but calm. Cards and filters should be easy to scan in
  repeated use, not oversized or editorial.

## Color Guidance

Use violet and purple for primary actions, active filters, focus treatment, and
important highlights. Keep the base nearly black so the accent feels deliberate.

- Background: `#050712`
- Surface: `#0B1020`
- Raised surface: `#11182D`
- Border: `#28314A`
- Text: `#F4F0FF`
- Muted text: `#A9A3C7`
- Subtle text: `#716C8E`
- Accent: `#A855F7`
- Strong accent: `#7C3AED`
- Soft accent: `#C084FC`
- Signal cyan: `#22D3EE`
- Success green: `#34D399`
- Warning amber: `#F59E0B`

Do not let the UI become one-note purple. Violet is the accent, not the whole
palette. Surfaces should stay dark ink, slate, and near-black, with cyan or
green reserved for small status hints.

## Typography

Use a clean sans-serif for primary reading. Use a developer font selectively for
interface accents:

- top-level path labels, such as `~/github.io/skills`
- counters, such as `08 / 08 skills`
- filter metadata and tag labels
- command-like hints, such as `search --category kubernetes`
- compact status lines and terminal-style section labels

Do not use a developer font for paragraphs, long usage descriptions, or every
heading. The site should signal engineering taste without making recruiters work
to read it.

## Components

### Header

The header should be slim and quiet. It can use a path-like identity treatment
instead of a marketing logo, for example `> benkim0414/github.io`. Keep contact
links visible, compact, and text-based or icon-plus-label.

### Hero

The hero should be sparse and first-viewport aware. It should include:

- a compact technical eyebrow or path label
- the name `Gunwoo Ben Kim`
- one concise positioning sentence
- a visible search entry point or immediate transition into the search surface
- a small status/counter line using the developer accent font

Avoid a large card-based hero. Avoid split hero layouts. The first screen should
feel like a refined technical console, not a SaaS homepage.

### Search And Filters

Search is the core workflow. The search input should be prominent, high contrast,
and visually integrated with the terminal/bits theme. Filters should feel like
segmented toggles or compact chips rather than form-heavy controls.

Active filters should use violet. Hover and focus states can use violet borders,
cyan signal dots, or hard-edge highlights. Preserve keyboard focus visibility.

### Skill Cards

Skill cards should be compact evidence blocks:

- skill name and level should be immediately scannable
- category and tags should use compact developer-font accents
- usage text should remain readable sans-serif
- project references should look like supporting evidence, not footnotes

Use crisp borders and restrained raised surfaces. Do not nest cards inside cards.

### Empty And Result States

Empty states should stay practical and concise. Prefer terminal-style phrasing
without jokes, for example `no matching skills found`. Do not use large
illustrations or decorative empty-state panels.

## Aliased And Bits Details

The design should evoke bits and terminal graphics without sacrificing polish:

- 1px borders that align cleanly
- hard-edge inset highlights instead of soft shadows
- dotted or pixel grid accents at low opacity
- small square markers for status or section starts
- subtle scanline texture only when contrast remains accessible
- numeric counters, slashes, and path separators for structure

Avoid noisy glitch effects, heavy CRT blur, animated bokeh, decorative orbs, and
full-screen pixel-art treatments.

## Accessibility And Quality Bar

- Text contrast must remain readable in dark mode.
- Interactive targets must stay usable on mobile.
- Text must not overflow buttons, cards, chips, or filter controls.
- Layout should use stable dimensions for repeated elements so hover, focus, and
  dynamic result counts do not shift the page.
- Visual effects must not obscure the search input or result content.
- The UI should remain usable with reduced motion.

## Implementation Notes For Future Changes

- Map these tokens into `apps/github.io/src/styles.css` before redesigning
  component markup.
- Keep shadcn-owned primitives app-local and adapt their classes to these
  tokens rather than introducing a second component system.
- Use `lucide-react` icons when an icon is needed.
- Verify the visual result with desktop and mobile screenshots before accepting
  a UI implementation.
- Treat this document as the source of truth when future app changes conflict
  with older OpenSpec design notes that describe the previous quiet light UI.
