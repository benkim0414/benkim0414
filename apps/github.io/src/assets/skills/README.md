# Skill assets

## AWS Architecture Icons

- Source page: https://aws.amazon.com/architecture/icons/
- Archive: https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/architecture/approved/architecture-icons/Icon-package_04302026.4705b90f5aa45b019271a2699e9ce9b97b941ee1.zip
- Release: Q2 2026 / 2026-04-30
- Retrieval date: 2026-08-08
- Terms: https://aws.amazon.com/architecture/icons/#aws-architecture-icons-terms

The following unmodified 64px SVG assets were extracted from the archive:

| Upstream filename                               | Local filename                |
| ----------------------------------------------- | ----------------------------- |
| `Arch_AWS-CodePipeline_64.svg`                  | `aws/aws-codepipeline.svg`    |
| `Arch_AWS-CodeBuild_64.svg`                     | `aws/aws-codebuild.svg`       |
| `Arch_Amazon-Elastic-Container-Registry_64.svg` | `aws/amazon-ecr.svg`          |
| `Arch_Amazon-Elastic-Kubernetes-Service_64.svg` | `aws/amazon-eks.svg`          |
| `Arch_AWS-Systems-Manager_64.svg`               | `aws/aws-systems-manager.svg` |

### AWS and AWS IAM

- AWS wordmark source:
  [`aws/aws-toolkit-vscode`](https://github.com/aws/aws-toolkit-vscode/blob/dace1121c2af320011cdc0eb64e10b4d2ab50598/packages/core/resources/aws-logo.svg)
- AWS IAM icon source:
  [`awslabs/aws-icons-for-plantuml` v23.0](https://github.com/awslabs/aws-icons-for-plantuml/blob/50efda948226ff4e06937596201528b707ef3ef9/dist/SecurityIdentityCompliance/IdentityandAccessManagement.png)
- IAM source SHA-256:
  `a3e65cb907bfd9af17d6ef6d42da746461fdac191696d7f818682349a8795d55`
- Retrieval date: 2026-08-10

The AWS wordmark is vendored as SVG. The IAM image is embedded byte-for-byte
from AWS Labs' current release, which is generated from the official AWS
Architecture Icons package.

## Grafana Labs project icons

- Retrieval date: 2026-08-10
- Loki source:
  [`grafana/grafana`](https://github.com/grafana/grafana/blob/caef03cc03af5476d2c3ebc6ab3b986dc4ad9e42/public/app/features/loki-helpers/loki_icon.svg)
- Alloy source:
  [`grafana/alloy`](https://github.com/grafana/alloy/blob/7bdd3ddf203267be0261969f204ae070be74e0f7/docs/sources/assets/alloy_icon_orange.svg)

The local SVGs preserve the official project artwork while removing editor
metadata and external document declarations that are unnecessary for browser
rendering.

## Testcontainers project mark

- Source:
  [`testcontainers/testcontainers-site`](https://github.com/testcontainers/testcontainers-site/blob/bb55daec6ac08b13fa9a9949c94e87da538dc457/assets/images/testcontainers-mark.svg)
- Retrieval date: 2026-08-10

The local SVG preserves the official standalone project mark without artwork
changes.

## Kustomize fallback

Kustomize does not publish a dedicated official brand asset. The UI uses the
Kubernetes mark from the installed Simple Icons package as a contextual fallback
because Kustomize is Kubernetes SIG CLI tooling and is integrated into `kubectl`.
The Kubernetes mark is not represented as a distinct Kustomize brand.

## MetalLB project logo

- Source: [`metallb/metallb`](https://github.com/metallb/metallb/blob/90208910655f9203abdcc8c24c9539166dc6ab3b/website/static/images/logo/metallb-blue.svg)
- Pinned revision: `90208910655f9203abdcc8c24c9539166dc6ab3b`
- Retrieval date: 2026-08-12
- SHA-256: `4f1ada0dc51500a01353bd73655012b22918fbceb590c6b457eb4df31debe35f`
- Source repository license: Apache-2.0

The local SVG is the unmodified blue MetalLB artwork published in the official
project repository. The logo remains the property of its project; the
repository license is recorded as provenance rather than a trademark grant.

## kube-vip project logo

- Source: [`kube-vip/kube-vip`](https://github.com/kube-vip/kube-vip/blob/ec0014d9ea96cd482088df60c317040886c445ac/kube-vip.png)
- Pinned revision: `ec0014d9ea96cd482088df60c317040886c445ac`
- Retrieval date: 2026-08-12
- SHA-256: `93bbb7f0da7fdb54c6939fd08e2e81e3a93ab684e585856fe67559cda92b4786`
- Source repository license: Apache-2.0

The local PNG is the unmodified project artwork published by kube-vip's
official repository. The logo remains the property of its project; the
repository license is recorded as provenance rather than a trademark grant.

## Amazon S3 project mark

- Source: https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/50efda948226ff4e06937596201528b707ef3ef9/dist/Storage/SimpleStorageService.png
- Pinned revision: `50efda948226ff4e06937596201528b707ef3ef9`
- Retrieval date: 2026-08-12
- SHA-256: `6715951abe7d964792afc3d36dec4e2f89e7d27df74d702ba75e575304a80d22`
- Provenance: Amazon-published AWS architecture artwork, `CC-BY-ND-2.0` in
  the source package.

The source package license is recorded as provenance and is not a trademark
grant.

## Yazi project mark

- Source: https://raw.githubusercontent.com/sxyazi/yazi/5ab58e3029c023ca1ae4bd788716b3da927fb525/assets/logo.png
- Pinned revision: `5ab58e3029c023ca1ae4bd788716b3da927fb525`
- Retrieval date: 2026-08-12
- SHA-256: `7df01d685d6727dcf165f2de5d9145dedca89d38e18f526209a9ec6346ab9915`
- Provenance: official `sxyazi/yazi` repository asset; repository license
  MIT.

The repository license is recorded as provenance and is not a trademark grant.

## mise project mark

- Source: https://raw.githubusercontent.com/jdx/mise/05251b278bd78682dd56a879d5975a2d7faad794/docs/public/logo.svg
- Pinned revision: `05251b278bd78682dd56a879d5975a2d7faad794`
- Retrieval date: 2026-08-12
- SHA-256: `e4a37c1531f5f7d7fcb0ba2e7f55ec37c1ff88d9124f226bea397451e70c5873`
- Provenance: official `jdx/mise` repository asset; repository license MIT.

The repository license is recorded as provenance and is not a trademark grant.

## gh-dash project mark

- Source: https://raw.githubusercontent.com/dlvhdr/gh-dash/4ea7c39fbe4d12dbbd66398253fbd81b61073e06/docs/public/favicon.png
- Pinned revision: `4ea7c39fbe4d12dbbd66398253fbd81b61073e06`
- Retrieval date: 2026-08-12
- SHA-256: `42d4d02e60d51e8e7125ec8fb0308b8d5b1409a1f7d40a99179f779b0ad74d7c`
- Provenance: official `dlvhdr/gh-dash` documentation favicon; repository
  license MIT.

The repository license is recorded as provenance and is not a trademark grant.

## Herdr project mark

- Source: https://raw.githubusercontent.com/herdrdev/herdr/5600197f00e871764465d4e3d9ba5e6aa6fd9547/assets/logo.svg
- Pinned revision: `5600197f00e871764465d4e3d9ba5e6aa6fd9547`
- Retrieval date: 2026-08-12
- SHA-256: `f4a8400d515fcf50112a952a5b48f5fa6e6b02b4dcb0b483ca92be39f7d7f7a1`
- Provenance: official `herdrdev/herdr` repository asset; repository license
  Apache-2.0.

The repository license is recorded as provenance and is not a trademark grant.

## Codex project mark

- LobeHub page: https://lobehub.com/icons/codex
- Source: https://raw.githubusercontent.com/lobehub/lobe-icons/befa2f8022c22985891e5d28aa706f9fba8c578d/packages/static-svg/icons/codex-color.svg
- Pinned revision: `befa2f8022c22985891e5d28aa706f9fba8c578d`
- Retrieval date: 2026-08-12
- SHA-256: `4a2f43ce46b5b6e3722c95088f88d26ef91e6a8c2e598e70642a1c54367386e4`
- Provenance: LobeHub community-maintained Codex mark; LobeHub license MIT;
  not an official OpenAI asset source.

The repository license is recorded as provenance and is not a trademark grant.
