# GitHub Pages artifact release setup

The deployment workflow requires `benkim0414/benkim0414.github.io` to have a
seeded `main` branch before its first run. The workflow deliberately checks out
that branch and makes normal fast-forward pushes; it does not create or
force-push target history.

## Bootstrap the target repository

Create the public repository with one initial commit on `main`:

```bash
bootstrap_dir="$(mktemp -d)"
git -C "$bootstrap_dir" init -b main
git -C "$bootstrap_dir" config user.name "Ben Kim"
git -C "$bootstrap_dir" config user.email "benkim0414@users.noreply.github.com"
printf '# benkim0414.github.io\n' > "$bootstrap_dir/README.md"
git -C "$bootstrap_dir" add README.md
git -C "$bootstrap_dir" commit -m "chore: seed Pages main branch"
gh repo create benkim0414/benkim0414.github.io \
  --public \
  --source "$bootstrap_dir" \
  --remote origin \
  --push
```

In the target repository's **Settings → Pages**, select **Deploy from a
branch**, then choose `main` and `/(root)`.

## Install the target-scoped deploy key

Generate a dedicated key pair. Do not reuse a personal SSH key:

```bash
ssh-keygen -t ed25519 \
  -C "benkim0414.github.io deploy key" \
  -N '' \
  -f ./github-pages-deploy-key
gh repo deploy-key add ./github-pages-deploy-key.pub \
  --repo benkim0414/benkim0414.github.io \
  --title "benkim0414 artifact deployment" \
  --allow-write
gh secret set PAGES_DEPLOY_KEY \
  --repo benkim0414/benkim0414 \
  < ./github-pages-deploy-key
```

Delete the local key files after the public key is registered and the private
key secret is stored. The deployment job uses the `github-pages` Environment;
apply the intended Environment protection before the first release.

## Verify the first deployment

After the migration is integrated into `main`, select its full 40-character
first-parent SHA. Preview that exact source with
`pnpm release:github.io bootstrap --start 8acdd81 --target <reviewed-main-sha>`
and obtain handoff approval for the resulting SHA/version pair. A new target
requires a fresh preview and approval.

After that approval, dispatch **Release github.io** on `main` with
`bootstrap: true`, `source_sha: <reviewed-main-sha>`, and
`reviewed_version: <approved-version>`. Bootstrap requires both explicit inputs;
the workflow checks first-parent membership and compares the replayed version
before installing dependencies or building. If `main` advances before dispatch,
the supplied SHA still selects the approved source. Changing the supplied
version or omitting either input fails before publication.

The seeded README is replaced by the built site. Verify the live footer,
`.github-pages-release.json`, the `github.io@<approved-version>` tag, and GitHub
Release all identify the approved source and version. The target root contains
static build output, `.nojekyll`, and the release metadata, with no source
`package.json`. Open `/`, `/skills`, and a representative skill-detail deep
link at `https://benkim0414.github.io/`.

## Normal releases and recovery

Ordinary `main` pushes replay qualifying `github.io` integrations since the
latest project tag. Ignored histories and obsolete first-parent targets stop
successfully before building or publishing. A missing baseline requires the
explicit bootstrap above.

The coordinator supplies the candidate project/version to the pinned Nx 23
Release API before building. Nx resolves the release graph, normal tag baseline,
candidate version, and tag format; disagreement fails the build gate. Its dry
run disables staging, commits, tags, pushes, and lockfile updates. Only the
ignored `dist/release-manifests/github.io/package.json` is prepared for version
actions. A small Nx version-action adapter reads that generated `0.0.0` baseline
for bootstrap; source manifests never supply the production version.

The workflow persists the archive and canonical release record as a 90-day
Actions artifact before creating a tag. Release notes use only the accepted
commits saved in that record. Existing Release notes and assets must match on
retry; assets are never overwritten.

For recovery, dispatch **Release github.io** with the original `source_sha` and
leave `bootstrap` false. Saved state restores the original version and bootstrap
flag, so recovery does not require a fresh version approval and never rebuilds.
Missing, expired, ambiguous, or corrupt evidence fails explicitly. Completed
delivery skips synchronization, and retrying an older release after a newer
deployment leaves the newer deployment untouched.

`pnpm test:release:github.io` includes temporary Git/filesystem workflow tests
with controlled GitHub and build boundaries, plus separate real Nx and Vite
boundary tests. These cover failure after persistence, tag creation, Release
creation, each asset upload, publication, Pages synchronization, and delivery.
They do not verify live Actions retention, Environment protection, GitHub API
availability, or the deployed footer; those remain first-run handoff checks.
