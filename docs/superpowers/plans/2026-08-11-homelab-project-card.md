# Homelab Project Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an evidence-backed `homelab` entry to the existing portfolio project-card data and protect its approved content with focused tests.

**Architecture:** Extend the static `sampleProjects` collection with one object that conforms to the existing `Project` interface. Reuse `ProjectCard` and the shared skill-brand resolver unchanged; a focused Vitest contract verifies the complete curated data entry and its explicit exclusions.

**Tech Stack:** TypeScript, React fixture data, Vitest, Testing Library, Nx, pnpm, Astryx project-card primitives

## Global Constraints

- Use `homelab` as the card title and `homelab` as its stable ID.
- Use `https://github.com/benkim0414/homelab` as the repository URL.
- Include exactly these skill labels in this order: K3s, Argo CD, Helm, Ansible, kubectl, Tailscale, Sealed Secrets, Traefik, Longhorn, MetalLB, kube-vip, Prometheus, Grafana, Loki, Alloy, PostgreSQL, Redis, NFS, Amazon S3, Renovate.
- Give `Amazon S3` the existing AWS parent brand with `brandLabel: 'AWS'`; do not add or change shared brand mappings.
- Do not include Kubernetes, GitOps, Bash, mise, hosted applications, or repo-local agent skills.
- Preserve `ProjectCard`, project types, layout, styling, accessibility behavior, dependencies, assets, and Storybook stories unchanged.
- Use `homelab-project` as the evidence ID.
- Use `deployment-automation`, `flexible-infrastructure`, `monitoring-observability`, and `pervasive-security` as the capability keys, in that order.

---

## File Structure

- `apps/github.io/src/app/projects/project-list.data.ts`: owns the new static Homelab project entry beside the existing Dotfiles entry.
- `apps/github.io/src/app/projects/project-card.spec.tsx`: owns the stable data contract for the Homelab entry while retaining shared `ProjectCard` rendering coverage.

### Task 1: Add the Homelab project data contract and entry

**Files:**
- Modify: `apps/github.io/src/app/projects/project-card.spec.tsx`
- Modify: `apps/github.io/src/app/projects/project-list.data.ts`

**Interfaces:**
- Consumes: `sampleProjects: readonly Project[]` and the existing `Project` shape from `project-list.types.ts`.
- Produces: one `Project` with `id: 'homelab'`, consumed by existing project-card surfaces without component changes.

- [ ] **Step 1: Check the applicable Astryx guidance and existing data contract**

Run:

```bash
pnpm exec astryx docs principles
sed -n '1,180p' apps/github.io/src/app/projects/project-list.data.ts
sed -n '1,120p' apps/github.io/src/app/projects/project-list.types.ts
sed -n '1,120p' apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: the Astryx guidance does not require a new component for a second
static project; `Project` already supports `skills`, `evidenceIds`, and
`capabilityKeys`; the focused spec already owns project data contracts.

- [ ] **Step 2: Write the failing Homelab data test**

Add this test inside the existing `describe('project data', ...)` block in
`apps/github.io/src/app/projects/project-card.spec.tsx`, after the Dotfiles data
test and before the optional-metadata test:

```tsx
it('provides evidence-backed homelab project data', () => {
  const project = sampleProjects.find((item) => item.id === 'homelab');

  expect(project).toEqual({
    id: 'homelab',
    title: 'homelab',
    description:
      'Self-managed K3s homelab automated with Argo CD and Helm, with private networking, encrypted secrets, distributed storage, observability, databases, and off-site backups.',
    skills: [
      { label: 'K3s' },
      { label: 'Argo CD' },
      { label: 'Helm' },
      { label: 'Ansible' },
      { label: 'kubectl' },
      { label: 'Tailscale' },
      { label: 'Sealed Secrets' },
      { label: 'Traefik' },
      { label: 'Longhorn' },
      { label: 'MetalLB' },
      { label: 'kube-vip' },
      { label: 'Prometheus' },
      { label: 'Grafana' },
      { label: 'Loki' },
      { label: 'Alloy' },
      { label: 'PostgreSQL' },
      { label: 'Redis' },
      { label: 'NFS' },
      { label: 'Amazon S3', brandLabel: 'AWS' },
      { label: 'Renovate' },
    ],
    githubUrl: 'https://github.com/benkim0414/homelab',
    evidenceIds: ['homelab-project'],
    capabilityKeys: [
      'deployment-automation',
      'flexible-infrastructure',
      'monitoring-observability',
      'pervasive-security',
    ],
  });

  const skillLabels = project?.skills.map(({ label }) => label) ?? [];

  expect(skillLabels).not.toEqual(
    expect.arrayContaining(['Kubernetes', 'GitOps', 'Bash', 'mise']),
  );
});
```

- [ ] **Step 3: Run the focused test to verify it fails**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: FAIL because `sampleProjects.find((item) => item.id === 'homelab')`
returns `undefined`.

- [ ] **Step 4: Add the minimal Homelab project entry**

Append this object after the existing Dotfiles object in
`apps/github.io/src/app/projects/project-list.data.ts`:

```ts
{
  id: 'homelab',
  title: 'homelab',
  description:
    'Self-managed K3s homelab automated with Argo CD and Helm, with private networking, encrypted secrets, distributed storage, observability, databases, and off-site backups.',
  skills: [
    { label: 'K3s' },
    { label: 'Argo CD' },
    { label: 'Helm' },
    { label: 'Ansible' },
    { label: 'kubectl' },
    { label: 'Tailscale' },
    { label: 'Sealed Secrets' },
    { label: 'Traefik' },
    { label: 'Longhorn' },
    { label: 'MetalLB' },
    { label: 'kube-vip' },
    { label: 'Prometheus' },
    { label: 'Grafana' },
    { label: 'Loki' },
    { label: 'Alloy' },
    { label: 'PostgreSQL' },
    { label: 'Redis' },
    { label: 'NFS' },
    { label: 'Amazon S3', brandLabel: 'AWS' },
    { label: 'Renovate' },
  ],
  githubUrl: 'https://github.com/benkim0414/homelab',
  evidenceIds: ['homelab-project'],
  capabilityKeys: [
    'deployment-automation',
    'flexible-infrastructure',
    'monitoring-observability',
    'pervasive-security',
  ],
},
```

Do not change `Project`, `ProjectSkill`, `ProjectCard`, shared brand metadata, or
Storybook fixtures.

- [ ] **Step 5: Run the focused test to verify it passes**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: PASS, including the existing Dotfiles, component, and Storybook
contract tests in the same file.

- [ ] **Step 6: Run final application validation**

Run:

```bash
pnpm nx lint github.io
pnpm nx build github.io
```

Expected: both commands exit successfully. A browser or Storybook run is not
required because the shared card markup and layout are unchanged.

- [ ] **Step 7: Review and commit the implementation**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/app/projects/project-list.data.ts apps/github.io/src/app/projects/project-card.spec.tsx
git status --short
git add apps/github.io/src/app/projects/project-list.data.ts apps/github.io/src/app/projects/project-card.spec.tsx
git diff --cached
git commit -m "feat(github.io): add homelab project card"
```

Expected: the staged diff contains only the Homelab data entry and its focused
contract test, and the commit succeeds with the repository's conventional
commit rules.
