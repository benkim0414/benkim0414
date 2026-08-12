# Project Skill Logo Completion Design

## Goal

Replace the generic AWS treatment for Amazon S3 and fill the remaining verified
official-logo gaps on the Dotfiles project card, while preserving the existing
rule that a skill without a truthful official mark stays text-only.

## Scope

This change extends the shared skill-brand resolver and its vendored asset set.
It does not change the project-card layout, skill labels, or the membership of
either project card.

The Homelab card changes only in how `Amazon S3` is resolved: it uses the exact
Amazon S3 service icon instead of the generic AWS wordmark. The Dotfiles card
gains exact official marks for `Yazi`, `mise`, `gh-dash`, and `Herdr`.

`mise` remains a Dotfiles skill and remains excluded from the Homelab card.

## Brand Selection Policy

The resolver continues to prefer exact Simple Icons mappings where they exist.
For missing Simple Icons entries, a repository-owned or vendor-owned asset may
be vendored when all of the following are true:

1. the asset is published by the named project's official organization,
   repository, or product asset package;
2. the asset is an exact product or project mark, not a related language,
   framework, hosting platform, or community substitute;
3. a compact standalone mark or favicon is selected over a wide wordmark when
   both are officially published;
4. the source URL, pinned source revision or release, retrieval date, checksum,
   and applicable license/provenance are recorded; and
5. the asset can be rendered through the existing URL-based skill-brand path
   without adding unsafe inline markup.

If those conditions are not met, the skill remains text-only.

## Approved Official Assets

| Skill | Official asset | Source | Intended local form |
| --- | --- | --- | --- |
| Amazon S3 | Simple Storage Service architecture icon | `awslabs/aws-icons-for-plantuml` at `50efda948226ff4e06937596201528b707ef3ef9` | Unmodified 64 px PNG |
| Yazi | Duck project mark | `sxyazi/yazi` at `5ab58e3029c023ca1ae4bd788716b3da927fb525` | Unmodified PNG |
| mise | Standalone project mark | `jdx/mise` at `05251b278bd78682dd56a879d5975a2d7faad794` | Unmodified compact SVG |
| gh-dash | Compact project favicon | `dlvhdr/gh-dash` at `4ea7c39fbe4d12dbbd66398253fbd81b61073e06` | Unmodified PNG |
| Herdr | Ram/terminal project mark | `herdrdev/herdr` at `5600197f00e871764465d4e3d9ba5e6aa6fd9547` | Unmodified compact SVG |

The Amazon S3 asset is Amazon-published architecture artwork with
`CC-BY-ND-2.0` provenance in the source package. Repository license provenance
is recorded for the other assets, together with the reminder that project
licenses do not grant trademark rights.

The implementation records checksums for the exact downloaded bytes. SVGs are
inspected for scripts, embedded remote resources, and other active content,
then imported with the existing `?no-inline` asset-URL pattern.

## Text-Only Skills

The audit did not find a verified exact official compact mark for `eza`, `fzf`,
`ripgrep`, `zoxide`, `delta`, `LazyGit`, `SSH`, or `Codex`. They remain
text-only.

In particular:

- the Simple Icons `Delta` entry is an unrelated airline brand and is not used
  for git-delta;
- generic `SSH` is not silently rebranded as OpenSSH;
- `Codex` does not receive an unofficial OpenAI or community icon without a
  product-specific asset published through an official OpenAI source; and
- wide wordmarks and screenshots are not used as chip icons.

## Components and Data Flow

`apps/github.io/src/app/skills/skill-brand.ts` remains the single centralized
resolver. It imports the five new assets as URLs and adds exact label mappings
for `Amazon S3`, `Yazi`, `mise`, `gh-dash`, and `Herdr`.

`apps/github.io/src/app/projects/project-list.data.ts` stops assigning
`brandLabel: 'AWS'` to `Amazon S3`, allowing the exact label to resolve to the
new service icon. No Dotfiles skill data changes are required because its
existing labels already match the new resolver keys.

`SkillToken` and `ProjectCard` continue to consume the resolver output without
project-specific branches. Missing mappings continue to render accessible text
without an image.

All vendored source metadata is appended to
`apps/github.io/src/assets/skills/README.md`.

## Testing and Validation

Extend focused tests to verify:

- `Amazon S3` resolves to the official service asset rather than the AWS
  wordmark;
- `Yazi`, `mise`, `gh-dash`, and `Herdr` resolve to their vendored assets;
- `eza`, `fzf`, `ripgrep`, `zoxide`, `delta`, `LazyGit`, `SSH`, and `Codex`
  remain text-only;
- the Homelab fixture retains `Amazon S3` while no longer selecting the AWS
  parent brand;
- the Homelab exclusions `Kubernetes`, `GitOps`, `Bash`, and `mise` remain
  intact; and
- existing labels, accessible names, and project links do not regress.

Run the focused resolver, project-card, and Storybook tests, followed by the
`github.io` lint and production build. If the known pnpm/Nx SQLite or lockfile
parsing problem prevents the wrapper commands from starting, run the existing
direct Vitest and Vite fallbacks and report the wrapper failure separately.

Finally, serve Storybook on `0.0.0.0` with the machine's Tailscale IPv4 allowed.
Inspect both the `Dotfiles` and `Homelab` stories from the iPad, checking icon
legibility, wrapping, light/dark contrast, title and link integrity, text-only
fallbacks, and card boundaries at the iPad viewport.

## Error Handling

- A missing or unreadable asset fails focused resolver tests and the production
  build rather than falling back to an unrelated icon.
- An unsafe or provenance-ambiguous asset is excluded and its skill remains
  text-only.
- Asset downloads are pinned and checksum-verified so upstream changes cannot
  silently alter the checked-in UI.
- Storybook network or Tailscale reachability problems are reported separately
  from component correctness.

## Out of Scope

- Adding, removing, or renaming skills on either project card.
- Adding `mise`, `Bash`, `Kubernetes`, or `GitOps` to Homelab.
- Introducing unofficial, generated, parent-platform, or community substitute
  icons.
- Redrawing, recoloring, cropping, or otherwise modifying official artwork.
- Changing `ProjectCard`, `SkillToken`, responsiveness, or accessibility
  behavior.
- Changing Storybook hosting beyond the temporary Tailscale-accessible visual
  validation session.
