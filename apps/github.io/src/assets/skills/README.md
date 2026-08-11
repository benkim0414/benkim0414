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
