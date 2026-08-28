---
title: Skill Detail Experience Section Labeling
date: 2026-08-28
category: design-patterns
module: apps/github.io skills
problem_type: design_pattern
component: frontend
severity: medium
applies_when:
  - Naming skill detail sections that show experience and supporting evidence
  - Combining canonical Experience records with capability-derived evidence cards
  - Avoiding duplicate headings for similar portfolio proof content
related_components:
  - Skill detail page
  - Skill experience cards
  - DevOps capability evidence
tags: [github-io, skills-page, skill-detail, experience, content-design]
---

# Skill Detail Experience Section Labeling

## Finding

Use one section for skill-specific proof content instead of splitting
canonical `Experience` records and capability-derived experience evidence into
separate `Experience` and `In practice` sections.

Recommended heading: **Experience**

Recommended card grouping order:

1. Canonical narrative experience cards.
2. Capability-derived experience evidence cards.

This keeps the public page closer to what readers are trying to assess:
whether the skill is backed by real work. The internal distinction between
canonical experience records and DORA capability evidence should remain in the
data model and resolver, not become a reader-facing taxonomy.

## Rationale

Nielsen Norman Group's web-reading research says users scan pages and rely on
meaningful subheadings, concise sections, and objective language. A pair of
near-synonymous headings makes scanning harder because readers must infer why
`Experience` differs from `In practice`.

Material Design 3 defines cards as content about one subject and lists as
vertical groups of text or other elements. Both current data sources describe
work evidence for the same subject: the current skill. Card styling should
distinguish individual proof items; section headings do not need to distinguish
their storage source.

Apple's writing guidance favors simple, plain language. `Experience` is the
plainest heading for portfolio proof. It is also broad enough to contain both
rich narrative accomplishments and shorter evidence cards without suggesting
two different content classes to the reader.

## Alternatives

- **Experience**: Best default. Plain, expected on a portfolio, broad enough
  for both narrative and evidence cards.
- **Applied experience**: Stronger signal that the content is practical, but
  slightly less natural as a portfolio section heading.
- **Selected experience**: Useful if the section intentionally shows only a
  curated subset, but it sounds editorial rather than skill-focused.
- **Evidence**: Accurate for DORA data, but colder and less human on a skill
  detail page.
- **Proof in practice**: Clearer than `In practice`, but more verbose and
  promotional.

Avoid `In practice` as a separate peer section when `Experience` is already on
the page. It reads as a subtle synonym rather than a distinct user need.

## Sources

- Material Design 3, Cards: https://m3.material.io/components/cards
- Material Design 3, Lists: https://m3.material.io/components/lists/guidelines
- Apple Human Interface Guidelines, Writing:
  https://developer.apple.com/design/human-interface-guidelines/writing
- Nielsen Norman Group, How Users Read on the Web:
  https://www.nngroup.com/articles/how-users-read-on-the-web/
- Nielsen Norman Group, Cards UI-Component Definition:
  https://www.nngroup.com/articles/cards-component/
