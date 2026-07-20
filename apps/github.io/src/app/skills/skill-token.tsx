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

function readableForeground(hex: string) {
  const backgroundLuminance = relativeLuminance(hex);
  const darkForeground = '#111827';
  const lightForeground = '#ffffff';

  return contrastRatio(
    relativeLuminance(darkForeground.slice(1)),
    backgroundLuminance,
  ) >=
    contrastRatio(
      relativeLuminance(lightForeground.slice(1)),
      backgroundLuminance,
    )
    ? darkForeground
    : lightForeground;
}

function tokenStyle(icon: SimpleIcon | undefined): CSSProperties | undefined {
  if (!icon) {
    return undefined;
  }

  const background = `#${icon.hex}`;

  return {
    '--skill-token-background': background,
    '--skill-token-foreground': readableForeground(icon.hex),
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
