## ADDED Requirements

### Requirement: Workflow builds the app before deployment

The deployment workflow SHALL install dependencies and build the `github.io` app before publishing artifacts.

#### Scenario: Deployment workflow runs

- **GIVEN** the workflow is triggered with required secrets configured
- **WHEN** the build job runs
- **THEN** it installs dependencies and executes the `github.io` build target before publishing

### Requirement: Workflow publishes to user-site repository

The deployment workflow SHALL publish the built static output to the root of `benkim0414/benkim0414.github.io` on the `main` branch.

#### Scenario: Publish step succeeds

- **GIVEN** the target repository exists and deploy credentials are configured
- **WHEN** the publish step runs after a successful build
- **THEN** the built static files are pushed to the target repository root on `main`

### Requirement: Deployment uses deploy key secret

The deployment workflow SHALL authenticate with an SSH deploy key secret scoped to the target repository.

#### Scenario: Secret is missing

- **GIVEN** the deploy key secret is not configured
- **WHEN** the workflow reaches the publish step
- **THEN** deployment fails before publishing and does not expose secret material in logs

### Requirement: Deployment prerequisites are documented

The repository SHALL document the required target repo and deploy key setup for publishing the site.

#### Scenario: Maintainer prepares deployment

- **GIVEN** a maintainer reads the deployment documentation
- **WHEN** they configure the target repo and secret
- **THEN** they know the target repository, branch, secret purpose, and expected Pages source
