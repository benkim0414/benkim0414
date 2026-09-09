# Repository-wide historical commit scope audit and preliminary decisions

Status: all reachable commits have a scope disposition; acceptance of the 99
scope corrections is pending. No release policy, Git object, or ref has changed.

The user clarified that this is a single-developer repository and the desired
repair covers **all incorrect historical scopes**, not only scopes that affect
github.io releases. The selected design is a verified message-only rewrite.
The release comparison below is one consequence of that work, not its boundary.
Recording scope decisions does not authorize a rehearsal, rewrite, ref update,
force-push, or publication.

## Scope and evidence

The original audit began on 2026-09-09 at main
`fba4865083a81ea3d4fd2124ba0d25ed1ddfeb75`. The final read-only refresh was
inspected at `2026-09-09T13:54:20Z` (`2026-09-10` in Australia/Melbourne).
`git ls-remote --symref --heads --tags origin` showed seven remote heads, all
already matching their local remote-tracking refs, and no tags. GitHub release
listing remained empty. The repository is not shallow.

The generated preliminary inventory covers **1,645 unique commits** reachable
from all 24 local refs or the 12 linked-worktree HEADs, including stash history
and detached worktree history. The four saved audit partitions cover the prior
1,638 commits exactly; seven new commits implementing the guarded workflow were
reviewed individually. Unreachable and reflog-only objects and unfetched GitHub
PR refs remain outside this explicit reachability boundary.

| Final scope disposition | Commits |
| --- | ---: |
| Keep existing scope/message | 1,546 |
| Change scope only | 99 |
| Manual review | 0 |
| Total | 1,645 |

The existing release classifier marks 765 effective messages as releasing and
880 as nonreleasing after these dispositions. That classification applies the
existing `github.io` scope and Conventional Commit rules; it is not inferred by
comparing numerical versions.

The machine-readable artifacts are
`.history-repair/preliminary/inventory.json` (SHA-256
`ee305dad27302f23aa78549a69f05f55856eba8980c165bd393f14aa1985f9a4`) and
`.history-repair/preliminary/ledger.json` (SHA-256
`48801bbf40b57a2193b17f9e4847569a2fe3754898bd2f47d0b7c7b29a86295e`).
The ledger checker reports `ledger valid: 1645 decisions`. These artifacts and
the exact 99 proposals await user acceptance and are not execution authority.
The canonical human-readable 99-row table, disjoint domain totals, and
overlapping per-ref coverage are in the
[preliminary review](../../.history-repair/preliminary/review.md#exact-pending-scope-corrections).
The shorter [proposed-corrections review aid](../../.superpowers/sdd/2026-09-09-historical-commit-scope-repair/proposed-corrections.md)
is not the canonical detailed set.

The screening narrative and candidate tables below are retained as audit
rationale. The complete preliminary ledger supersedes their earlier candidate
or manual-review wording for final scope disposition. Separate type or
description concerns remain deferred and unapproved.

## Repository-wide scope review

The original non-merge screening used 23 named scopes plus unscoped and
nonconventional messages. Counts below describe that saved historical screening,
including parallel branches and distinct copies of commits; they are not the
current 1,645-row inventory totals or counts of unique logical changes.

| Existing scope | Count | Review disposition |
| --- | ---: | --- |
| github.io | 1,449 | Inspect app, docs, tooling, and deployment ownership; not an automatic pass |
| skills | 38 | Application subdomain; includes documentation as well as code |
| experience | 5 | Application subdomain; includes specifications and plans |
| home | 1 | Application subdomain |
| navigation | 1 | Application subdomain |
| roadmap | 3 | Application subdomain; includes an off-main implementation |
| version-control | 4 | App capability documentation, not repository Git tooling |
| concepts | 1 | Document-based scope for app domain definitions; replace with product scope |
| README | 1 | File-based scope for GitHub profile content; replace with profile |
| openspec | 5 | Four app-spec commits need product scope; one tooling setup commit fits openspec |
| release | 3 | Monorepo release research; retain if release tooling is the affected domain |
| astryx | 2 | Mixed app integration/tooling; inspect individual changes |
| openwiki | 9 | Actual wiki integration, maintenance, and generated evidence; scope fits |
| profile | 3 | GitHub profile README content; scope fits |
| nx | 8 | Workspace migration/configuration; scope fits |
| workflow | 2 | Repository-wide atomic review/commit guidance; scope fits |
| codex | 1 | Repository MCP configuration; scope fits |
| deps | 8 | Dependency maintenance; scope fits |
| deps-dev | 2 | Development dependency maintenance; scope fits |
| gh-pages | 2 | Historical Astro app; preserve its distinct identity |
| github-pages | 2 | Historical React app; preserve its distinct identity |
| commitizen | 1 | Commit authoring integration; scope fits |
| commitlint | 3 | Commit validation and its hook integration; scope fits |

Scope correctness means identifying the affected component, product, or domain,
as required by the repository's commit instructions. It does not mean replacing
every scope with an app name. A missing scope is not automatically wrong for a
repository-wide change. Documentation uses the domain it describes, rather than
the file name or planning tool that holds it.

Additional concrete corrections and review cases beyond release eligibility:

| Commit(s) | Current scope | Proposed disposition | Evidence |
| --- | --- | --- | --- |
| de1350a343 | README | profile | Diff changes personal introduction and contact links in README.md |
| 821734ebff | concepts | github.io | Diff defines rendered Skill Detail Records and Experience Narratives in CONCEPTS.md |
| 2226f69b9a | openspec | github.io | Documents application skill-card filtering |
| 64f9bc7b14 | openspec | github.io | Documents application design theme |
| 9c3f3f980f | openspec | github.io | Documents application shadcn usage |
| fbbf915d8d | openspec | github.io | Documents application shell, data, search, design, and deployment |
| d9ef15278d | openspec | Keep openspec | Installs OpenSpec skills, configuration, and workflow documentation |
| 31369db29d, 8297a94ce2, 8c8e56487a, 4e86236655 | version-control | github.io | Corrects icon references in the app's DORA capability design and plan |
| 25859bcd83, bf1ba75b54, eb84dbcff7, 63109b50f4 | absent | nx | Plans/specifies Nx workspace tooling migration |
| 6b0695f09e, 6870b6c5fa, d847f23c32, 7663db0e80, c78fe2f2fb, f8ee2e90ab | absent | github.io | App scaffold plans/specs and their formatting correction |
| 9b0a46d29d | absent | github.io | Defines the application design system in DESIGN.md |
| e8485997d1 | absent | date-interval | feat: temp delivers the date-interval package; only the scope is selected for correction |

The remaining docs(skills), docs(experience), and docs(roadmap) entries belong in
the correction ledger even though they do not change a version. Broad release
research under docs(release) must be distinguished from app-specific release
implementation. Likewise, app-specific Storybook worktree guidance and app agent
guidelines can legitimately retain github.io; their subjects mention tooling but
their documented scope is the app. Keyword matching alone would misclassify them.

Retain unscoped repository-wide cleanup and general agent instructions where no
component dominates. Treat `feat: temp`'s vague description as a separate proposed
description correction, not a reason to invent a scope. Treat legacy root,
revert, generated deployment, and stash metadata explicitly rather than forcing
them through application scope rules. Review merge subjects for scoped mistakes
too, while preserving ordinary merge syntax and topology.

## Release-contract root cause

`scripts/github-io-release-core.mjs:18` requires the exact `github.io` scope.
It chooses major for breaking markers, minor for feat, patch for fix, and no
release for nonbreaking other types or other/missing scopes.

`commitlint.config.mjs:1` only extends the conventional preset. The local
`.husky/commit-msg` hook runs commitlint, but the configuration has no
repository-specific scope vocabulary or changed-file ownership check. A header
can satisfy Conventional Commit syntax while failing this repository's release
contract. The scopes skills, home, experience, navigation, and roadmap name
valid app subdomains, but the release coordinator does not recognize them.

`scripts/github-io-release.mjs:152` classifies commits introduced by a true merge,
excluding that integration's own header. A squash/direct commit is classified
itself. Therefore renaming only merge commits or PR titles cannot repair all
historical omissions. The `feat(home)` merge at `d18f76ba9e` illustrates this:
its introduced commit `8ac6fcdbd8` is the relevant correction.

## Clear app-scope candidates on main

For each entry below, the scope-only proposal is to replace the parenthesized
scope with `github.io`, retaining the type and description in the proposed
replacement subject. This is a proposed mapping, not authorization to reword Git
objects. A final semantic pass must also examine type accuracy where marked.

| Commit | Current subject |
| --- | --- |
| 8ac6fcdbd8 | feat(home): add DevOps engineering practice heading |
| 05648da40a | refactor(skills): share count badge |
| 0847bc3962 | feat(skills): add experience count badge |
| 204313276d | test(skills): update resolver enrichment expectations for professional experiences |
| 096b76064a | feat(skills): surface professional experiences on skill detail pages |
| e7fe0c96c8 | feat(experience): add six professional experience entries |
| ccbb8d86da | feat(skills): add Sentry to skill catalog |
| e73dd00bc9 | feat(experience): distinguish professional and personal entries with kind field |
| efe451ad77 | feat(navigation): add mobile skill search |
| 9ee1c2f043 | feat(skills): add catalog search and filters |
| deed0dcd09 | fix(skills): link supporting experience tokens |
| 1cbd3e60db | feat(skills): link experience skill tokens |
| a7231e82f8 | test(skills): cover primary use metadata fixtures |
| a51bff4475 | feat(skills): add primary use metadata |
| 1a34da2425 | feat(skills): show capability experience cards |
| cb557965e1 | test(skills): assert experience relevant skills |
| 3725203238 | fix(skills): diversify experience list story |
| c4cff1acd2 | feat(skills): replace rating with confidence |
| a97dda04e2 | fix(skills): align experience card spacing |
| d275c7c415 | fix(skills): label experience skills |
| a9cfb51d35 | fix(skills): simplify experience card story |
| e0d66aa973 | fix(skills): add experience card story |
| df4f50d8c7 | fix(skills): address experience review findings |
| 948dde9a2d | feat(skills): show experience narratives |
| 92b9835129 | feat(skills): add experience narrative cards |
| 640f229fb4 | fix(skills): provide experience resolver sources |
| 15a27a0d08 | feat(skills): resolve experience narratives |
| ea1054649b | feat(experience): add narrative catalog |
| 39d8ad2583 | fix(roadmap): make nodes full width |
| 8b14a14f86 | fix(skills): reject duplicate detail records |
| 8175e62407 | fix(skills): add Conventional Commits icon |
| 87b1e1fb6e | fix(skills): add Conventional Commits icon |

There are **32** entries: 16 feat, 12 fix, 3 test, and 1 refactor. Scope-only
correction makes 28 messages newly eligible and leaves four nonbreaking
test/refactor messages ineligible. `3725203238` changes only stories and their
tests; `640f229fb4` changes only a test and a story. Review whether their type
should be test rather than fix before accepting historical release corrections.
Other story-related fixes also touch components and cannot be retyped from the
subject alone. Repeated icon subjects are distinct Git objects; compare their
integration and patch history before assuming that duplicate subjects imply
duplicate releases.

## Off-main app-scope candidates

| Commit | Current subject |
| --- | --- |
| 68a1beb9ba | fix(astryx): restore 0.5.4 compatibility |
| 57c41ee3f9 | chore(astryx): upgrade design system to 0.5.4 |
| d1aea85a39 | fix(skills): add Conventional Commits icon |
| 6473d96391 | fix(skills): add Conventional Commits icon |
| 3fd98c6dc8 | fix(roadmap): address review findings |

These five are not part of main's bootstrap replay. Focused review retains
`57c41ee3f9175db6ac87a58db620f2ae99ee35ff` as `astryx`: its shared
package migration, refresh tooling, and consuming application adaptation form a
coherent Astryx-owned change. Retain old branch and stash objects. If an active
branch will be integrated, review the exact messages that its selected merge
method will introduce.

## Potential false eligibility and cosmetic consistency

Eleven main commits concern Astryx agent-document tooling rather than the
application's shipped behavior. Proposed scope: astryx, subject to a focused
diff review of ownership and the chosen release policy.

| Commit | Current subject |
| --- | --- |
| 511219c79e | fix(github.io): model Markdown leaf boundaries |
| decd596021 | fix(github.io): respect paragraph HTML boundaries |
| 7f15472c35 | fix(github.io): detect type 7 HTML marker containers |
| 3a005afcd0 | fix(github.io): detect CommonMark marker containers |
| c5d4799971 | fix(github.io): harden Astryx agent doc refresh |
| 0fea532155 | fix(github.io): detect tab-stop Astryx indentation |
| 842c08a799 | fix(github.io): fail closed on malformed Astryx docs |
| dd50c54516 | fix(github.io): repair malformed Astryx docs |
| fb1b11c56e | fix(github.io): harden Astryx doc refresh |
| 3bbf9c6d17 | fix(github.io): forward Astryx refresh args |
| e08938586a | feat(github.io): verify Astryx agent context |

Their main changed files are scripts/check-astryx-agent-docs.mjs,
scripts/refresh-astryx-agent-docs.mjs, associated tests and planning reports, and
package scripts. Release/deployment fixes outside apps/github.io are a separate
case and should not be grouped with these tooling changes.

Documentation also uses skills, experience, concepts, roadmap, version-control,
release, and openspec scopes. Some describe application work, some describe
workspace-wide tooling. Review their domain ownership for consistency; do not
change docs to feat/fix to force a release. Keep correctly scoped Nx, dependency,
commitlint, profile, and OpenWiki changes. The github-pages and gh-pages scopes
belong to distinct historical app branches and are not github.io aliases.

The three nonconventional non-merge subjects are Initial commit, a documentation
revert, and stash index metadata. They are not app scope defects. Ordinary merge
subjects are also not automatic defects under the current replay algorithm.

## Measured release impact

The existing bootstrap function at the pinned main SHA produces **0.142.3**, with
537 contributing commits. An independent replay of its first-parent integration
rules reproduced that result. A comparison replay changing only the scopes of
the 32 main candidates produces **0.152.3**, with 28 additional contributing
commits. It changes the selected bump at 13 integrations: ten become minor and
three become patch. Other newly eligible commits share an integration whose
highest bump is already sufficient.

Affected integration SHAs: 8175e62407, 8b14a14f86, 39d8ad2583, c4cff1acd2,
d24f96a648, 1a34da2425, a51bff4475, bee0449005, 9ee1c2f043, efe451ad77,
ad61a836a8, 0847bc3962, d18f76ba9e.

**0.152.3 is a scope-only comparison, not a final or approved bootstrap version.**
It does not resolve the tooling candidates, type corrections, or semantic
duplicate/revert questions. Chronological minor bumps reset patches, so missing
commit counts cannot simply be added to the final version.

## Approaches

1. **Proposed direction after user clarification: rewrite historical messages.**
   Correct all approved scope mistakes across products, packages, infrastructure,
   documentation, and tooling. Produce a full-SHA correction ledger and perform
   the rewrite in an isolated copy. Preserve file trees and mapped parent order.
   The single-developer context makes coordination manageable. Existing linked
   worktrees, branches, PR references, and signatures still need explicit handling.
   Prepare backups, a complete old-to-new SHA map, and per-ref publication details
   before explicit approval of the rewrite and eventual force-push operations.
2. **Permanent aliases or path-based release ownership.** Accept subdomain
   scopes indefinitely or infer ownership from paths. This can be appropriate
   for a redesigned monorepo release policy, but skills/home aliases may collide
   with future projects and root-level tooling needs explicit ownership. It
   changes the existing exact-scope contract and requires broader design work.
3. **Alternative: preserve history and correct release interpretation.** A bounded
   SHA-specific adapter can repair release calculation without changing Git
   objects. It would leave incorrect historical subjects visible and would not
   meet the clarified objective of repairing all historical scope mistakes.

## Proposed repair sequence

### 1. Establish the repository-wide scope contract

Use github.io for the releasable application and its dedicated release/deploy
behavior. Put subdomains such as home and skills in descriptions or bodies.
Define separate product/package and workspace/tool scopes using the inventory
above. Preserve gh-pages, github-pages, and date-interval as distinct historical
domains. Explain shared dependencies and multi-project commits. Apply domain
ownership consistently to documentation, including changes without release impact.

Acceptance: examples cover app code, app docs, tests/stories, shared tooling,
root-level deployment scripts, dependencies, missing scopes, and breaking changes.

### 2. Finalize the historical correction ledger

Inventory every in-scope ref and commit, including off-main development and
historical app branches. Resolve full SHAs, inspect candidate diffs and document
content, associate integration points, and record change/keep/manual-review
decisions. Each ledger row includes original subject, proposed subject, affected
domain, evidence, containing refs, confidence, and release effect separately.
Existing github.io messages receive the same ownership checks as other scopes.
Include documentation-only mistakes, false eligibility, unscoped messages,
merge subjects, type-only candidates, and duplicate patch/revert handling.
Preserve bodies and breaking markers. Review type/description changes separately
from scope corrections. Reject duplicate entries, unknown SHAs, or mismatched
original subjects. Do not coalesce commits just because their subjects match.

Acceptance: every in-scope commit has a recorded disposition, every changed scope
has domain evidence, and no unresolved candidate is silently treated as correct.
The ledger never aliases every occurrence of a scope indiscriminately.

### 3. Prepare a reversible rewrite and verify it in isolation

Record exact branch/tag tips and worktree states; protect uncommitted user work
and stash entries. Create and verify a recoverable backup of all selected refs.
Explicitly enumerate the refs to rewrite; do not use an unreviewed blanket mirror
push. Include active and historical branches where their messages need correction.
Keep stash containers as recovery metadata, not ordinary rewrite targets.

After approval of the concrete rewrite design and target list, apply only the
approved message transformations in a separate copy. Preserve each commit's
tree, author/committer identity and timestamps, and parent order through the
old-to-new mapping. Changing signed commits invalidates their signatures; document
signature removal or re-signing policy rather than claiming signatures survive.
Verify changed and unchanged messages against the ledger and compare every mapped
tree and parent list. Do not update active worktrees during this rehearsal.

Use the ordinary release classifier on rewritten history, without a permanent
historical alias adapter. Update the bootstrap introduction reference: the
hardcoded `8acdd81` SHA can change when an earlier commit is reworded, even though
the scaffold commit's own message is unchanged. Review all operational SHA
references and prepared release artifacts. Original SHAs in historical documents
may be retained as provenance alongside the migration map; do not recursively
rewrite documentation merely to replace every old SHA.

Acceptance: all mapped file trees and parent orders match, only approved messages
change, all selected refs map correctly, and backup restoration has been verified.
Release replay uses the mapped introduction boundary, with unchanged bump rules
and an explanation of each changed result. No refs are published by rehearsal.

### 4. Prevent new mismatches

Add a documented scope vocabulary to commitlint and a CI validation path that
checks the messages actually integrated by the configured merge method. Validate
PR titles when used for squash, and introduced commits for merge commits. Do not
retroactively fail all historic commits; enforce from an explicit adoption point.
Add repository-wide ownership checks for changed paths, including each project,
tooling, docs, and shared/root files. An allowlist alone cannot detect a valid
but incorrect scope. Document-domain checks must use content/review evidence
where file location alone cannot identify the affected component.
Keep local hook and CI semantics aligned. Update agent guidance and commit prompts
to match the contract, preserving the user's general domain-based scope rule.

Acceptance: app-only feat(skills) and feat(home) fail with actionable replacement
headers; feat(github.io) passes; legitimate Nx/profile/tooling commits pass;
test/docs/refactor commits remain nonreleasing unless explicitly breaking.

### 5. Validate and review

Add focused fixtures for every accepted correction category, unknown/mismatched
ledger entries, unchanged trees and merge topology, empty ranges, merge/squash
differences, breaking footers, duplicate/reverted changes, and mapped bootstrap
boundaries. Verify that prepared releases cannot silently reuse rewritten identity.
Run the full
`pnpm test:release:github.io` suite and commitlint/CI fixtures. Perform the required
Codex review before finalizing nontrivial implementation. Evaluate OpenWiki after
verified implementation, as required by docs/agents/openwiki.md.

Acceptance: an immutable target replay shows original/effective contributors,
one highest bump per integration, ordered version transitions, and a final version
whose differences are explained by approved decisions. No app rebuild is needed
for this audit; bootstrap's own verification remains mandatory before publication.

### 6. Publish approved rewritten refs, reconcile worktrees, and bootstrap

Refresh remote refs, tags, releases, and prepared artifact state. Present the exact
old/new ref tips, correction ledger, backup location, migration map, operational
SHA-reference updates, and rewritten version calculation. Obtain direct approval
before history rewriting or force publication, as required by the user's Git
approval contract. Publish only named approved refs with explicit expected-old-SHA
leases, aborting if the remote has moved; do not delete unrelated refs. Reconcile
linked worktrees individually after preserving their uncommitted work. Explain
the effect on existing PRs and commit links. Keep the backup until accepted.

Recompute at the actual implementation target; this report's SHA/version pair
cannot authorize a different target. Bootstrap remains a separate explicit
handoff action through the existing workflow. Verify tag, release record,
artifact metadata, and deployed footer agree.

Acceptance: one reviewed release decision, recoverable retries, and matching
published/deployed identities. No rewrite, force push, merge-to-main, branch
deletion, PR publication, or deployment is part of this audit.

## Validation performed and current handoff state

Read-only Git/GitHub refresh, exact inventory coverage, and the complete
decision-ledger check passed. Independent raw-object verification matched every
inventoried message, tree, ordered parent list, and containing-ref set.
Independent ledger verification reconstructed the 99 scope-only message spans,
confirmed that type, description, body, and all other bytes are retained, and
reproduced the 765 releasing / 880 nonreleasing classification.

Read-only ancestry analysis predicts 1,636 changed identities because descendants
of changed messages must be remapped. All 17 inventoried signed commits are
affected. The default fail-closed signature policy therefore makes a real
rehearsal impossible until signature handling is separately and explicitly
approved. The 17 exact source OIDs and header hashes are recorded in the
protected signature-disposition artifact; that policy proposal is also pending
and this audit does not remove signatures.

Full application and release checks are not part of this scope-decision record.
The source trees, historical commits, and refs remain unchanged. OpenWiki:
**unchanged**; this audit does not alter implemented behavior.

The exact 99 scope proposals are ready for user review but remain unaccepted.
Even acceptance of those choices would not itself approve a backup, rehearsal,
rewrite, ref update, force-push, or publication. No such operation has been
performed.
