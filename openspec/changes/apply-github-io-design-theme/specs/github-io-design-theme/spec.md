## ADDED Requirements

### Requirement: DESIGN.md is applied through centralized theme tokens

The `github.io` app SHALL apply the `DESIGN.md` visual direction through centralized CSS variables and Tailwind theme mappings.

#### Scenario: Theme tokens are inspected

- **GIVEN** `DESIGN.md` defines the app palette and visual principles
- **WHEN** the implementation applies the theme
- **THEN** `apps/github.io/src/styles.css` contains the primary color, radius, typography, and surface token mappings used by the app

### Requirement: Theme changes are not component-by-component

The app SHALL NOT implement the design primarily through unrelated per-component hard-coded color and font choices.

#### Scenario: A future accent color changes

- **GIVEN** the violet accent palette needs to be adjusted
- **WHEN** an implementer updates the centralized theme tokens
- **THEN** buttons, focus rings, active filters, and highlighted metadata can inherit the change without rewriting each component's color system

### Requirement: shadcn CSS-variable theming is preserved

The app SHALL continue to use shadcn's CSS-variable theming model.

#### Scenario: shadcn component consumes theme tokens

- **GIVEN** an app-local shadcn component uses semantic classes
- **WHEN** the theme is applied
- **THEN** the component receives colors, border, and ring values from CSS variables instead of inline literal palette values

### Requirement: Developer fonts are accent-only

The app SHALL use developer or monospace font treatment only for compact interface accents.

#### Scenario: Visitor reads skill evidence

- **GIVEN** the page contains headings, paragraphs, metadata, counters, and tags
- **WHEN** the design theme is applied
- **THEN** paragraphs and long descriptions remain sans-serif while metadata, counters, tags, and command-like labels may use the developer accent font

### Requirement: Bits-inspired details remain subtle and accessible

The app SHALL express aliased and bits-inspired styling through restrained reusable treatments that preserve readability.

#### Scenario: Visitor uses the app on desktop or mobile

- **GIVEN** the themed page is rendered
- **WHEN** the visitor reads text, focuses controls, or scans result cards
- **THEN** borders, texture, status marks, and highlights do not obscure content, reduce focus visibility, or cause text/control overlap

### Requirement: Theme mode behavior remains intact

The app SHALL preserve existing light, dark, and system theme behavior while applying the new design tokens.

#### Scenario: Visitor cycles theme mode

- **GIVEN** the theme toggle is available
- **WHEN** the visitor changes between light, dark, and system modes
- **THEN** the document theme updates and remains readable in each mode
