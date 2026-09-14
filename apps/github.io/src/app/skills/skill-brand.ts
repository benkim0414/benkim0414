import {
  siAlpinelinux,
  siAnsible,
  siArgo,
  siBat,
  siClaude,
  siClaudecode,
  siCircleci,
  siCloudflare,
  siConsul,
  siConventionalcommits,
  siDatadog,
  siDebian,
  siDocker,
  siElasticstack,
  siFedora,
  siGit,
  siGithub,
  siGithubactions,
  siGitlab,
  siGooglecloud,
  siGnu,
  siGo,
  siGrafana,
  siGnubash,
  siGhostty,
  siHelm,
  siHomebrew,
  siIstio,
  siJest,
  siJson,
  siJfrog,
  siK3s,
  siKubernetes,
  siLinuxcontainers,
  siLonghorn,
  siLua,
  siMacos,
  siMarkdown,
  siNeovim,
  siNodedotjs,
  siNx,
  siNginx,
  siOpenid,
  siPnpm,
  siPrometheus,
  siPostgresql,
  siPython,
  siReact,
  siRedis,
  siRenovate,
  siSentry,
  siStarship,
  siTailscale,
  siToml,
  siTerraform,
  siTraefikproxy,
  siTmux,
  siTypescript,
  siUbuntu,
  siUdemy,
  siUv,
  siVault,
  siVim,
  siYaml,
  siZsh,
  type SimpleIcon,
} from 'simple-icons';

import codeBuildIconUrl from '../../assets/skills/aws/aws-codebuild.svg?no-inline';
import codePipelineIconUrl from '../../assets/skills/aws/aws-codepipeline.svg?no-inline';
import ecrIconUrl from '../../assets/skills/aws/amazon-ecr.svg?no-inline';
import eventBridgeIconUrl from '../../assets/skills/aws/amazon-eventbridge.svg?no-inline';
import eksIconUrl from '../../assets/skills/aws/amazon-eks.svg?no-inline';
import amazonS3IconUrl from '../../assets/skills/aws/amazon-s3.png';
import systemsManagerIconUrl from '../../assets/skills/aws/aws-systems-manager.svg?no-inline';
import lambdaIconUrl from '../../assets/skills/aws/aws-lambda.svg?no-inline';
import awsLogoUrl from '../../assets/skills/aws/aws-logo.svg?no-inline';
import codexIconUrl from '../../assets/skills/codex/codex.svg?no-inline';
import ghDashIconUrl from '../../assets/skills/gh-dash/gh-dash.png';
import alloyIconUrl from '../../assets/skills/grafana/alloy-icon-orange.svg?no-inline';
import lokiIconUrl from '../../assets/skills/grafana/loki-icon.svg?no-inline';
import herdrIconUrl from '../../assets/skills/herdr/herdr.svg?no-inline';
import kubeVipIconUrl from '../../assets/skills/kube-vip/kube-vip.png';
import metallbIconUrl from '../../assets/skills/metallb/metallb.svg?no-inline';
import miseIconUrl from '../../assets/skills/mise/mise.svg?no-inline';
import testcontainersIconUrl from '../../assets/skills/testcontainers/testcontainers-mark.svg?no-inline';
import yaziIconUrl from '../../assets/skills/yazi/yazi.png';

export type SkillBrandSurface = 'brand' | 'neutral';

export interface SkillBrand {
  name: string;
  color: string;
  foreground: string;
  surface: SkillBrandSurface;
  iconPath?: string;
  iconDataUrl?: string;
}

export type IconBackedSkillBrand = SkillBrand &
  ({ iconPath: string } | { iconDataUrl: string });

const awsIamIconDataUrl =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAQKADAAQAAAABAAAAQAAAAABGUUKwAAADP0lEQVRoBWO8a+LDMJQB01B2PMjtox4Y6BgcjYHRGKAwBEaTEIUBSLH20RigOAgpNGA0BigMQIq1j8YAxUFIoQFDPgZY8AeAxIR6LmsT/GpoKvvt6JkXBY14rCAQAwPreqC7CTqAQAxAvH7P1BdPGNBOSun0ZoKGE4gBgvoHXMGQ9wBRSQhrMLOpKPAFe7JrKLPKSTEwMv1++uL3w6ffDp/8uvfY/z9/sGqhhSA5HmARFRapzeWyNEZ2ENAnQMTjbvc788Wrys6f1+8gy9KOTbIHmEWEpOb3sIiL/H3/8fOm3V/3Hfv9+BnQfSyS4hx6GnwhXmzK8pIz2p7GFv5+9JR27oabTHIeEMqJB7r+x6XrTyJz301Z+PPa7X+fvwLRr1v3Pq3Z9jSm4OuBE0xcnELZcXA7aMog2QOQgvlVbe/ft+8xXQZM/W+7ZgDFOU31MWVpIUKyB5gF+IDu+PPsJS7X/Hn9FijFxMuNSwF1xUn2AHWtp9w0kjMx2VbiqVbhNT1EDZxLjF2jMUBMKIHVEBOuxKhBs5CEJCTRV8dlawrRjyc9wC1QOrXp25EzL4qa4CK0YJCQhOCuJ9YdjIwkayHWaIQ6EmIAoumemR/D//8IA9BYjIxwAWAMwNlABmakIScYZFlkcWQTsLJJ9gBWUxCCePyGUERNFukeQHUif7ivQEII0EUfFqz5uBLU/0AOS2SX4g9X/LLI5qCxScgDaDqBXA59TeGSNGDzDoiADCAXUw2tRUiPASQXsWuqAnlfdhwEkjwe9kDuj4vX4WGJFhVoXCRjEEy4XoQQIRZFHvhx/grQfKDTIbZAuIRspLI8RR74efPe64Z+0YZCoKOADCAXyMAV0mSELjF+pSgPAC34vHUfxBo4A8VW1ByPIkUlDkUxgNUN0JBmZESrB7AqplyQdA8AqyrUcKVR2iDSbyR7gD7hSqTrgcpIyAPfDp9GC3uC1gAbcwTVUKiAhBigdbuSPJ+QEAPkWUBrXUTFAK6indaOI8Z8AjEAHJ4nxhTaqSHoAMbRBU+0C32iTCaQhIgyY0AVjXpgQIMfaPloDIzGAIUhMJqEKAxAirWPxgDFQUihAaMxQGEAUqx9yMcAABcs0QNqdPp+AAAAAElFTkSuQmCC';

const skillIcons: Readonly<Record<string, SimpleIcon>> = {
  'Alpine Linux': siAlpinelinux,
  Ansible: siAnsible,
  'Argo CD': siArgo,
  ArgoCD: siArgo,
  bat: siBat,
  Claude: siClaude,
  'Claude Code': siClaudecode,
  'Circle CI': siCircleci,
  Cloudflare: siCloudflare,
  Consul: siConsul,
  'Conventional Commits': siConventionalcommits,
  Datadog: siDatadog,
  Debian: siDebian,
  Docker: siDocker,
  'Elastic Stack': siElasticstack,
  Fedora: siFedora,
  Git: siGit,
  GitHub: siGithub,
  'GitHub API': siGithub,
  'GitHub Packages': siGithub,
  'GitHub Actions': siGithubactions,
  GitLab: siGitlab,
  'GitLab CI': siGitlab,
  'GCP Functions': siGooglecloud,
  'Google Cloud': siGooglecloud,
  'GNU Stow': siGnu,
  Go: siGo,
  Grafana: siGrafana,
  Bash: siGnubash,
  'GNU Bash': siGnubash,
  Ghostty: siGhostty,
  Helm: siHelm,
  Homebrew: siHomebrew,
  Istio: siIstio,
  Artifactory: siJfrog,
  Jest: siJest,
  JSON: siJson,
  K3s: siK3s,
  Kubernetes: siKubernetes,
  'Kubernetes RBAC': siKubernetes,
  Kustomize: siKubernetes,
  kubectl: siKubernetes,
  LXC: siLinuxcontainers,
  Lua: siLua,
  Longhorn: siLonghorn,
  Markdown: siMarkdown,
  macOS: siMacos,
  Neovim: siNeovim,
  Nginx: siNginx,
  'Node.js': siNodedotjs,
  Nx: siNx,
  'OpenID Connect': siOpenid,
  pnpm: siPnpm,
  Prometheus: siPrometheus,
  Alertmanager: siPrometheus,
  promtool: siPrometheus,
  PostgreSQL: siPostgresql,
  Python: siPython,
  React: siReact,
  Redis: siRedis,
  Renovate: siRenovate,
  Sentry: siSentry,
  Starship: siStarship,
  Terraform: siTerraform,
  Tailscale: siTailscale,
  Traefik: siTraefikproxy,
  tmux: siTmux,
  TOML: siToml,
  TypeScript: siTypescript,
  Ubuntu: siUbuntu,
  Udemy: siUdemy,
  uv: siUv,
  Vault: siVault,
  Vim: siVim,
  YAML: siYaml,
  Zsh: siZsh,
};

const skillIconAssets: Readonly<Record<string, string>> = {
  AWS: awsLogoUrl,
  'AWS IAM': awsIamIconDataUrl,
  'AWS CodePipeline': codePipelineIconUrl,
  'AWS CodeBuild': codeBuildIconUrl,
  'Amazon ECR': ecrIconUrl,
  'Amazon EKS': eksIconUrl,
  EKS: eksIconUrl,
  'AWS EventBridge': eventBridgeIconUrl,
  'AWS Lambda': lambdaIconUrl,
  'AWS Systems Manager Parameter Store': systemsManagerIconUrl,
  'Amazon S3': amazonS3IconUrl,
  Alloy: alloyIconUrl,
  Codex: codexIconUrl,
  'gh-dash': ghDashIconUrl,
  Herdr: herdrIconUrl,
  Loki: lokiIconUrl,
  MetalLB: metallbIconUrl,
  mise: miseIconUrl,
  'kube-vip': kubeVipIconUrl,
  Testcontainers: testcontainersIconUrl,
  Yazi: yaziIconUrl,
};

const skillBrandColors: Readonly<Record<string, string>> = {
  AWS: '#FFFFFF',
  'AWS IAM': '#FFFFFF',
  IRSA: '#FF9900',
  'AWS CodePipeline': '#FFFFFF',
  'AWS CodeBuild': '#FFFFFF',
  'Amazon ECR': '#FFFFFF',
  'Amazon EKS': '#FFFFFF',
  'AWS EventBridge': '#FFFFFF',
  'AWS Lambda': '#FFFFFF',
  'AWS Systems Manager Parameter Store': '#FFFFFF',
  'Amazon S3': '#FFFFFF',
  Alloy: '#FFFFFF',
  Codex: '#FFFFFF',
  'gh-dash': '#FFFFFF',
  Herdr: '#FFFFFF',
  Loki: '#FFFFFF',
  MetalLB: '#FFFFFF',
  mise: '#FFFFFF',
  'kube-vip': '#FFFFFF',
  Testcontainers: '#FFFFFF',
  Yazi: '#FFFFFF',
};

const skillBrandSurfaces: Readonly<Record<string, SkillBrandSurface>> = {
  'Amazon S3': 'neutral',
  Alloy: 'neutral',
  Codex: 'neutral',
  'gh-dash': 'neutral',
  Herdr: 'neutral',
  Loki: 'neutral',
  MetalLB: 'neutral',
  mise: 'neutral',
  'kube-vip': 'neutral',
  Yazi: 'neutral',
};

const ASTRYX_NEUTRAL_FOREGROUND = 'var(--color-on-light)';
const ASTRYX_INVERSE_FOREGROUND = 'var(--color-on-dark)';
const NEUTRAL_FOREGROUND_HEX = '000000';
const INVERSE_FOREGROUND_HEX = 'FFFFFF';
const themeAdaptiveSkillIcons = new Set([
  'GitHub',
  'GitHub API',
  'GitHub Packages',
]);

function relativeLuminance(hex: string) {
  const channels = [0, 2, 4].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const linearChannels = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return (
    0.2126 * linearChannels[0] +
    0.7152 * linearChannels[1] +
    0.0722 * linearChannels[2]
  );
}

function contrastRatio(firstLuminance: number, secondLuminance: number) {
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function brandForeground(hex: string) {
  const backgroundLuminance = relativeLuminance(hex);
  const neutralContrast = contrastRatio(
    relativeLuminance(NEUTRAL_FOREGROUND_HEX),
    backgroundLuminance,
  );
  const inverseContrast = contrastRatio(
    relativeLuminance(INVERSE_FOREGROUND_HEX),
    backgroundLuminance,
  );

  return neutralContrast >= inverseContrast
    ? ASTRYX_NEUTRAL_FOREGROUND
    : ASTRYX_INVERSE_FOREGROUND;
}

function toIconDataUrl(icon: SimpleIcon, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>${icon.title}</title><path fill="${color}" d="${icon.path}"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getSkillBrandIconDataUrl(
  label: string,
  mode: 'light' | 'dark',
  inverseIconColor: string,
): string | undefined {
  const icon = skillIcons[label];

  if (icon) {
    return toIconDataUrl(
      icon,
      mode === 'dark' && themeAdaptiveSkillIcons.has(label)
        ? inverseIconColor
        : `#${icon.hex}`,
    );
  }

  return skillIconAssets[label];
}

export function getSkillBrand(label: string): SkillBrand | undefined {
  const icon = skillIcons[label];
  const iconAssetUrl = skillIconAssets[label];
  const color = icon ? `#${icon.hex}` : skillBrandColors[label];

  if (!icon && !iconAssetUrl && !color) {
    return undefined;
  }

  const brandColor = color ?? '#FFFFFF';
  const surface = skillBrandSurfaces[label] ?? (icon ? 'brand' : 'neutral');

  const iconData = icon
    ? {
        iconPath: icon.path,
        iconDataUrl: toIconDataUrl(icon, brandColor),
      }
    : iconAssetUrl
      ? { iconDataUrl: iconAssetUrl }
      : {};

  return {
    name: label,
    color: brandColor,
    foreground: brandForeground(brandColor.slice(1)),
    surface,
    ...iconData,
  };
}

export function hasSkillBrandIcon(
  brand: SkillBrand | undefined,
): brand is IconBackedSkillBrand {
  return Boolean(brand?.iconPath || brand?.iconDataUrl);
}
