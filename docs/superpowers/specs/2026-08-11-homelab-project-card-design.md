# Homelab Project Card Design

## Goal

Add a portfolio project entry for `benkim0414/homelab` that reuses the existing
`ProjectCard` and presents the repository's infrastructure and operational
tooling with the same evidence-backed detail as the Dotfiles entry.

## Scope

This change adds one static `Project` object to `sampleProjects` and extends the
focused project-card data tests. It does not change `ProjectCard`, its layout,
its types, or the projects-page architecture.

The card uses:

- ID: `homelab`
- Title: `homelab`
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
mapping can provide AWS visual metadata. Other skills use their exact label and
the existing brand resolver; unsupported labels remain text-only.

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

No new component, state, network request, dependency, asset, or data-loading
path is introduced.

## Error Handling

The feature has no runtime failure path because the project entry is static,
typed data. TypeScript protects the object shape, while focused tests protect
the stable project identity, curated skill selection, metadata, and URL.
Unsupported skill logos use the existing text-only fallback rather than an
invented or misleading icon.

## Testing and Validation

Extend `apps/github.io/src/app/projects/project-card.spec.tsx` to find the entry
by `id === 'homelab'` and verify:

- the title is `homelab`;
- the repository URL is correct;
- the approved description is retained;
- every approved skill label is present;
- `Kubernetes`, `GitOps`, `Bash`, and `mise` are absent;
- `Amazon S3` intentionally selects the AWS parent brand;
- `homelab-project` and all four capability keys are present.

Run these checks during implementation:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
pnpm nx lint github.io
pnpm nx build github.io
```

Because the card component and layout remain unchanged, no new Storybook story
or browser-specific layout behavior is required. Existing ProjectCard rendering
tests continue to cover the shared UI contract.

## Out of Scope

- Changing `ProjectCard` markup, styling, responsiveness, or accessibility.
- Adding a projects page or changing how project cards are arranged.
- Adding or vendoring logos or changing shared skill-brand mappings.
- Adding hosted applications or repo-local agent skills to the skill list.
- Connecting the project to capability-evidence views beyond the optional
  metadata already supported by the `Project` model.
