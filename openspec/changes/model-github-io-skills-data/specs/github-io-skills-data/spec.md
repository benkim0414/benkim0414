## ADDED Requirements

### Requirement: Skills use a typed local data model

The app SHALL define local typed data for skills, projects, categories, tags, skill levels, and usage descriptions.

#### Scenario: Data module exports skills and projects

- **GIVEN** the data module exists
- **WHEN** tests import the module
- **THEN** skills and projects are available without network access

### Requirement: Skill levels are bounded

Each skill SHALL use an integer level from 1 through 5.

#### Scenario: Invalid level is rejected by tests

- **GIVEN** the skill seed data is tested
- **WHEN** a skill has a level outside 1 through 5
- **THEN** the validation test fails

### Requirement: Skills use approved categories

Each skill SHALL belong to one approved category from Cloud, Kubernetes, IaC, CI/CD, Observability, Backend, Frontend, or Tools.

#### Scenario: Unknown category is rejected by tests

- **GIVEN** the skill seed data is tested
- **WHEN** a skill uses a category outside the approved set
- **THEN** the validation test fails

### Requirement: Skills include usage evidence

Each skill SHALL include a short description of how or where it was used and at least one related project or usage note.

#### Scenario: Skill has searchable usage context

- **GIVEN** a skill appears in the seed data
- **WHEN** the data validation test inspects it
- **THEN** the skill has non-empty usage context suitable for search results

### Requirement: Placeholder data is replaceable

The seed content SHALL be structured so placeholder entries can be replaced without changing search or UI code.

#### Scenario: Placeholder entry follows production shape

- **GIVEN** a placeholder skill entry exists
- **WHEN** tests validate the entry
- **THEN** it satisfies the same required fields as future real entries
