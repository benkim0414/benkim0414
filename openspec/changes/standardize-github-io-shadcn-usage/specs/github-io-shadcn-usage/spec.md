## ADDED Requirements

### Requirement: Existing shadcn primitives are preferred

The `github.io` app SHALL use existing app-local shadcn UI primitives when they match the rendered interaction.

#### Scenario: Action control is rendered

- **GIVEN** an app-local shadcn `Button` primitive exists
- **WHEN** the app renders a button or link that visually behaves like an action
- **THEN** the implementation uses the existing `Button` primitive instead of duplicating button classes inline

### Requirement: No new shadcn components are introduced

The `github.io` app SHALL NOT create, generate, vendor, or install new shadcn component files as part of this change.

#### Scenario: A matching shadcn primitive is missing locally

- **GIVEN** no app-local shadcn primitive exists for an input, card, badge, checkbox, label, or chip
- **WHEN** the UI needs that control or surface
- **THEN** the implementation uses semantic HTML styled with shared tokens instead of adding a new shadcn component file

### Requirement: shadcn configuration remains stable

The app SHALL keep its existing shadcn configuration compatible with app-local components and CSS-variable theming.

#### Scenario: shadcn configuration is inspected

- **GIVEN** `apps/github.io/components.json` exists
- **WHEN** this change is implemented
- **THEN** the `new-york` style, local aliases, and CSS variable theming remain configured

### Requirement: Native semantics are preserved

The app SHALL preserve native accessibility semantics for form controls and result content when no local shadcn primitive is available.

#### Scenario: Visitor searches and filters skills

- **GIVEN** the search panel is rendered
- **WHEN** the visitor uses search text, category filters, or level filters
- **THEN** the controls remain keyboard-accessible and expose appropriate input, fieldset, checkbox, label, or article semantics
