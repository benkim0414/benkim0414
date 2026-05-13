## 1. Test First

- [ ] 1.1 Add failing tests for tag filter parsing, serialization, toggling, and result filtering.
- [ ] 1.2 Add a failing component test that skill cards render through shadcn Card and Badge primitives.
- [ ] 1.3 Add failing UI coverage that clicking a category badge toggles the category filter and URL state.
- [ ] 1.4 Add failing UI coverage that clicking a tag badge toggles the tag filter and URL state.

## 2. Add shadcn Primitives

- [ ] 2.1 Add app-local shadcn Card primitives under `apps/github.io/src/components/ui` if they do not already exist.
- [ ] 2.2 Add app-local shadcn Badge primitives under `apps/github.io/src/components/ui` if they do not already exist.
- [ ] 2.3 Preserve existing `components.json` aliases, Tailwind CSS-variable theming, and lucide configuration.

## 3. Extract SkillCard

- [ ] 3.1 Create a `SkillCard` component owned by the search feature.
- [ ] 3.2 Render skill title, summary, level, evidence, categories, and tags through `SkillCard`.
- [ ] 3.3 Use shadcn Card for the result container and shadcn Badge for categories and tags.
- [ ] 3.4 Expose accessible badge controls for category and tag clicks without moving URL logic into `SkillCard`.

## 4. Add Clickable Filters

- [ ] 4.1 Extend search state with selected tags.
- [ ] 4.2 Parse and serialize repeated `tag` URL parameters.
- [ ] 4.3 Filter results by selected tags using OR semantics within tags and AND semantics across filter groups.
- [ ] 4.4 Wire `SkillCard` category and tag badge clicks into the existing search state update flow.
- [ ] 4.5 Preserve existing query, category, level, empty-state, and theme behavior.

## 5. Verify

- [ ] 5.1 Run `git diff --check`.
- [ ] 5.2 Run `pnpm nx test github.io`.
- [ ] 5.3 Run `pnpm nx build github.io`.
- [ ] 5.4 Run `pnpm nx e2e github.io-e2e`.
- [ ] 5.5 Run `pnpm openspec validate add-github-io-skill-card-filters`.
