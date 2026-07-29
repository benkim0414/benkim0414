# DevOps Evidence Radar Curated Scores Design

## Goal

Reimplement `DevOpsCapabilityEvidenceRadar` as a radar-only visualization that shows the selected 10 DevOps technical capability axes with shortened labels and curated conservative scores.

The radar should communicate current capability evidence honestly on a five-point scale while never using a perfect `5` score.

## Scope

This design applies only to the existing evidence radar component and its Storybook/test data:

- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx`
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx`
- `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx`
- shared evidence data/types/tests only where required to expose curated radar scores

Do not reintroduce non-radar DevOps capability evidence components.

## Capability Set

Use the existing 10-axis DevOps technical capability set. This is a focused technical subset of the broader DORA capability catalog and is appropriate for public portfolio evidence because the axes map to concrete delivery, CI/CD, infrastructure, documentation, and version-control work.

Use shortened labels on the visible radar axes:

| Capability | Axis Label | Score |
| --- | --- | ---: |
| Continuous Delivery | Delivery | 4/5 |
| Deployment Automation | Deploys | 4/5 |
| Continuous Integration | CI | 4/5 |
| Test Automation | Tests | 3/5 |
| Monitoring and Observability | Observability | 3/5 |
| Flexible Infrastructure | Infrastructure | 4/5 |
| Pervasive Security | Security | 2/5 |
| Trunk-Based Development | Trunk | 4/5 |
| Documentation Quality | Docs | 4/5 |
| Version Control | Versioning | 4/5 |

The chart scale remains `maxScore: 5`, but no curated score may be `5`.

## Evidence Basis

The score table is manually curated from the user's public-safe capability evidence collected during brainstorming.

Summary evidence by capability:

- Delivery: CI/CD pipelines across CodePipeline, CodeBuild, GitHub Actions, legacy app CI introduction, Nx affected delivery checks, ECR image publishing, SAM deployment, staging and production flow.
- Deploys: automated PR-to-production deployment path with production approval, EKS deployments, ArgoCD, GitOps operations repo, Kustomize, Helm for infrastructure apps, AWS SAM, immutable image digests, sealed secret migration.
- CI: monorepo and multi-repo CI workflows, Nx affected graph/caching/parallelism, lint/build/test/type-check PR checks, CodePipeline-to-GitHub Actions migration, Jenkins-to-CodePipeline cost reduction.
- Tests: CI test execution, Nx affected tests, Jest unit/integration tests, Testcontainers with PostgreSQL, regression gate before merge.
- Observability: ELK, Kubernetes dashboard, AWS X-Ray, Grafana, Prometheus, Alloy, Loki, Sentry Replay, Expo mobile deployment context, readiness/liveness probes.
- Infrastructure: EKS, SQS, Lambda, SAM, CloudFormation, S3, RDS, Terraform Cloud, Pulumi-to-Terraform migration, IRSA, Docker Compose, Minikube, Skaffold.
- Security: conservative score for IRSA/OIDC/service accounts, short-lived credential direction, GitHub Actions secrets, AWS Parameter Store, Secrets Manager, sealed secrets, approval gates, protected environments, required reviews, incident reports, and image digests. It remains lower because deeper scanning, policy enforcement, audit/compliance, RBAC/network hardening, and security testing evidence was not provided.
- Trunk: short-lived branches, frequent PRs to main, same feature/hotfix workflow, feature flags, required CI before merge, branch protection, small PRs, code review, required checks.
- Docs: Nx generator documentation context, migration runbooks, ADRs, monorepo README, agent decision/spec/learning docs, architecture and decision docs, LLM wiki/OpenWiki direction, Confluence incident reports.
- Versioning: GitHub primary VCS, GitLab familiarity, monorepo and multi-repo workflows, conventional commits, semantic versioning, changelogs, tags, release automation, GitOps source of truth, codebase/operations repo coordination, image digests, rollback via Helm/kubectl/ArgoCD.

These evidence summaries are not rendered as evidence item components in this iteration.

## Component Contract

`DevOpsCapabilityEvidenceRadar` should remain a leaf visualization that accepts:

```ts
interface DevOpsCapabilityEvidenceRadarProps {
  scores: readonly DoraCapabilityScore[];
}
```

The default Storybook story should provide curated radar-ready scores. The visible chart should use each score's `label`, with the curated data supplying the shortened label.

The component should:

- render every score with `score > 0`;
- return `null` when `scores` is empty or all scores are `0`;
- keep the MUI X chart visual-only with `aria-hidden="true"` and keyboard navigation disabled;
- keep the hidden accessible score summary;
- keep the responsive wrapper that supports iPad and narrow viewports;
- avoid titles, cards, dashboard chrome, evidence lists, popovers, selectors, badges, or route wiring.

## Visual Design

Preserve the current radar visual conventions:

- MUI X `RadarChart`;
- circular shape;
- five divisions;
- filled radar area;
- Astryx token colors for foreground, background, text, and chart theme;
- stable chart height;
- responsive `width: 100%` wrapper with max width and usable minimum width.

Short labels are required to prevent the 10-axis chart from crowding.

## Testing

Focused tests should verify:

- all 10 curated axes render through the Storybook/default score data;
- curated scores use shortened labels;
- no curated score is `5`;
- hidden accessible summary includes the shortened labels and approved scores;
- empty input returns `null`;
- all-zero input returns `null`;
- the responsive wrapper contract remains present;
- chart semantics remain visual-only.

Recommended validation commands:

```bash
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
pnpm nx test github.io -- --run src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
pnpm nx build github.io
```

## Out Of Scope

This implementation should not:

- add evidence item components;
- tokenize or render the user's evidence sentences;
- reintroduce deleted non-radar evidence visualizations;
- derive the curated scores from evidence weights;
- add interactive selectors, popovers, or detail panels;
- add page or route wiring;
- change global Astryx theme or chart styling;
- use a perfect `5` score.

## Risks

The main design risk is label crowding on the 10-axis radar. Short labels are required, and the Storybook view should be checked visually on tablet-sized viewports.

The second risk is future confusion between curated score data and evidence-derived scoring utilities. The implementation should name curated radar data clearly and keep tests explicit that these are manually approved scores.
