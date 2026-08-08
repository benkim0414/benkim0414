# DORA Capability Skill Evidence Design

## Goal

Extend the Continuous Integration DORA capability card with a supplemental,
evidence-backed skills row while preserving the existing five curated experience
items. Add three newly identified atomic experience records to the full public CI
catalog, establish a stronger global evidence-group order, and render accurate
icons for every selected skill.

## Context

The current CI work stores 15 public-safe atomic experience records in the shared
capability evidence catalog. The compact card selects five of those records in a
deliberate two-AWS-plus-three-GitHub balance and renders them through
`CapabilityEvidence`.

The evidence model already supports `type: 'skill'`, `supportingEvidenceIds`, and
`SkillToken`. The card also groups evidence by type, but its current order places
skills before applied work and collapses experience, projects, learning, and
education into one `other` group. This extension should reuse the established
evidence path rather than add a CI-specific renderer or couple capability data to
the main Skills page.

## Recommended Approach

Represent each selected CI skill as a first-class `CapabilityEvidenceItem` with
`type: 'skill'`. Each skill record references the atomic experience records that
support it. Append the skill IDs after the existing five experience IDs in the CI
score, then group the rendered items into a global evidence order that prioritizes
applied work.

This is preferred over deriving skills from `technologies`, because the raw
technology union contains incidental tools and cannot express the approved
capability boundary. It is preferred over referencing the main Skills page because
that would require unrelated ratings, categories, descriptions, and search
metadata.

## Catalog Boundaries

Keep two explicit CI datasets:

- the existing experience dataset, expanded from 15 to 18 atomic records; and
- a new 13-item skill evidence dataset.

Compose both into `devOpsCapabilityEvidenceItems`. All IDs must remain globally
unique. The experience dataset remains conceptually distinct so a future
capability page can retrieve and group the complete applied-work history without
mistaking skill summaries for atomic accomplishments.

The full CI catalog will therefore contain 18 experience records and 13 skill
records. The compact card will continue to show only five selected experience
records, followed by all 13 selected skills.

## Additional Atomic Experience

Add these records to the AWS CodePipeline initiative. None enters the compact
card's five-item experience selection.

### Reusable Helm deployment image

- ID: `reusable-helm-deployment-image`
- Public summary: maintained a reusable Docker and Helm build image used by AWS
  CodeBuild projects to deploy applications to Amazon EKS.
- Technologies may include AWS CodeBuild, Amazon ECR, Docker, Helm, and Amazon
  EKS.
- Preserve the generalized measurements that 44 of 105 build projects used the
  image and that the portfolio owner contributed 24 of 51 changes to it.
- Use the 2026-08-07 source snapshot date for these measurements.

"Reusable" means one centrally maintained CI build image consumed by many build
projects. It does not imply that the image was public or shared outside the private
organization.

### Build-status visibility

- ID: `codebuild-status-visibility`
- Public summary: made CI results visible through build badges and GitHub commit
  statuses configured by the reusable Terraform platform.
- Preserve the 2026-08-07 measurements of 98 of 105 projects with build badges and
  91 of 105 projects reporting GitHub commit status.
- Technologies may include Terraform, AWS CodeBuild, and GitHub.

This remains distinct from `codebuild-pr-gates`: PR gates describe when and what
verification ran, while this record describes systematic result visibility across
the broader fleet.

### CodeBuild runtime upgrades

- ID: `codebuild-runtime-upgrades`
- Public summary: maintained the CI platform through successive AWS CodeBuild
  standard-image generations and associated delivery-platform updates.
- Facts may state the standard-image progression from generation 5 to 6 in March
  2023 and to generation 7 in March 2025.
- Use `2019-07-05` through `2025-03-18` as the established public
  platform-ownership period. Keep the individual upgrades as month-level facts
  rather than inventing exact upgrade dates that the source does not provide.
- Technologies may include AWS CodeBuild and Terraform.

This record is supporting evidence of sustained platform ownership. It does not
replace a current top-five item.

## Skill Evidence Set

Add these 13 skills in this exact order, using their official public names:

1. Terraform
2. AWS CodePipeline
3. AWS CodeBuild
4. Amazon ECR
5. GitHub
6. AWS Systems Manager Parameter Store
7. Docker
8. Nx
9. GitHub Actions
10. OpenID Connect
11. Kustomize
12. Helm
13. Argo CD

Do not add Git separately because GitHub provides sufficient source-control context
for this compact capability list. Do not include PostgreSQL or Amazon RDS: they are
test infrastructure rather than demonstrated CI competencies. Also omit incidental
support tooling such as Slack, JavaScript, TypeScript, `yq`, Prometheus, commitlint,
and Husky.

Each skill record must:

- use `type: 'skill'`;
- map to `continuous-integration`;
- remain public and non-sensitive;
- use a concise internal summary without adding visible card copy;
- list itself in `technologies`; and
- reference at least one existing experience record through
  `supportingEvidenceIds`.

Use focused supporting links rather than linking every record that mentions a
technology:

| Skill | Primary supporting evidence |
|---|---|
| Terraform | Terraform pipelines |
| AWS CodePipeline | Terraform pipelines; webhook trunk delivery |
| AWS CodeBuild | CodeBuild PR gates; feedback tuning; runtime upgrades |
| Amazon ECR | Immutable ECR promotion; OIDC image publishing; reusable Helm image |
| GitHub | CodeBuild PR gates; Nx affected quality gates |
| AWS Systems Manager Parameter Store | PostgreSQL test gates |
| Docker | Immutable ECR promotion; container verification; OIDC image publishing; reusable Helm image |
| Nx | Nx monorepo migration; Nx affected quality gates |
| GitHub Actions | Nx affected quality gates; OIDC image publishing; GitOps handoff |
| OpenID Connect | OIDC image publishing |
| Kustomize | GitOps handoff; tag-update reliability |
| Helm | Reusable Helm deployment image |
| Argo CD | GitOps handoff |

## Compact Card Selection

Keep the CI score at 4 of 5. Keep these five experience IDs first and unchanged:

1. `terraform-codepipeline-platform`
2. `codebuild-pr-gates`
3. `nx-affected-quality-gates`
4. `github-actions-gitops-handoff`
5. `kustomize-tag-update-reliability`

Append the 13 skill evidence IDs in the approved skill order. Update the selected
counts to `{ experience: 5, skill: 13 }`. Keep
`strongestEvidenceId: 'terraform-codepipeline-platform'`.

The three additional experience records remain in the shared catalog for the
future dedicated capability page and as supporting evidence for skills. They do
not expand or replace the compact five-item experience row.

## Global Evidence Grouping

Replace the current `skills`, `certifications`, `other` grouping with these semantic
groups and global order:

1. `applied`: `experience`, `project`
2. `certifications`: `certification`
3. `skills`: `skill`
4. `learning`: `learning`, `education`

This order presents demonstrated work first, externally verified credentials
second, summarized competencies third, and knowledge-building sources last.
Projects and experience share one applied-evidence row because both demonstrate
work performed. Learning and formal education share one final row because both
support knowledge acquisition.

Rows remain visually unlabeled to preserve the current compact card. Their ARIA
labels must use the new semantic group names, such as `Continuous Integration
applied evidence` and `Continuous Integration skill evidence`.

## Component And Data Flow

Do not create a CI-specific skill component. Preserve the shared rendering path:

```text
DoraCapabilityCard
  -> CapabilityEvidence
    -> SkillEvidenceToken
      -> SkillToken
```

`DoraCapabilityCard` resolves selected items from the shared evidence catalog and
score, groups them in the approved order, and passes each item to
`CapabilityEvidence`. `CapabilityEvidence` continues to select the skill rendering
path based on `type: 'skill'`.

Only the token label and icon are visible. Skill summaries and supporting evidence
relationships remain available to tests, accessibility behavior, and the future
capability page. Skill tokens are non-clickable and do not introduce hover cards or
new interaction states.

## Icon Strategy

Extend the shared skill-brand/icon model to support both:

- the existing monochrome SVG paths supplied by Simple Icons; and
- locally bundled full-color SVG image assets.

Use current official AWS Architecture icons for:

- AWS CodePipeline;
- AWS CodeBuild;
- Amazon Elastic Container Registry; and
- AWS Systems Manager.

AWS Systems Manager Parameter Store uses the Systems Manager service icon because
AWS does not publish Parameter Store as a separate service icon. Download the
current assets from <https://aws.amazon.com/architecture/icons/> during
implementation, store them under the app's skill assets, and do not hotlink them at
runtime. Record source URLs, upstream package/version or publication date when
available, and retrieval date in an adjacent provenance document.

Use the installed Simple Icons package for Terraform, GitHub, Docker, Nx, GitHub
Actions, OpenID Connect, Helm, and Argo CD. Use the recognized Devicon Kustomize
mark as a locally bundled asset because the upstream Kustomize project does not
publish a dedicated official brand asset. Record its public source and license in
the same provenance document.

The icon is decorative inside each token. The visible skill name and existing
group ARIA label provide the accessible text. Preserve stable token and icon
dimensions, existing wrapping, and Astryx spacing. Full-color image assets must not
inherit monochrome path fill styles.

## Privacy Rules

Continue applying the established DORA evidence privacy policy. Public data and
asset metadata must not contain:

- employer names;
- private repository, service, workflow, module, or image names;
- AWS account IDs or regions;
- secret or AWS Systems Manager parameter paths;
- business-domain identifiers;
- private source links; or
- copied private-source prose.

Public technology names, generalized context, dates, counts, percentages, and
ratios remain allowed. The locally bundled icons and their provenance must point
only to public official or open-source sources.

## Validation

Focused data tests must verify:

- the experience dataset contains 18 atomic records;
- the skill dataset contains exactly 13 records in the approved order;
- all IDs are globally unique;
- every skill is public, maps to CI, and has at least one supporting evidence ID;
- every supporting ID resolves to an experience record;
- the five experience IDs remain unchanged and precede the 13 skill IDs;
- the CI score remains 4 of 5 with the same strongest evidence;
- selected counts are exactly `{ experience: 5, skill: 13 }`;
- new measurements, periods, and initiative IDs satisfy the established structured
  data rules; and
- new public content passes privacy checks.

Component and Storybook tests must verify:

- global row order is applied, certifications, skills, then learning;
- projects group with experience and education groups with learning;
- `CapabilityEvidence` renders every CI skill through `SkillToken`;
- every selected CI skill resolves a real, non-fallback icon;
- the four AWS skills resolve their designated local official assets;
- the CI story renders the exact five experience labels followed by the exact 13
  skill labels; and
- tokens wrap without overflow at phone and iPad widths.

Run the focused DORA evidence suite and the spec TypeScript check, followed by the
app's Nx test, lint, production build, and Storybook build targets. Perform visual
Storybook verification at mobile and iPad widths after implementation.

## Error Handling

All evidence and icon mappings are local static data. There is no loading or network
state. Missing supporting IDs, invalid counts, privacy violations, or missing icon
mappings must fail tests. Existing generic icon fallback behavior may remain for
other evidence, but every selected CI skill is required to resolve its intended
brand asset.

## Out Of Scope

- Changing the CI score or strongest evidence
- Expanding the compact card beyond five experience items
- Building the dedicated capability page
- Adding the 13 capability skills to the main Skills page
- Adding ratings, categories, descriptions, or search metadata to the Skills page
- Adding hover cards, links, or visible row headings to skill tokens
- Refreshing private-source metrics beyond the approved 2026-08-07 snapshot
- Publishing or linking private repositories, workflows, modules, or image names

## Acceptance Criteria

- The full public CI catalog contains 18 atomic experience records and 13
  evidence-backed skill records.
- The compact CI card shows the unchanged five experience tokens first and the 13
  name-only skill tokens second.
- The card uses the global applied, certifications, skills, learning order.
- Every selected skill has the approved icon, including official local AWS service
  icons and the Systems Manager icon for Parameter Store.
- The three new experience records retain approved generalized measurements without
  exposing private identifiers.
- The CI story uses shared production data and passes phone and iPad visual checks.
- Focused tests, TypeScript validation, Nx test, lint, app build, and Storybook build
  complete without feature-introduced failures.
