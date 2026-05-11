## ADDED Requirements

### Requirement: Search is the primary first-screen interaction

The showcase SHALL present skill search and filters as the primary interaction near the top of the single page.

#### Scenario: Visitor lands on the page

- **GIVEN** the visitor opens the app
- **WHEN** the first screen is rendered
- **THEN** the search input and core filters are visible without navigating to another route

### Requirement: Skill cards show evidence

Each visible skill card SHALL show the skill name, level, category, tags, usage description, and related project context.

#### Scenario: Visitor reviews a skill result

- **GIVEN** search results are visible
- **WHEN** the visitor reads a skill card
- **THEN** the card provides both the skill level and evidence of how or where the skill was used

### Requirement: Contact links are available

The showcase SHALL include contact links for email and LinkedIn.

#### Scenario: Visitor wants to contact the owner

- **GIVEN** the visitor is viewing the showcase
- **WHEN** the contact section or header actions are rendered
- **THEN** email and LinkedIn links are available

### Requirement: Page remains single-route

The showcase SHALL remain a single-page experience without app-level route navigation.

#### Scenario: Visitor searches and filters

- **GIVEN** the visitor changes search state
- **WHEN** the results update
- **THEN** the app stays on the same page and reflects state through URL parameters only

### Requirement: Layout is responsive

The showcase SHALL remain readable and usable on desktop and mobile viewport sizes.

#### Scenario: Mobile visitor uses search

- **GIVEN** the viewport is mobile width
- **WHEN** the visitor searches and reviews results
- **THEN** controls and result cards are visible without overlapping text or controls
