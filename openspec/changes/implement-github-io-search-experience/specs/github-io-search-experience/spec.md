## ADDED Requirements

### Requirement: Skills are fuzzy searchable

The app SHALL search skills using Fuse.js across skill names, descriptions, tags, project names, project descriptions, and usage notes.

#### Scenario: Query matches related project text

- **GIVEN** a skill is associated with a project whose description contains the searched term
- **WHEN** the visitor searches for that term
- **THEN** the related skill appears in the results

#### Scenario: Query tolerates minor typo

- **GIVEN** a visitor mistypes a skill-related word
- **WHEN** the search is executed
- **THEN** relevant matching skills still appear when Fuse.js considers them close matches

### Requirement: Filters combine with text search

The app SHALL combine category and level filters with the active search query.

#### Scenario: Category filter narrows query results

- **GIVEN** a search query matches skills in multiple categories
- **WHEN** the visitor selects one category filter
- **THEN** only matching skills in that category remain visible

#### Scenario: Level filter narrows query results

- **GIVEN** a search query matches skills at multiple levels
- **WHEN** the visitor selects one skill level filter
- **THEN** only matching skills at that level remain visible

### Requirement: Search state is URL-synced

The app SHALL synchronize query, category filters, and level filters with URL parameters.

#### Scenario: URL initializes search state

- **GIVEN** the page opens with search parameters in the URL
- **WHEN** the app initializes
- **THEN** the search controls and results reflect those parameters

#### Scenario: Control changes update URL

- **GIVEN** the app is open
- **WHEN** the visitor changes the query or filters
- **THEN** the URL updates to represent the current search state

### Requirement: Empty state is visible

The app SHALL show a clear empty state when no skills match the current search and filters.

#### Scenario: No results match

- **GIVEN** a query and filters match no skills
- **WHEN** results are rendered
- **THEN** the visitor sees an empty result state instead of stale results
