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

function readableForeground(hex: string) {
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.62 ? '#111827' : '#ffffff';
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

export function SkillToken({ label, variant = 'purple' }: SkillTokenProps) {
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
