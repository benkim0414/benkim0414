# DevOps roadmap

Roadmap maps DevOps topics to skills, certifications, and evidence in a stepper the visitor can scan.

## Sub-features

- `roadmap-open` reaches `/roadmap` from nav or URL.
- `roadmap-stepper` shows the completed/upcoming stepper content.
- `roadmap-about` shows the roadmap.sh info banner.

## How to get to it (user POV)

- Choose the `Roadmap` link in the desktop TopNav.
- Open `Navigation`, then choose `Roadmap` on phone widths.
- Open `/roadmap` directly.

## Driving it with control-github-io

Preconditions:

- Doctor is healthy.
- Desktop width for TopNav link entry, or phone width with Navigation drawer.

- **Nav entry.** From Home, choose Roadmap. Run `control-github-io browser navigate --url /`, `control-github-io browser click --role link --name Roadmap`, and `control-github-io browser ready --selector 'main'`. Pathname is `/roadmap` and a heading containing `DevOps roadmap` is visible.
- **Stepper.** Run `control-github-io browser eval --expression 'Boolean(document.querySelector("[data-roadmap-stepper]")) && document.querySelectorAll("[data-roadmap-stepper] > *").length > 0'`. Returns `true`.
- **About banner.** Run `control-github-io browser eval --expression 'document.body.innerText.includes("About roadmap.sh")'`. Returns `true`.
- **Proof.** Capture `roadmap/roadmap.aria.txt` and `roadmap/roadmap.png` showing the Roadmap heading and stepper.

## Gotchas

- Roadmap `main` has no `aria-label`; identify the page by pathname plus the `DevOps roadmap` heading text.
- Theme changes alter stepper colors; identity proof does not require a specific theme, but layout color audits belong to `verify-mobile-layout-browser`, not this journey.
- External `Learn more` points at roadmap.sh; local proof must not depend on that network request succeeding.
