# Homelab Project Card Design

## Goal

Add a portfolio project entry for `benkim0414/homelab` that reuses the existing
`ProjectCard` and presents the repository's infrastructure and operational
tooling with the same evidence-backed detail as the Dotfiles entry.

## Scope

This change adds one static `Project` object to `sampleProjects`, fills the
official-logo gaps for its supported skills, adds a dedicated Storybook story,
and extends focused tests. It does not change `ProjectCard`, its layout, its
types, or the projects-page architecture.

The card uses:

- ID: `homelab`
- Title: `benkim0414/homelab`
- GitHub URL: `https://github.com/benkim0414/homelab`
- Description: `Self-managed K3s homelab automated with Argo CD and Helm, with private networking, encrypted secrets, distributed storage, observability, databases, and off-site backups.`
- Evidence ID: `homelab-project`
- Capability keys: `deployment-automation`, `flexible-infrastructure`,
  `monitoring-observability`, and `pervasive-security`

## Skills

The card includes infrastructure and operational tooling directly evidenced by
tracked Homelab configuration or documented workflows:

1. K3s
2. Argo CD
3. Helm
4. Ansible
5. kubectl
6. Tailscale
7. Sealed Secrets
8. Traefik
9. Longhorn
10. MetalLB
11. kube-vip
12. Prometheus
13. Grafana
14. Loki
15. Alloy
16. PostgreSQL
17. Redis
18. NFS
19. Amazon S3
20. Renovate

`Amazon S3` uses `brandLabel: 'AWS'` so the existing truthful parent-brand
mapping can provide AWS visual metadata. The shared brand resolver gains exact
Simple Icons mappings for K3s, Tailscale, Traefik (using the official Traefik
Proxy mark), Longhorn, Redis, and Renovate. MetalLB uses its published SVG from
the CNCF Landscape, vendored with its source and license provenance recorded in
`apps/github.io/src/assets/skills/README.md`.

Sealed Secrets, kube-vip, and NFS remain text-only because no clear official
product-specific logo is published for them. They do not receive generic,
Kubernetes-family, or invented substitute icons. This follows the existing
logo policy: exact official mark first, truthful official parent/platform only
when intentionally selected, then a provenance-recorded official asset, and
otherwise text-only.

The card explicitly excludes `Kubernetes`, `GitOps`, `Bash`, and `mise`. It also
excludes hosted applications such as Immich, Home Assistant, Nextcloud, and
Vaultwarden because the card is intended to describe infrastructure and
operations skills rather than inventory every deployed workload.

## Components and Data Flow

`apps/github.io/src/app/projects/project-list.data.ts` remains the single source
of project-card fixture data. The new object conforms to the existing `Project`
interface and is appended beside the Dotfiles object. Consumers continue to
pass a `Project` directly to `ProjectCard`, which renders the title,
description, skill tokens, and GitHub citation without branching by project.

`apps/github.io/src/app/skills/skill-brand.ts` remains the centralized resolver
for both Simple Icons and vendored assets. The MetalLB asset follows the
existing `?no-inline` SVG import pattern. No project-card-specific logo logic is
added.

`apps/github.io/src/app/projects/project-card.stories.tsx` selects the Homelab
fixture by its stable `homelab` ID and exposes it as a permanent `Homelab`
story. This gives the full skill set a direct visual inspection surface on
desktop and iPad through the existing Tailscale-compatible Storybook setup.

No new component, state, network request, dependency, or data-loading path is
introduced. The only new runtime asset is the provenance-recorded MetalLB SVG.

## Error Handling

The feature has no runtime failure path because the project entry is static,
typed data. TypeScript protects the object shape, while focused tests protect
the stable project identity, curated skill selection, metadata, and URL.
Unsupported skill logos use the existing text-only fallback rather than an
invented or misleading icon. The Storybook story fails immediately with a
clear error if the stable Homelab fixture is absent, avoiding a silent fallback
to the wrong project.

## Testing and Validation

Extend `apps/github.io/src/app/projects/project-card.spec.tsx` to find the entry
by `id === 'homelab'` and verify:

- the title is `benkim0414/homelab`;
- the repository URL is correct;
- the approved description is retained;
- every approved skill label is present;
- `Kubernetes`, `GitOps`, `Bash`, and `mise` are absent;
- `Amazon S3` intentionally selects the AWS parent brand;
- `homelab-project` and all four capability keys are present.

Extend the skill-brand resolver tests to verify the new Simple Icons mappings,
the vendored MetalLB asset, and text-only results for Sealed Secrets, kube-vip,
and NFS. Extend the project-card Storybook tests to verify that the `Homelab`
story selects the fixture by stable ID and renders its title and skill set.

Run these checks during implementation:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-brand.spec.ts
pnpm nx lint github.io
pnpm nx build github.io
```

Start Storybook on `0.0.0.0` with the machine's Tailscale IPv4 in the allowed
hosts list, then inspect the permanent Homelab story from the iPad. Confirm the
long title, wrapping skill tokens, official logos, text-only fallbacks, GitHub
link, and card boundaries at the iPad viewport size. No browser-specific layout
behavior is introduced.

## Out of Scope

- Changing `ProjectCard` markup, styling, responsiveness, or accessibility.
- Adding a projects page or changing how project cards are arranged.
- Adding generic substitute icons for skills without official logos.
- Changing mappings unrelated to the Homelab skill set.
- Adding hosted applications or repo-local agent skills to the skill list.
- Connecting the project to capability-evidence views beyond the optional
  metadata already supported by the `Project` model.
