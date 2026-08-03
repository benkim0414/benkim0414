# Project Card Design

Date: 2026-08-03

## Goal

Create a reusable `ProjectCard` component for the `github.io` app. The card
should present a portfolio project with its title, description, skills used, and
a GitHub repository link with the GitHub logo icon.

The component should be standalone enough to support a future projects page,
while leaving a clean path for DevOps capability evidence to link to project
cards later.

## Context

The `github.io` app is an Nx React app using Astryx Design, StyleX, Tailwind,
Storybook, Vitest, and Testing Library. Existing reusable card work is centered
around `SkillCard`, which uses Astryx `Card`, `Heading`, `Text`,
`VStack`, `HStack`, and tokenized StyleX list layout. The app already has
`SkillToken` and `getSkillBrand`, which provide Simple Icons-backed skill
branding, including GitHub.

Existing Astryx guidance in this repository establishes these constraints:

- Astryx components should own component anatomy, surface, typography, and
  spacing where matching APIs exist.
- StyleX should own narrow structural overrides such as wrapping lists and
  layout reset.
- Tailwind should stay at wrapper boundaries, not inside reusable component
  internals.
- Component-owned visible headings and prose should use Astryx `Heading` and
  `Text`.
- Visible label text should always use Astryx `Text` with
  `type="supporting"` and `color="secondary"`.

## Recommended Design

Add a new `projects` feature area:

```txt
apps/github.io/src/app/projects/
  project-card.tsx
  project-card.spec.tsx
  project-card.stories.tsx
  project-list.types.ts
  project-list.data.ts
```

Define a project-owned data model rather than coupling the card directly to the
DevOps capability evidence model:

```ts
export interface Project {
  id: string;
  title: string;
  description: string;
  skills: readonly ProjectSkill[];
  githubUrl: string;
  evidenceIds?: readonly string[];
  capabilityKeys?: readonly string[];
}

export interface ProjectSkill {
  label: string;
  brandLabel?: string;
}
```

`evidenceIds` and `capabilityKeys` are optional integration fields for later
DevOps evidence linking. They should not be rendered in the v1 `ProjectCard`.

## Card Structure

`ProjectCard` should follow the existing Astryx card structure:

```tsx
<Card padding={4} xstyle={[styles.root, isFullWidth && styles.fullWidth]}>
  <article aria-labelledby={titleId} data-testid="project-card">
    <VStack gap={4}>
      <VStack gap={2} hAlign="start">
        <Heading id={titleId} level={3}>
          {project.title}
        </Heading>
        <Text type="body" color="secondary" as="p">
          {project.description}
        </Text>
      </VStack>

      <VStack gap={2} hAlign="start">
        <Text type="supporting" color="secondary" as="p">
          Skills used
        </Text>
        <ul aria-label="Skills used" {...stylex.props(styles.skillList)}>
          {project.skills.map((skill) => (
            <li key={`${skill.label}-${skill.brandLabel ?? skill.label}`}>
              <SkillToken label={skill.label} brandLabel={skill.brandLabel} />
            </li>
          ))}
        </ul>
      </VStack>

      <VStack gap={2} hAlign="start">
        <Text type="supporting" color="secondary" as="p">
          Source
        </Text>
        <Citation
          number={1}
          source={githubSource}
          variant="label"
        />
      </VStack>
    </VStack>
  </article>
</Card>
```

The `githubSource` should be derived from `project.githubUrl` and the existing
GitHub brand data:

```ts
const githubBrand = getSkillBrand('GitHub');
const githubSource = {
  title: 'GitHub repository',
  url: project.githubUrl,
  icon: githubBrand?.iconDataUrl,
};
```

The card may expose `isFullWidth?: boolean`, matching `SkillCard`, so it can be
used in both grid and one-column list contexts.

## Typography And Labels

Use Astryx typography for all component-owned text:

- Project title: `Heading level={3}`.
- Project description: `Text type="body" color="secondary" as="p"`.
- Section labels such as `Skills used` and `Source`:
  `Text type="supporting" color="secondary" as="p"`.

Do not use raw styled spans, local font styles, or Tailwind text utilities for
these visible text roles.

## Skills

Render project skills as `SkillToken` values in a wrapping list. This preserves
the existing branded Simple Icons treatment for technologies such as GitHub,
Docker, Kubernetes, TypeScript, and Terraform.

The skill list should use StyleX only for structural list behavior:

- `display: flex`
- `flexWrap: wrap`
- tokenized gap from Astryx spacing variables
- `padding: 0`
- `margin: 0`
- `listStyle: none`

## GitHub Repository Link

Render the repository link with Astryx `Citation variant="label"` and a GitHub
logo icon from `getSkillBrand('GitHub')`. The link should be accessible by name
and point directly to `project.githubUrl`.

The first version should only support GitHub repository URLs because the
requested component specifically asks for a GitHub logo link. Non-GitHub project
links can be handled in a future extension if needed.

## Future DevOps Evidence Linkage

DevOps capability evidence should eventually link to projects through data, not
through a direct component dependency. The preferred future path is:

- project data owns `id`, `evidenceIds`, and optional `capabilityKeys`;
- capability evidence project items can reference a `projectId` or match a
  project by `evidenceIds`;
- evidence views can link to a project page or project card using that stable
  project identifier.

This keeps `ProjectCard` portfolio-owned and lets the DevOps evidence surface
remain a consumer rather than the source of truth for project presentation.

## Boundaries

In scope:

- Add the `Project` and `ProjectSkill` types.
- Add `ProjectCard`.
- Reuse `SkillToken` for skills.
- Reuse `getSkillBrand('GitHub')` for the repository icon.
- Add representative static project data.
- Add focused tests and Storybook stories.

Out of scope:

- Building the full projects page.
- Linking DevOps capability evidence to projects.
- Changing the DevOps capability evidence data model.
- Supporting non-GitHub source links.
- Adding new brand icon infrastructure.
- Changing Astryx theme files or global app styling.

## Testing

Add focused component tests for `ProjectCard`:

- renders the project title as a heading;
- renders the description as body text;
- renders each project skill as a `SkillToken`;
- renders `Skills used` and `Source` labels with the Astryx supporting
  secondary text contract where practical;
- renders a GitHub repository link with the configured `githubUrl`;
- renders the GitHub icon source when the brand data is available;
- supports `isFullWidth` without changing the card content contract.

Add Storybook stories for:

- default project card;
- card with many skills to verify wrapping;
- long title and description;
- full-width/mobile card.

## Validation

Run focused checks during implementation:

```sh
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
pnpm nx lint github.io
pnpm nx build github.io
```

If broader project checks are already fast and stable locally, also run:

```sh
pnpm nx test github.io
```
