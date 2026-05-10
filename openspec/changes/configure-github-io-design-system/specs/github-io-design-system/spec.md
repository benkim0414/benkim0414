## ADDED Requirements

### Requirement: Tailwind and shadcn are configured

The `github.io` app SHALL use Tailwind v4 and shadcn/ui component source for its design system.

#### Scenario: Styled app builds

- **GIVEN** Tailwind and shadcn are configured
- **WHEN** `pnpm nx build github.io` is executed
- **THEN** the build succeeds with the app styles included

### Requirement: Theme mode is controllable

The app SHALL allow visitors to choose light, dark, or system theme mode.

#### Scenario: Visitor changes theme mode

- **GIVEN** the app is open
- **WHEN** the visitor selects a theme mode from the theme control
- **THEN** the document theme reflects the selected mode

### Requirement: Theme preference persists

The app SHALL persist the visitor's selected theme mode across reloads.

#### Scenario: Visitor reloads after choosing a theme

- **GIVEN** the visitor has selected a non-default theme mode
- **WHEN** the page is reloaded
- **THEN** the app restores the saved theme mode

### Requirement: System theme follows browser preference

The app SHALL resolve system theme mode from the browser color-scheme preference.

#### Scenario: System mode uses browser preference

- **GIVEN** theme mode is set to system
- **WHEN** the browser color-scheme preference is dark
- **THEN** the app applies the dark theme
