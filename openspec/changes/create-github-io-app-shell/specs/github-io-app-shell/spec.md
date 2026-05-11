## ADDED Requirements

### Requirement: Nx React app exists

The workspace SHALL contain a generated Nx React application named `github.io` located at `apps/github.io`.

#### Scenario: App project is discoverable

- **GIVEN** dependencies are installed
- **WHEN** `pnpm nx show project github.io --json` is executed
- **THEN** Nx reports a project for the `apps/github.io` application

### Requirement: App builds as static Vite output

The `github.io` app SHALL build static assets suitable for root GitHub Pages hosting.

#### Scenario: Static build succeeds

- **GIVEN** the generated app shell is present
- **WHEN** `pnpm nx build github.io` is executed
- **THEN** the command succeeds and writes static output for the app

### Requirement: Initial tests are runnable

The generated app SHALL include runnable unit and browser smoke test targets.

#### Scenario: Unit tests run

- **GIVEN** the generated app shell is present
- **WHEN** `pnpm nx test github.io` is executed
- **THEN** the command succeeds

#### Scenario: E2E smoke test runs

- **GIVEN** the generated app shell is present
- **WHEN** `pnpm nx e2e github.io-e2e` is executed
- **THEN** the command succeeds against the generated app
