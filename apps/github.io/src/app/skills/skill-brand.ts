import {
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
  siDocker,
  siGit,
  siGithub,
  siGithubactions,
  siGitlab,
  siGnu,
  siGo,
  siGrafana,
  siGnubash,
  siGhostty,
  siHelm,
  siHomebrew,
  siIstio,
  siJson,
  siJfrog,
  siKubernetes,
  siLua,
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
  siStarship,
  siToml,
  siTerraform,
  siTmux,
  siTypescript,
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
import eksIconUrl from '../../assets/skills/aws/amazon-eks.svg?no-inline';
import systemsManagerIconUrl from '../../assets/skills/aws/aws-systems-manager.svg?no-inline';

export interface SkillBrand {
  name: string;
  color: string;
  foreground: string;
  iconPath?: string;
  iconDataUrl?: string;
}

export type IconBackedSkillBrand = SkillBrand &
  ({ iconPath: string } | { iconDataUrl: string });

const skillIcons: Readonly<Record<string, SimpleIcon>> = {
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
  Docker: siDocker,
  Git: siGit,
  GitHub: siGithub,
  'GitHub API': siGithub,
  'GitHub Actions': siGithubactions,
  'GitLab CI': siGitlab,
  'GNU Stow': siGnu,
  Go: siGo,
  Grafana: siGrafana,
  'GNU Bash': siGnubash,
  Ghostty: siGhostty,
  Helm: siHelm,
  Homebrew: siHomebrew,
  Istio: siIstio,
  Artifactory: siJfrog,
  JSON: siJson,
  Kubernetes: siKubernetes,
  Kustomize: siKubernetes,
  kubectl: siKubernetes,
  Lua: siLua,
  Neovim: siNeovim,
  Nginx: siNginx,
  'Node.js': siNodedotjs,
  Nx: siNx,
  'OpenID Connect': siOpenid,
  pnpm: siPnpm,
  Prometheus: siPrometheus,
  PostgreSQL: siPostgresql,
  Python: siPython,
  React: siReact,
  Starship: siStarship,
  Terraform: siTerraform,
  tmux: siTmux,
  TOML: siToml,
  TypeScript: siTypescript,
  Udemy: siUdemy,
  uv: siUv,
  Vault: siVault,
  Vim: siVim,
  YAML: siYaml,
  Zsh: siZsh,
};

const skillIconAssets: Readonly<Record<string, string>> = {
  'AWS CodePipeline': codePipelineIconUrl,
  'AWS CodeBuild': codeBuildIconUrl,
  'Amazon ECR': ecrIconUrl,
  'Amazon EKS': eksIconUrl,
  'AWS Systems Manager Parameter Store': systemsManagerIconUrl,
};

const skillBrandColors: Readonly<Record<string, string>> = {
  AWS: '#FF9900',
  'AWS IAM': '#FF9900',
  IRSA: '#FF9900',
  'AWS CodePipeline': '#FFFFFF',
  'AWS CodeBuild': '#FFFFFF',
  'Amazon ECR': '#FFFFFF',
  'Amazon EKS': '#FFFFFF',
  'AWS Systems Manager Parameter Store': '#FFFFFF',
};

const ASTRYX_NEUTRAL_FOREGROUND = 'var(--color-on-light)';
const ASTRYX_INVERSE_FOREGROUND = 'var(--color-on-dark)';
const NEUTRAL_FOREGROUND_HEX = '000000';
const INVERSE_FOREGROUND_HEX = 'FFFFFF';

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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="${icon.path}"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getSkillBrand(label: string): SkillBrand | undefined {
  const icon = skillIcons[label];
  const iconAssetUrl = skillIconAssets[label];
  const color = icon ? `#${icon.hex}` : skillBrandColors[label];

  if (!icon && !iconAssetUrl && !color) {
    return undefined;
  }

  const brandColor = color ?? '#FFFFFF';

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
    ...iconData,
  };
}

export function hasSkillBrandIcon(
  brand: SkillBrand | undefined,
): brand is IconBackedSkillBrand {
  return Boolean(brand?.iconPath || brand?.iconDataUrl);
}
