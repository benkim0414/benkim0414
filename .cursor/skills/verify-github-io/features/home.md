# Home landing

Home is the default landing page: a visitor sees the practice headline, highlighted skills, and DORA capability cards, and can jump to the full skills catalogue.

## Sub-features

- `home-open` loads `/` with the Home main landmark.
- `home-top-skills` shows the Top skills carousel region.
- `home-dora` shows the DORA capabilities heading and banner.
- `home-show-all` follows Show all into Skills.

## How to get to it (user POV)

- Open the site root `/` after launch.
- Choose the `Home` link in the global nav (desktop) or Navigation drawer (phone).

## Driving it with control-github-io

Preconditions:

- `control-github-io doctor` reports `ok: true`.
- Theme may be dark or light; identity proof does not depend on theme.

- **Open Home.** Navigate to `/`. Run `control-github-io browser navigate --url /` then `control-github-io browser ready --selector 'main[aria-label="Home"]'`. The main landmark `Home` is present and the heading text includes `DevOps engineering practice`.
- **Confirm Top skills.** Run `control-github-io browser eval --expression 'Boolean(document.querySelector("#top-skills-title")) && Boolean(document.querySelector("[aria-label=\\"Highlighted skills\\"]"))'`. The expression returns `true`.
- **Confirm DORA region.** Run `control-github-io browser eval --expression 'Boolean(document.querySelector("#dora-capabilities-title")) && Boolean(document.querySelector("[data-testid=\\"dora-capabilities-banner\\"]")) && document.querySelectorAll("[data-testid=\\"dora-capability-card\\"]").length > 0'`. The expression returns `true`.
- **Show all skills.** Choose `Show all`. Run `control-github-io browser click --role link --name "Show all"` then `control-github-io browser ready --selector 'main[aria-labelledby="skills-page-title"]'`. The pathname is `/skills`.
- **Proof.** Return to Home and capture identity. Run `control-github-io browser navigate --url /`, `control-github-io browser ready --selector 'main[aria-label="Home"]'`, `control-github-io browser snapshot --aria --path home/home.aria.txt`, and `control-github-io browser screenshot --path home/home.png`. Artifacts show the Home landmark and `DevOps engineering practice`.

## Gotchas

- Phone layouts hide desktop TopNav text links; use the `Navigation` button if proving Home via nav instead of direct URL.
- `Show all` is a ghost button rendered as a link to `/skills`; assert pathname, not only button visibility.
- A screenshot of the chrome header alone is insufficient. The Home main landmark must appear in the ARIA snapshot.
