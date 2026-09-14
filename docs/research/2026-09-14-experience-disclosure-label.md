# Experience disclosure label research

Date: 2026-09-14

## Recommendation

Use **`Highlights`** for the collapsible trigger, with the number of bullet
items in the existing count badge: `Highlights [3]`.

`Highlights` is the most accurate short umbrella for the content the card
actually reveals. The authored cards contain selected narrative points that
mix work performed, implementation approach, operational context, and effects;
the capability-derived cards pass factual evidence through the same list. Not
every point is a discrete end result, and not every point claims a notable
success. `Highlights` describes a curated subset without overstating what each
item proves
([authored experience data](../../apps/github.io/src/app/experience/experience.data.ts),
[authored card](../../apps/github.io/src/app/skills/skill-experience-card-list.tsx),
[capability-derived card](../../apps/github.io/src/app/skills/skill-experience-list.tsx)).

When highlights and skills coexist, keep `Relevant skills [N]` as the label for
the skill tokens inside the open panel. A skills-only card is the exception: its
label and count remain in the disclosure trigger in both states, keeping the
chevron attached to the section it controls without duplicating the label above
the tokens. In either layout, each badge counts the items immediately associated
with its label.

## Why the trigger needs a content label

Astryx 0.5.4 defines the trigger as the always-visible label and chevron for
the content area. It recommends `Collapsible` for scannable detail views and
starting likely-needed content open. The API imposes no prescribed wording, so
the label should describe this card's hidden content rather than the component
mechanism
([Astryx Collapsible docs](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/Collapsible/Collapsible.doc.mjs),
[Astryx Collapsible source](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/Collapsible/Collapsible.tsx)).

This agrees with first-party disclosure guidance:

- GOV.UK says accordion button text should use sentence case, stay short, and
  describe the content that will appear. Its UI-writing guidance similarly
  says headings should describe the purpose of the following text
  ([GOV.UK accordion](https://design-system.service.gov.uk/components/accordion/),
  [GOV.UK UI writing](https://www.gov.uk/service-manual/design/writing-for-user-interfaces)).
- IBM Carbon says an accordion title gives a high-level overview that helps
  users decide which sections to read, and should be as brief as possible while
  remaining clear and descriptive
  ([Carbon accordion](https://carbondesignsystem.com/components/accordion/usage/)).
- USWDS's documentation guidance says section headings should be succinct,
  descriptive, and precise
  ([USWDS documentation template](https://designsystem.digital.gov/templates/docs/)).

`Highlights` meets that guidance better than the generic `Details`, while
avoiding claims that the underlying data does not consistently support.

## Option comparison

| Label | Semantic accuracy | Scanability | Disclosure clarity | Assessment |
| --- | --- | --- | --- | --- |
| `Highlights` | Broad enough for selected actions, approaches, facts, and effects. It does not require every bullet to be a measured result. | Short, familiar, and distinct from the title and summary. | Predicts a curated set of notable points. The adjacent count naturally counts the bullets. | **Recommended.** |
| `Outcomes` | Means the results or consequences of the work. Several bullets instead describe what was built, how work proceeded, or what evidence was used. | Short and concrete. | Clearly promises results, but that promise is too narrow for the current content. | Use only after rewriting every bullet as an observable result. |
| `Achievements` | Implies successful accomplishments attributable to the person. This fits some authored points but overstates neutral capability facts and method descriptions. | Strong portfolio language, but more promotional. | Clearly promises accomplishments, which the mixed source data does not always provide. | Too strong for a shared renderer. |
| `Details` | Technically covers anything in the panel, including skills. | Very familiar but generic; repeated cards provide little information scent. | Describes “more content,” not what kind of content users will reveal. | Safe fallback, but less useful than `Highlights`. |

## Content evidence

All seven authored experiences currently have three narrative items. Across
those 21 items, the grammatical and informational shape is deliberately mixed:

- actions: “Built,” “Migrated,” “Operated,” “Investigated,” and “Implemented”;
- methods or boundaries: carrying the same artifact through promotion,
  working from metrics and logs, or using pre-sync jobs;
- effects: shrinking operational surface, removing direct workload access,
  and reducing credential blast radius.

Calling all of these `Outcomes` would make method statements sound like
results. `Achievements` would be even narrower. `Highlights` truthfully says
that these are the selected points worth opening, regardless of whether an
item is an action, method, fact, or result.

The capability-derived renderer reinforces this choice. Its source property
is explicitly named `facts`, and examples include neutral verification such as
“Every verified console-capable identity uses MFA” and “Alert and recording
rules are managed declaratively.” A shared `Achievements` label would recast
those evidence facts as personal accomplishments
([capability evidence type](../../apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts),
[security evidence](../../apps/github.io/src/app/devops-capability-evidence/pervasive-security-evidence.data.ts),
[observability evidence](../../apps/github.io/src/app/devops-capability-evidence/monitoring-observability-evidence.data.ts)).

Career guidance also distinguishes actions from results rather than treating
all experience bullets as outcomes. The University of Pennsylvania recommends
describing experiences as actions plus accomplishments and, where possible,
connecting work to broader results. That distinction supports reserving
`Outcomes` or `Achievements` for content rewritten to make those claims
consistently
([Penn Career Services](https://careerservices.upenn.edu/channels/resume/)).

## Implementation implication

This is a copy and count-placement decision, not a content-model rename:

- render `Highlights` plus an outcome/fact count badge in the disclosure
  trigger;
- when highlights and skills coexist, render `Relevant skills` plus its own
  skill count badge inside the panel;
- when skills are the only detail, retain `Relevant skills` and its count in the
  trigger in both states and omit a duplicate panel heading;
- keep existing internal names such as `narrative`, `facts`, `outcomes`, and
  `outcomeCount` unless a later domain-model change is separately justified;
- retain complete list text and existing semantic list structure.

The UI label should remain a content term. Avoid `Show more`, `Expand`, or
`More`, because those describe interaction without identifying what the
button reveals.

## Primary sources inspected

- Repository experience records, capability evidence records, and both card
  renderers on `feat/experience-card-disclosure`.
- Installed Astryx Core 0.5.4 Collapsible documentation and implementation.
- Official GOV.UK Design System and Service Manual guidance, IBM Carbon Design
  System guidance, USWDS documentation guidance, and University of
  Pennsylvania Career Services guidance.
