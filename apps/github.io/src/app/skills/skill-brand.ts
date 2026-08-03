import {
  siAnsible,
  siArgo,
  siBat,
  siClaude,
  siClaudecode,
  siCircleci,
  siCloudflare,
  siConsul,
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
  siPnpm,
  siPrometheus,
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

export interface SkillBrand {
  name: string;
  color: string;
  foreground: string;
  iconPath?: string;
  iconDataUrl?: string;
}

const skillIcons: Readonly<Record<string, SimpleIcon>> = {
  Ansible: siAnsible,
  ArgoCD: siArgo,
  bat: siBat,
  Claude: siClaude,
  'Claude Code': siClaudecode,
  'Circle CI': siCircleci,
  Cloudflare: siCloudflare,
  Consul: siConsul,
  Datadog: siDatadog,
  Docker: siDocker,
  Git: siGit,
  GitHub: siGithub,
  'GitHub Actions': siGithubactions,
  'GitLab CI': siGitlab,
  'GNU Stow': siGnu,
  Go: siGo,
  Grafana: siGrafana,
  'GNU Bash': siGnubash,
  Ghostty: siGhostty,
  Homebrew: siHomebrew,
  Istio: siIstio,
  Artifactory: siJfrog,
  JSON: siJson,
  Kubernetes: siKubernetes,
  Lua: siLua,
  Neovim: siNeovim,
  Nginx: siNginx,
  'Node.js': siNodedotjs,
  Nx: siNx,
  pnpm: siPnpm,
  Prometheus: siPrometheus,
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

const skillBrandColors: Readonly<Record<string, string>> = {
  AWS: '#FF9900',
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
  const color = icon ? `#${icon.hex}` : skillBrandColors[label];

  if (!color) {
    return undefined;
  }

  const iconData = icon
    ? {
        iconPath: icon.path,
        iconDataUrl: toIconDataUrl(icon, color),
      }
    : {};

  return {
    name: label,
    color,
    foreground: brandForeground(color.slice(1)),
    ...iconData,
  };
}
