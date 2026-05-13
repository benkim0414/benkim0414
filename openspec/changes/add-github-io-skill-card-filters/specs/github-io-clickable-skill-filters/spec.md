## ADDED Requirements

### Requirement: Category Badges Toggle Category Filters

Skill category badges MUST be clickable controls that toggle the clicked category in the active search filters.

#### Scenario: User filters by card category

- **GIVEN** the user is viewing skill search results
- **WHEN** the user clicks a category badge on a skill card
- **THEN** the results are filtered to matching skills in that category
- **AND** the URL includes the selected `category` query parameter.

### Requirement: Tag Badges Toggle Tag Filters

Skill tag badges MUST be clickable controls that toggle the clicked tag in the active search filters.

#### Scenario: User filters by card tag

- **GIVEN** the user is viewing skill search results
- **WHEN** the user clicks a tag badge on a skill card
- **THEN** the results are filtered to skills with that tag
- **AND** the URL includes the selected `tag` query parameter.

### Requirement: Active Badge Filters Toggle Off

Clicking an already active category or tag badge MUST remove that filter.

#### Scenario: User removes a category from a card badge

- **GIVEN** a category filter is active
- **WHEN** the user clicks a matching active category badge
- **THEN** that category filter is removed
- **AND** the URL no longer includes that category value.

#### Scenario: User removes a tag from a card badge

- **GIVEN** a tag filter is active
- **WHEN** the user clicks a matching active tag badge
- **THEN** that tag filter is removed
- **AND** the URL no longer includes that tag value.

### Requirement: Tag Filters Compose With Existing Filters

Tag filters MUST compose with query, category, and level filters without replacing them.

#### Scenario: User combines tag and category filters

- **GIVEN** a category filter is active
- **WHEN** the user clicks a tag badge
- **THEN** results only include skills that match the active category filter
- **AND** match at least one selected tag.

#### Scenario: User selects multiple tags

- **GIVEN** multiple tag filters are active
- **WHEN** results are evaluated
- **THEN** a skill matches the tag group when it has at least one selected tag.

### Requirement: Badge Filter Controls Are Accessible

Clickable category and tag badges MUST be keyboard accessible and expose their selected state to assistive technologies.

#### Scenario: User activates a tag badge with keyboard

- **WHEN** keyboard focus is on a tag badge
- **AND** the user activates it with the keyboard
- **THEN** the tag filter toggles the same way as a pointer click
- **AND** the control communicates whether the filter is selected.
