# OpenWiki authoring instructions

Build a small, source-grounded guide to this repository. Treat source and tests as
the primary evidence, with [`CONCEPTS.md`](../CONCEPTS.md), canonical docs, and
workspace configuration as supporting evidence. Keep Claims traceable to the
current checkout.

## Initial page set

Create an index, a maintenance log, and about six focused pages:

1. Workspace setup and the pnpm/Nx project graph.
2. The `github.io` application architecture and its major boundaries.
3. Domain concepts and evidence flows, using `CONCEPTS.md` terminology.
4. The design system, component contracts, and styling boundaries.
5. Validation workflows, including focused tests and linked-worktree checks.
6. Release and handoff workflows, citing their canonical repository guidance.

Link related pages and prefer explanations of responsibilities, dependencies,
and evidence flow over file-by-file catalogs. Describe the checkout being
inspected, not historical or remote feature-branch state. Cite canonical policy
instead of copying agent instructions into the wiki.

Include only authored source, relevant tests, workspace configuration, and
canonical documentation needed to support those subjects. Exclude generated
outputs, dependency trees, caches, credentials, local runtime state, and unrelated
assets. Expand the initial page set only when a distinct concept cannot be
explained clearly within these boundaries.
