# Neutral Skill Token Surfaces Design

## Goal

Use the Astryx neutral token surface whenever a project-card skill does not
have a verified official brand color, while keeping verified Simple Icons
colors and preserving every official or approved logo asset without
recoloring it.

## Scope and Audit Boundary

The Dotfiles and Homelab project cards currently contain 45 skill tokens. Of
those, 26 resolve through Simple Icons and already carry the icon catalog's
curated brand hex. This change preserves their branded surfaces.

The remaining 19 tokens were checked against their project-owned website,
documentation, or repository. An official brand color counts only when the
project publishes a primary or brand color suitable for identity use. A color
seen in a logo, screenshot, theme, favicon, website decoration, or terminal UI
does not by itself establish a brand background color.

The audit found no published product-specific brand background color for any
of these 19 tokens:

| Rendering today | Skills | Official-source finding |
| --- | --- | --- |
| Custom image asset | Amazon S3, Alloy, Codex, gh-dash, Herdr, Loki, MetalLB, mise, kube-vip, Yazi | Official or approved artwork exists, but no product-specific background brand color is published. |
| Text only | eza, fzf, ripgrep, zoxide, delta, LazyGit, SSH, Sealed Secrets, NFS | No published primary brand color was found; configurable application colors and protocol/vendor colors do not count. |

The audit sources include:

- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/) for the
  approved Amazon S3 service artwork;
- Grafana's official [Alloy](https://grafana.com/docs/alloy/latest/) and
  [Loki](https://grafana.com/docs/loki/latest/) documentation and repositories;
- [OpenAI's design guidelines](https://openai.com/brand/) and the already
  approved [LobeHub Codex asset](https://icons.lobehub.com/) provenance;
- the official [gh-dash theme documentation](https://www.gh-dash.dev/configuration/theme/);
- the official [Herdr](https://herdr.dev/),
  [MetalLB](https://metallb.io/), [mise](https://mise.jdx.dev/),
  [kube-vip](https://kube-vip.io/), and
  [Yazi](https://yazi-rs.github.io/docs/configuration/theme/) sites or
  repositories; and
- project-owned sources for [eza](https://github.com/eza-community/eza),
  [fzf](https://github.com/junegunn/fzf),
  [ripgrep](https://github.com/BurntSushi/ripgrep),
  [zoxide](https://github.com/ajeetdsouza/zoxide),
  [delta](https://github.com/dandavison/delta),
  [LazyGit](https://github.com/jesseduffield/lazygit), and
  [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets), plus the
  protocol-level SSH and NFS labels.

AWS publishes general company colors and approved service artwork, but does
not publish an Amazon S3 chip-background color. Grafana's parent identity does
not establish separate Alloy or Loki background colors. OpenAI instructs users
not to add color to its mark, while the approved Codex mark is explicitly a
community asset. User-configurable themes for gh-dash, Yazi, ripgrep, delta,
or LazyGit are application presentation choices rather than brand palettes.

Resolver entries not rendered by the two project cards are outside this audit.
Evidence skill tokens already force the neutral variant and retain that
behavior.

## Surface Selection Rule

Each resolved skill brand declares whether its token surface is `brand` or
`neutral`.

- A Simple Icons-backed skill declares `brand` and continues using its curated
  hex as the token background.
- Each of the 10 audited custom-image project skills declares `neutral`.
- A skill with no resolver entry naturally uses `neutral`; this covers the
  nine audited text-only skills.
- The icon remains independent from the surface. On a neutral surface, Simple
  Icons paths keep their brand color and raster or SVG image assets retain
  their original embedded colors.
- Callers may still request an explicit variant for contexts such as evidence
  cards, but an omitted variant follows the resolver metadata.

This makes the source of the decision explicit. Asset format, the presence of
an icon, `#FFFFFF`, and sampled logo pixels are not treated as brand evidence.

## Component Design

`SkillBrand` in `apps/github.io/src/app/skills/skill-brand.ts` gains surface
metadata. Simple Icons results use `brand`; the audited custom-image mappings
used by Dotfiles and Homelab use `neutral`.

`SkillToken` continues accepting `brand` and `neutral` variants. When the
caller omits `variant`, it resolves the effective variant from the skill-brand
metadata and falls back to `neutral` when no brand is found. Explicit callers
remain supported, so the evidence view's existing `variant="neutral"` contract
does not change.

`ProjectCard` continues rendering `SkillToken` without project-specific color
lists or branching. The shared resolver therefore remains the single source
of truth for logo, color, foreground, and surface provenance.

No project data, labels, icons, card layout, or accessibility names change.

## Alternatives Considered

### Infer neutral from custom image assets

Treat every URL-backed asset as neutral and every Simple Icon as branded. This
matches today's audited set but incorrectly couples asset format to brand
evidence. A future official logo with a published background color would be
misclassified.

### Maintain a neutral-label list in ProjectCard

This is mechanically small but duplicates brand knowledge in a presentation
component and can drift when the resolver changes.

### Store surface provenance in SkillBrand (recommended)

This keeps the decision beside the asset and color metadata, supports future
exceptions explicitly, and lets every consumer share the same default while
retaining intentional caller overrides.

## Testing and Validation

Focused tests will verify that:

- a representative Simple Icons skill defaults to a branded surface;
- all 10 custom-image skills rendered by Dotfiles and Homelab default to the
  Astryx gray surface;
- all nine text-only skills render on the Astryx gray surface;
- custom image assets remain present and unmodified on neutral surfaces;
- a Simple Icons path keeps its official icon fill when explicitly neutral;
- an explicit `neutral` variant continues overriding brand metadata;
- skill labels and accessible names remain unchanged; and
- the Homelab exclusions `Kubernetes`, `GitOps`, `Bash`, and `mise` remain
  intact.

Run the focused skill-token and project-card tests, then the preferred
`github.io` Nx test, lint, and production-build commands. Inspect the Dotfiles
and Homelab Storybook stories in light and dark modes at the iPad viewport,
checking neutral surface consistency, logo legibility, text wrapping, card
boundaries, labels, and source links.

The previously requested physical iPad check over Tailscale remains a manual
validation gate and must not be reported as complete based only on local or
headless browser results.

## Error Handling

- Missing surface metadata falls back to neutral rather than inventing a brand
  background.
- Missing assets continue to fail the existing resolver or build validation;
  the surface change does not introduce unrelated-logo fallbacks.
- If a future official color is adopted, its official source and suitability
  for the current artwork must be recorded before changing the surface to
  `brand`.
- A published parent-company palette does not automatically become a
  product-specific token background.

## Out of Scope

- Adding, removing, renaming, or reordering project skills.
- Adding `mise`, `Bash`, `Kubernetes`, or `GitOps` to Homelab.
- Replacing, recoloring, redrawing, or otherwise modifying logo assets.
- Re-auditing or changing the curated hex values supplied by Simple Icons.
- Assigning brand surfaces to resolver entries that are not used by the
  Dotfiles or Homelab project cards.
- Changing Astryx token colors, spacing, layout, or responsive behavior.
- Treating the physical iPad/Tailscale check as automated validation.
