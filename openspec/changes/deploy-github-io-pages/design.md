## Context

GitHub Pages user sites are served from a repository named `<owner>.github.io`. The source repository is `benkim0414/benkim0414`, so v1 deployment publishes built artifacts to `benkim0414/benkim0414.github.io` instead of serving directly from this monorepo.

## Goals / Non-Goals

**Goals:**

- Build `github.io` in CI using pnpm and Nx.
- Publish the built static output to the root of `benkim0414/benkim0414.github.io` on `main`.
- Use an SSH deploy key secret rather than a broad personal token.
- Document required setup without storing secrets in the repository.

**Non-Goals:**

- Do not create the target repository automatically.
- Do not store deploy keys or secrets in tracked files.
- Do not deploy to a project-site subpath.
- Do not change the app implementation except for build/deploy compatibility if required.

## Decisions

- Use GitHub Actions in the source repo so each source change can build and publish the latest static output.
- Push static files to target `main` root because that is the common user-site repository layout for `https://benkim0414.github.io/`.
- Use an SSH deploy key because it can be scoped to the target repo and avoids granting a broader token to the workflow.
- Keep the target repo as a prerequisite because it was not visible from the GitHub API during planning and the user selected prerequisite-only handling.
- Document the required secret name and target repo setup in repo docs or workflow comments.

## Risks / Trade-offs

- Cross-repository deploys require credentials that `GITHUB_TOKEN` cannot provide by default. Mitigation: require a target-repo deploy key secret.
- The workflow can publish broken output if tests are skipped. Mitigation: run install, tests, E2E where practical, and build before publishing.
- Target repo setup is external state. Mitigation: document the prerequisite clearly and make the workflow fail with a clear missing-secret error.
