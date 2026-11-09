# github.io verification map

This directory is the maintained source for verifying visitor-facing behavior of `apps/github.io`. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `control-github-io launch` so the run owns preview + Chrome CDP.
- Set `GITHUB_IO_VERIFY_RUN_ID` (and optionally `GITHUB_IO_VERIFY_RUN_DIR`) so concurrent runs do not share state.
- Put the helper on your command line as `CONTROL` (see the skill body).
- Run `control-github-io doctor` and require `ok: true` for the expected `baseUrl` and Home landmark.
- Never drive an instance that was not started by this verification run.
- Default proof viewport is desktop (≥768px) unless a feature file says otherwise. Phone journeys must open the `Navigation` drawer.

## Driving conventions

- Start every recipe from the baseline Home state unless its preconditions say otherwise.
- Prefer ARIA roles, accessible names, and the selectors already asserted in app specs / the mobile-layout verifier.
- Treat every command as literal. Keep quoted names and flags unchanged.
- Run browser actions through `control-github-io browser`.
- Restore theme to dark after theme mutations when continuing into another feature in the same run.
- Do not remove proof artifacts during cleanup.

## Proof and skip reporting

- Capture the user action and the resulting state, not only the final screen.
- UI proof includes an ARIA snapshot and a screenshot with the page identity visible (heading or landmark).
- Mutation proof for theme includes reading `document.documentElement.getAttribute('data-theme')`.
- Record the feature ID and entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with control-github-io` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Home landing](./home.md) covers the Home landmark, Top skills, DORA region, and Show all.
- [Skills catalogue](./skills.md) covers Skills navigation, search, and opening a skill row.
- [Skill detail](./skill-detail.md) covers `/skills/:id`, outline navigation, and unknown-skill not found.
- [DevOps roadmap](./roadmap.md) covers Roadmap navigation and the stepper landmark.
- [Theme toggle](./theme-toggle.md) covers dark/light canvas switching from the header control.
