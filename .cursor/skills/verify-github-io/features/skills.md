# Skills catalogue

Skills lets a visitor browse the skill catalogue, search by name, and open a skill for detail.

## Sub-features

- `skills-open` reaches `/skills` from nav or Home.
- `skills-search` filters the catalogue by query text.
- `skills-open-row` opens a skill from a catalogue row/card.
- `skills-empty` shows an empty state for a query with no matches.

## How to get to it (user POV)

- Choose the `Skills` link in the desktop TopNav.
- Open `Navigation`, then choose `Skills` on phone widths.
- Choose `Show all` from Home Top skills.
- Open `/skills` directly.

## Driving it with control-github-io

Preconditions:

- Doctor is healthy.
- Desktop width (≥768px) unless proving the drawer path.
- Catalogue includes Kubernetes (seeded static data).

- **Nav entry.** From Home, choose Skills. Run `control-github-io browser navigate --url /`, `control-github-io browser click --role link --name Skills`, and `control-github-io browser ready --selector 'main[aria-labelledby="skills-page-title"]'`. Pathname is `/skills`.
- **Search match.** Focus search and type `kubernetes`. Run `control-github-io browser fill --selector 'input[placeholder="Search skills..."], [role="combobox"][aria-label="Search skills"], input[aria-label="Search skills"]' --value kubernetes` if a single selector works in the current build; otherwise evaluate which search control is mounted and fill that control. Observable result: at least one skills link/row referring to Kubernetes remains and unrelated skills are reduced or hidden.
- **Open row.** Choose the Kubernetes skill entry. Run `control-github-io browser click --selector 'a[href="/skills/kubernetes"]'` then `control-github-io browser ready --selector 'main[aria-label="Skill detail"]'`. Pathname is `/skills/kubernetes` and the detail `h1` is focused or present.
- **Empty search.** Return to `/skills`, search for `volcano-not-a-skill`. Run fill with that value. An empty state is visible (EmptyState copy or zero skill links).
- **Proof.** Capture a matched catalogue state before opening detail. Run snapshot/screenshot under `skills/catalogue.aria.txt` and `skills/catalogue.png` showing Skills identity and a Kubernetes result.

## Gotchas

- Table layout (≥ table breakpoint) opens skill detail in a sheet; card layout navigates to `/skills/:id`. Assert the resulting UI for the viewport you launched, and do not treat the other layout as verified.
- Search may be a PowerSearch combobox or a TextInput depending on layout. Discover the mounted control with an eval before filling if the default selector misses.
- Mobile drawer also exposes `Search skills` — that searches nav shortcuts, not the Skills page catalogue. Catalogue search lives on `/skills`.
- Do not count unit-test MemoryRouter renders as browser proof.
