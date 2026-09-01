# Jira-Sourced Experience Normalization — Design

**Date:** 2026-09-01
**Status:** Approved design, pending implementation plan
**Scope:** `apps/github.io` experience data

## Goal

Represent delivered professional work as Experience entries in the
github.io app. Source material is the author's delivered ticket history
in a private issue tracker; the published entries are public-safe
capability narratives. Data only — no API work in this effort (a future
task will expose the data).

## Decisions

| Decision | Choice |
| --- | --- |
| Source scope | All delivered (resolution Done) tickets assigned to the author, all tracker projects; support-desk tickets excluded |
| Granularity | Group tickets by theme; one Experience entry per theme |
| Sanitization | No employer name, no internal system or service names, no customer or person names, no ticket keys, no incident dates, no infrastructure identifiers. Narratives describe capability and approach only |
| Work/personal distinction | New required field `kind: 'professional' | 'personal'` on `Experience` |
| Skill gaps | Missing skills are added to `skill-list.data.ts` so `skillIds` always resolve |
| API | Out of scope; future work |
| Tooling | None. Manual curation at implementation time; no committed extraction scripts |

## Data model

No structural change to `Experience` except one addition:

```ts
export interface Experience {
  // ...existing fields...
  readonly kind: 'professional' | 'personal';
}
```

- `kind: 'personal'` on the existing homelab-backed entry.
- `kind: 'professional'` on all new entries.
- `organization` stays optional and is omitted on professional entries
  (public repo; employer not named). Narratives may use neutral context
  such as "an energy-industry platform".

## Normalization rules (every professional entry)

- `id`: kebab-case capability slug; never derived from ticket keys.
- `title`: capability-focused outcome phrase, matching the existing
  entry's style.
- `summary`: one outcome-led sentence.
- `narrative`: exactly 3 paragraphs — (1) what was built or done,
  (2) how it was delivered, (3) the reliability or business boundary it
  established.
- `role`: `'Platform engineer'`.
- `period`: `startedAt`/`endedAt` at `YYYY-MM` precision from the
  earliest/latest resolved dates of the theme's tickets.
- `environments`: `Production`, plus `Staging` where true.
- `projectIds`: `[]` — the project list remains personal projects only.
- `skillIds`: must resolve against `skill-list.data.ts` (catalog
  extended as needed).
- `capabilityKeys`: mapped from the existing `DoraCapabilityKey` set.
- `technologies`: public technology names only.
- `supportingEvidenceIds`: only where an existing public evidence item
  genuinely matches; otherwise omitted.
- `isPublic: true`; `isSensitive` never set.

## Entries

Six professional entries:

| id | Theme | Capability keys |
| --- | --- | --- |
| `nx-monorepo-service-consolidation` | Migrated ~6 standalone backend services into an Nx monorepo; consolidated duplicated services; decommissioned legacy repos and pipelines | `version-control`, `continuous-integration`, `trunk-based-development` |
| `eks-platform-operations` | Production EKS platform lifecycle: upgrades, maintenance, node right-sizing, multi-AZ remediation, capacity expansion, workload migration to managed services | `flexible-infrastructure` |
| `production-observability-stack` | Centralised logging, metrics and error tracking: log aggregation, dashboard/alerting stack upgrades, error monitoring with session replay, database saturation alerting | `monitoring-observability` |
| `production-reliability-engineering` | Eliminated recurring outage causes: connection leaks, database connection exhaustion, memory leak OOM cycles, hidden network failure modes; health probes for stable multi-replica operation | `monitoring-observability`, `deployment-automation` |
| `gitops-deployment-reliability` | Reliable multi-service deployment: GitOps delivery, no silently skipped services, database migration jobs decoupled from service boot | `continuous-delivery`, `deployment-automation` |
| `identity-access-hardening` | Cloud IAM hardening, engineer offboarding, credential hygiene conventions, MFA rollout, least-privilege client permissions | `pervasive-security` |

Implementation pulls the full delivered-ticket history (all pages) at
implementation time via live tracker queries, assigns each ticket to a
theme, and folds or drops tickets that fit no theme. Tickets with a
"Won't Do" resolution are excluded (filter on resolution, not status
category). The ticket-to-theme mapping is working material and is never
committed.

## Skill catalog changes

- Add skills the six entries need but the catalog lacks. Likely
  candidates: argocd, grafana, prometheus, loki, sentry, helm, nx,
  postgresql — the exact gap list is settled at implementation against
  `skill-list.data.ts`.
- New skills follow the existing entry shape, including confidence and
  category.
- Roadmap-inventory invariants
  (`devops-roadmap-skill-inventory.data.spec.ts`) must stay green.

## Testing

Extend `experience.data.spec.ts`:

- `kind` present on every entry.
- Existing invariants hold for each new entry: unique stable ids,
  public and non-sensitive, `skillIds`/`projectIds`/`evidenceIds`
  resolve, 3-paragraph narrative.
- Sanitization guard: no entry text matches the ticket-key pattern
  (`\b[A-Z]+-\d+\b`). Employer-name and internal-system-name absence is
  enforced by review, not by committed strings (a committed ban list
  would republish the names it bans).

Verification commands:

```sh
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

## Out of scope

- Any API surface (static JSON or otherwise) — future work.
- UI changes beyond what existing surfaces render from the data.
- Extraction tooling or scheduled refresh.
