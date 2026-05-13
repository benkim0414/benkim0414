## ADDED Requirements

### Requirement: Skill Results Use SkillCard

The GitHub Pages app MUST render each skill search result through a reusable `SkillCard` component instead of inline result card markup in the search panel.

#### Scenario: Search results render as reusable cards

- **WHEN** the skill search page renders matching skills
- **THEN** each result is rendered by `SkillCard`
- **AND** the search panel does not duplicate the card structure inline for each result.

### Requirement: SkillCard Uses shadcn Card Composition

`SkillCard` MUST use the app-local shadcn Card primitives for the card container and structural card sections.

#### Scenario: A skill result uses shadcn Card

- **WHEN** a skill result is displayed
- **THEN** the outer result surface uses the shadcn Card primitive
- **AND** card title or content areas use shadcn Card subcomponents where they fit the content structure.

### Requirement: SkillCard Uses shadcn Badge For Metadata

`SkillCard` MUST use shadcn Badge styling for category and tag metadata.

#### Scenario: Skill metadata is displayed as badges

- **WHEN** a skill has a category and tags
- **THEN** the category is rendered as a badge
- **AND** each tag is rendered as a badge.

### Requirement: SkillCard Preserves Skill Evidence

`SkillCard` MUST preserve existing skill result content, including title, summary, level, evidence path, and evidence excerpt.

#### Scenario: Existing result details remain visible

- **WHEN** a matching skill has evidence details
- **THEN** the card shows the evidence path
- **AND** the card shows the evidence excerpt without requiring navigation away from the results.
