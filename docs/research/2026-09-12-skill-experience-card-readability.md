# Skill experience card readability research

Date: 2026-09-12

## Question

How should the skill experience cards present multiple experience details so
they are easier to read while staying within Astryx's component, typography,
token, and accessibility guidance?

## Recommendation

Use a **hybrid summary plus labeled key-outcomes list** in both experience card
renderers:

1. Keep the existing one-sentence summary as primary Astryx body text.
2. Present each narrative paragraph or evidence fact as an unordered,
   disc-marked Astryx list item under a short label such as `Key outcomes`.
3. Render outcome text as primary body text. Keep secondary/supporting text for
   the `Relevant skills` label and other metadata, not for the main evidence.
4. Keep the title, summary, outcomes, and relevant-skill tokens within the
   existing card and spacing hierarchy; do not add nested cards, dividers,
   icons, or Markdown parsing.

This provides two complementary scan levels: the summary answers “what was
done?” immediately, while bullets expose the distinct proof points. The marker
and list semantics add structure without inventing a second visual surface.

The intended Astryx composition is:

```tsx
<Text as="p" type="body">
  {summary}
</Text>
<List
  density="compact"
  listStyle="disc"
  header={<Text type="label">Key outcomes</Text>}
>
  {outcomes.map((outcome) => (
    <ListItem
      key={outcome}
      label={<Text type="body">{outcome}</Text>}
    />
  ))}
</List>
```

Pass a `ReactNode` label rather than a plain string. Astryx `Item` automatically
applies single-line truncation to string labels, whereas a `ReactNode` controls
its own wrapping. The nested `Text` should use its default `span` output so it
remains valid inside the list item's span wrapper.

## Why this fits Astryx

Astryx's `Text` documentation says body text defaults to the primary text
color, supporting text defaults to secondary, and semantic types should be
preferred over manual size/weight overrides. Its source maps `primary` and
`secondary` to `--color-text-primary` and `--color-text-secondary` respectively
([Text docs](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/Text/Text.doc.mjs),
[Text source](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/Text/Text.tsx),
[Text styles](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/Text/text.stylex.ts)).
The earlier experience design likewise says “use supporting text only for
secondary metadata, not for the main story,” and recommends summary-first,
short narrative content
([experience narrative design](../superpowers/specs/2026-08-26-skill-experience-narrative-design.md)).

Astryx's `List` is specifically a vertical collection of related items. It
supports `density="compact"`, `listStyle="disc"`, and a header that is visibly
rendered and associated with the list through `aria-labelledby`. It outputs a
semantic `ul` for disc markers and explicitly restores `role="list"` because
Safari/VoiceOver can drop implicit list semantics when CSS removes native
markers. `ListItem` renders a semantic `li`, while its custom disc uses the
primary text token
([List docs](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/List/List.doc.mjs),
[List source](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/List/List.tsx),
[ListItem source](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/List/ListItem.tsx)).

The current renderers already distinguish a primary summary from multiple
secondary body paragraphs. In both cases, however, the details are core
evidence rather than metadata
([authored experience card](../../apps/github.io/src/app/skills/skill-experience-card-list.tsx),
[capability-derived experience card](../../apps/github.io/src/app/skills/skill-experience-list.tsx)).
Moving those details to primary body text follows Astryx's semantic typography
model and the original experience-design boundary.

## Option comparison

| Option | Readability | Semantics | Astryx fit | Assessment |
| --- | --- | --- | --- | --- |
| Existing secondary paragraphs | Weakest scan structure: repeated gray paragraphs have no visible cue that they are distinct proof points. | Paragraphs are honest prose, but their grouping is only visual spacing. | Uses `Text`, but treats main-story evidence like secondary metadata, contrary to the original experience design. | Do not keep. |
| Semantic bulleted list only | Strong item separation and good screen-reader list structure. | Correct when the facts/outcomes form an unordered collection; WHATWG defines `ul` for items whose order is not material. | Directly supported by Astryx `List`/`ListItem` with disc markers. | Better than today, but removing or demoting the summary loses the card's quickest orientation cue. |
| Summary + key-outcomes list | Strong hierarchy and scanning: concise orientation first, discrete evidence second. | Summary stays a paragraph; related, order-independent outcomes become list items with a visible/accessible label. | Uses Astryx `Text`, `List`, and `ListItem` according to their documented purposes and token defaults. | **Recommended.** |

The unordered-list semantics are appropriate only when reordering the outcomes
does not change their meaning. The HTML Standard defines `ul` exactly this way
([WHATWG HTML, grouping content](https://html.spec.whatwg.org/dev/grouping-content.html#the-ul-element)).
If an experience record later contains a genuinely chronological or causal
sequence, that content should remain paragraphs or use an ordered list rather
than being forced into unordered bullets.

## Contrast and accessibility implications

The current gray is not necessarily a WCAG failure. Under Astryx Neutral, card
surface is `#ffffff` in light mode and `#262626` in dark mode; secondary text is
`#525252` and `#9e9e9e`. Those pairs calculate to about 7.81:1 and 5.65:1,
respectively, both above WCAG 2.2 AA's 4.5:1 minimum for normal text. Primary
text increases the same theme's contrast to about 18.88:1 and 15.13:1
([Neutral theme](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/theme-neutral/src/neutralTheme.ts),
[Neutral palette](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/theme-neutral/src/neutralPaletteRefs.generated.ts),
[WCAG 2.2 SC 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum)).

Therefore the recommendation is not “repair a proven contrast violation.” It
is to stop using the lower-emphasis token for content users must read, while
adding semantic and visible grouping. WCAG's minimum is a conformance floor;
the user's reported difficulty is sufficient reason to adopt the stronger
hierarchy.

Keep outcomes untruncated and responsive. WCAG 2.2 requires content to tolerate
user text-spacing overrides without loss, and its AAA visual-presentation
guidance notes that narrower blocks and adequate spacing help some readers keep
their place
([WCAG 2.2 SC 1.4.12 understanding](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing),
[WCAG 2.2 SC 1.4.8 understanding](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)).
The cards should therefore be checked at narrow widths and with the prescribed
text-spacing overrides; do not introduce line clamps or fixed heights.

## Suggested implementation boundaries and validation

- Change only the detail-content block in
  `skill-experience-card-list.tsx` and `skill-experience-list.tsx`; preserve the
  existing card, heading, summary, deduplication, and relevant-skill behavior.
- Use the installed Astryx component APIs rather than custom `ul`/`li`, bullet
  glyphs, Markdown parsing, or new local typography rules.
- Keep outcome order from the source arrays and stable outcome keys as today.
- When there are no facts in the capability-derived card, omit the outcomes
  list and its header.
- Update focused component tests to assert the labeled semantic list, list
  items, complete untruncated text, primary body typography, and absence of the
  outcomes label when no facts exist.
- Add or update Storybook coverage for one long authored narrative and one
  multi-fact capability card, then visually check mobile and desktop widths in
  both color schemes.
- Measure computed foreground/background contrast in the rendered app theme as
  part of accessibility verification; the ratios above are calculations from
  the installed Neutral theme token values, not a browser measurement.

## Research commands and limitation

The following primary-source searches were used from the worktree root:

```sh
rg -n -- '--color-text-(primary|secondary)|--color-background-(surface|body)' \
  /home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/theme \
  /home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/theme-neutral/src
sed -n '1,260p' \
  /home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/List/List.tsx
sed -n '1,260p' \
  /home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/List/ListItem.tsx
sed -n '1,220p' \
  /home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/Text/Text.doc.mjs
```

The installed package source was inspected directly because this linked
worktree shares the repository installation at
`/home/benkim0414/workspace/benkim0414/node_modules`; package and lock files pin
Astryx Core and Neutral Theme to `0.5.4`. `pnpm exec astryx component ...` was
also attempted, but pnpm tried to perform a workspace install and could not
open its store database in the sandbox. This does not block the findings: the
installed component docs, implementations, tests, and theme sources are the
versioned primary sources the CLI reads.
