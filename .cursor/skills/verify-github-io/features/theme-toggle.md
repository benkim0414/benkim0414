# Theme toggle

Theme toggle lets a visitor switch the site canvas between dark and light modes from the global header.

## Sub-features

- `theme-to-light` switches from the default dark canvas to light.
- `theme-to-dark` restores dark mode.
- `theme-label` exposes the opposite-mode action on the toggle button.

## How to get to it (user POV)

- Choose `Switch to light mode` in the header while dark mode is active.
- Choose `Switch to dark mode` in the header while light mode is active.

## Driving it with control-github-io

Preconditions:

- Doctor is healthy.
- Start from Home with dark mode (app default). Confirm with eval of `data-theme` before mutating.

- **Confirm dark default.** Run `control-github-io browser navigate --url /` and `control-github-io browser eval --expression 'document.documentElement.getAttribute("data-theme")'`. Value is `dark`. The header button accessible name is `Switch to light mode`.
- **Switch to light.** Run `control-github-io browser click --selector 'button[aria-label="Switch to light mode"]'` then eval theme and the button label. Theme is `light`, `color-scheme` on the root is `light`, and the button name becomes `Switch to dark mode`.
- **Restore dark.** Run `control-github-io browser click --selector 'button[aria-label="Switch to dark mode"]'` then eval again. Theme is `dark` and the button name is `Switch to light mode`.
- **Proof.** Capture light-mode Home as `theme-toggle/light.aria.txt` and `theme-toggle/light.png` after the light switch (before restoring dark if that screenshot is the proof), and record the eval JSON for both theme values in the run notes or an `theme-toggle/theme.json` eval dump.

## Gotchas

- Default mode is dark. A run that starts mid-session after another feature left light mode must reset or assert the actual starting mode before claiming the default.
- Tooltip text matches the button aria-label; assert the button name, not hover chrome.
- Theme proof requires the `data-theme` attribute (and preferably `color-scheme`), not only a visually darker screenshot.
