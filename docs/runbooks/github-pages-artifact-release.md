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
gh secret set GITHUB_PAGES_DEPLOY_KEY \
  --repo benkim0414/benkim0414 \
  < ./github-pages-deploy-key
```

Delete the local key files after the public key is registered and the private
key secret is stored. In the source repository's **Settings → Actions →
General**, enable **Allow GitHub Actions to create and approve pull requests**.

## Verify the first deployment

Run **Deploy GitHub Pages artifact** with `workflow_dispatch`. The seeded
README is replaced by the built site. Verify that the target root contains only
static build output plus `.nojekyll` (no `package.json`), then open `/`,
`/skills`, and a representative skill-detail deep link at
`https://benkim0414.github.io/`.

For the first semantic release, merge a patch changeset and the generated PR
titled `chore(release): version github.io`. Confirm exactly one
`github.io@X.Y.Z` tag and GitHub Release point to that PR's merge commit.
