# Recruiter-Friendly DORA Evidence Row Labels Design

**Date:** 2026-08-09

## Goal

Make the two visible DORA capability-card evidence rows immediately familiar
to recruiters and hiring managers while keeping the labels capability-neutral
and reusable across every DORA card.

## Research Basis

LinkedIn profiles use `Experience` and `Skills` as standard professional
sections. Resume guidance similarly treats work experience and skills as core
sections and commonly distinguishes technical skills when a role requires
specific tools or platforms. The card should retain this familiar vocabulary
while explaining why these particular tokens are shown.

Sources:

- LinkedIn Help, "Your LinkedIn profile":
  <https://www.linkedin.com/help/linkedin/answer/a564064/your-linkedin-profile?lang=en>
- Indeed, "How to Organize Sections of a Resume":
  <https://www.indeed.com/career-advice/resumes-cover-letters/sections-of-a-resume>

## Approved Labels

| Evidence group | Current label | New label           |
| -------------- | ------------- | ------------------- |
| `applied`      | Experience    | Relevant experience |
| `skills`       | Skills        | Technical skills    |

`Relevant experience` tells a reader that the selected accomplishment tokens
are the experiences most applicable to the capability, rather than a complete
employment history. `Technical skills` tells a reader that the second row is a
focused list of tools, platforms, and technical competencies supported by those
experiences.

## Reuse And Semantics

- Define the labels once in the existing shared DORA card row-label mapping.
- Apply the same labels to every capability card that renders `applied` or
  `skills` evidence.
- Preserve the existing `aria-labelledby` relationship so each list's
  accessible name exactly matches its visible recruiting label.
- Do not add capability-specific prefixes such as `Delivery`, `Integration`,
  or a capability name.
- Keep internal evidence-group keys and screen-reader fallback descriptions
  unchanged; only the two visible row labels and their derived accessible names
  change.

## Presentation

Use the existing `<Text type="supporting" color="secondary">` presentation,
VStack spacing, row gap, wrapping, and card dimensions. The longer labels must
not introduce clipping, horizontal overflow, or incoherent separation from
their token rows at phone or iPad widths.

## Validation

- Update shared component assertions from `Experience` to
  `Relevant experience` and from `Skills` to `Technical skills`.
- Assert the corresponding lists have the accessible names
  `Relevant experience` and `Technical skills`.
- Cover at least Continuous Integration and Continuous Delivery to prove the
  shared mapping is capability-neutral.
- Preserve every evidence token, order, count, score, and label value.
- Run focused card and Storybook tests, complete `github.io` tests, lint, app
  build, and Storybook build.
- Reinspect the Continuous Delivery story on iPad for label wrapping,
  hierarchy, clipping, and horizontal overflow.

## Out Of Scope

- Changing evidence-token labels, titles, data, ordering, scoring, or counts.
- Renaming internal `applied` or `skills` group keys.
- Changing evidence-row markup, component APIs, token variants, logos,
  typography, spacing, or card dimensions.
- Adding explanatory descriptions, tooltips, or capability-specific copy.
- Renaming certification, education, project, or learning groups that are not
  currently visible on the compact DORA card.
