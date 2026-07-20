import type { CSSProperties } from 'react';
import {
  siAnsible,
  siArgo,
  siCircleci,
  siCloudflare,
  siConsul,
  siDatadog,
  siDocker,
  siGit,
  siGithub,
  siGithubactions,
  siGitlab,
  siGo,
  siGrafana,
  siIstio,
  siJfrog,
  siKubernetes,
  siNginx,
  siPrometheus,
  siPython,
  siTerraform,
  siVault,
  type SimpleIcon,
} from 'simple-icons';

export interface SkillTokenProps {
  label: string;
  variant?: 'purple';
}

const skillIcons: Readonly<Record<string, SimpleIcon>> = {
  Ansible: siAnsible,
  ArgoCD: siArgo,
  'Circle CI': siCircleci,
  Cloudflare: siCloudflare,
  Consul: siConsul,
  Datadog: siDatadog,
  Docker: siDocker,
  Git: siGit,
  GitHub: siGithub,
  'GitHub Actions': siGithubactions,
  'GitLab CI': siGitlab,
  Go: siGo,
  Grafana: siGrafana,
  Istio: siIstio,
  Artifactory: siJfrog,
  Kubernetes: siKubernetes,
  Nginx: siNginx,
  Prometheus: siPrometheus,
  Python: siPython,
  Terraform: siTerraform,
  Vault: siVault,
};

const ASTRYX_NEUTRAL_FOREGROUND = '#111827';
const ASTRYX_INVERSE_FOREGROUND = '#ffffff';

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

function brandTokenForeground(hex: string) {
  const backgroundLuminance = relativeLuminance(hex);
  const neutralContrast = contrastRatio(
    relativeLuminance(ASTRYX_NEUTRAL_FOREGROUND.slice(1)),
    backgroundLuminance,
  );
  const inverseContrast = contrastRatio(
    relativeLuminance(ASTRYX_INVERSE_FOREGROUND.slice(1)),
    backgroundLuminance,
  );

  return neutralContrast >= inverseContrast
    ? ASTRYX_NEUTRAL_FOREGROUND
    : ASTRYX_INVERSE_FOREGROUND;
}

function tokenStyle(icon: SimpleIcon | undefined): CSSProperties | undefined {
  if (!icon) {
    return undefined;
  }

  const background = `#${icon.hex}`;

  return {
    '--skill-token-background': background,
    '--skill-token-foreground': brandTokenForeground(icon.hex),
  } as CSSProperties;
}

export function SkillToken({
  label,
  variant = 'purple',
}: SkillTokenProps): JSX.Element {
  const icon = skillIcons[label];
  const tokenColor = icon ? `#${icon.hex}` : undefined;

  return (
    <span
      className={`skill-token skill-token--${variant}`}
      data-has-icon={String(Boolean(icon))}
      data-token-color={tokenColor}
      style={tokenStyle(icon)}
    >
      {icon ? (
        <svg
          aria-hidden="true"
          className="skill-token__icon"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d={icon.path} fill="currentColor" />
        </svg>
      ) : null}
      <span className="skill-token__label">{label}</span>
    </span>
  );
}
