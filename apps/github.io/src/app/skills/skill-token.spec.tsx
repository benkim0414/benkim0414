import { render } from '@testing-library/react';
import { Token } from '@astryxdesign/core/Token';

import { SkillToken } from './skill-token';

describe('SkillToken', () => {
  it('renders a mapped Simple Icons skill as a brand-colored token', () => {
    const { container } = render(<SkillToken label="Docker" />);
    const token = container.querySelector('[data-testid="skill-token"]');
    const icon = container.querySelector('svg');

    expect(token).toBeTruthy();
    expect(token?.className).toContain('astryx-token');
    expect(token?.getAttribute('style')).toContain(
      '--skill-token-background: #2496ED',
    );
    expect(token?.getAttribute('style')).toContain(
      '--skill-token-foreground: var(--color-on-light)',
    );
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders a local full-color skill asset as a decorative image', () => {
    const { container } = render(<SkillToken label="AWS CodePipeline" />);

    const image = container.querySelector('img');

    expect(image?.getAttribute('aria-hidden')).toBe('true');
    expect(image?.getAttribute('src')).toMatch(/assets\/.*\.svg/);
    expect(image?.getAttribute('alt')).toBe('');
  });

  it('chooses the neutral foreground for a light brand background', () => {
    const { getByText } = render(<SkillToken label="GitLab CI" />);
    const token = getByText('GitLab CI').closest('[data-testid="skill-token"]');

    expect(token?.getAttribute('style')).toContain(
      '--skill-token-foreground: var(--color-on-light)',
    );
  });

  it('chooses the inverse foreground for a dark brand background', () => {
    const { getByText } = render(<SkillToken label="GitHub" />);
    const token = getByText('GitHub').closest('[data-testid="skill-token"]');

    expect(token?.getAttribute('style')).toContain(
      '--skill-token-foreground: var(--color-on-dark)',
    );
  });

  it.each([
    'eza',
    'fzf',
    'ripgrep',
    'zoxide',
    'delta',
    'LazyGit',
    'SSH',
    'Sealed Secrets',
    'NFS',
  ])(
    'defaults text-only project skill %s to the Astryx gray surface',
    (label) => {
      const { container, getByTestId } = render(
        <>
          <SkillToken label={label} />
          <Token
            color="gray"
            data-testid="gray-reference"
            label="Reference"
            size="sm"
          />
        </>,
      );
      const token = getByTestId('skill-token');

      expect(token.className).toBe(getByTestId('gray-reference').className);
      expect(token.getAttribute('style')).toBeNull();
      expect(
        container.querySelector('[data-testid="skill-token"] svg'),
      ).toBeNull();
      expect(
        container.querySelector('[data-testid="skill-token"] img'),
      ).toBeNull();
    },
  );

  it.each([
    'Amazon S3',
    'Alloy',
    'Codex',
    'gh-dash',
    'Herdr',
    'Loki',
    'MetalLB',
    'mise',
    'kube-vip',
    'Yazi',
  ])(
    'defaults custom-image project skill %s to the Astryx gray surface',
    (label) => {
      const { container, getByTestId } = render(
        <>
          <SkillToken label={label} />
          <Token
            color="gray"
            data-testid="gray-reference"
            label="Reference"
            size="sm"
          />
        </>,
      );
      const token = getByTestId('skill-token');
      const image = container.querySelector('[data-testid="skill-token"] img');

      expect(token.className).toBe(getByTestId('gray-reference').className);
      expect(token.getAttribute('style')).toBeNull();
      expect(image?.getAttribute('aria-hidden')).toBe('true');
      expect(image?.getAttribute('alt')).toBe('');
      expect(image?.getAttribute('src')).toBeTruthy();
    },
  );

  it('uses the Astryx gray surface with only a brand-colored Simple Icon', () => {
    const { container, getByTestId } = render(
      <>
        <SkillToken label="Docker" variant="neutral" />
        <Token
          color="gray"
          data-testid="gray-reference"
          label="Reference"
          size="sm"
        />
      </>,
    );
    const token = getByTestId('skill-token');
    const grayReference = getByTestId('gray-reference');
    const path = container.querySelector('[data-testid="skill-token"] path');

    expect(token.className).toBe(grayReference.className);
    expect(token.getAttribute('style')).toBeNull();
    expect(path?.getAttribute('fill')).toBe('#2496ED');
  });

  it('renders Conventional Commits with its official icon on the neutral surface', () => {
    const { container, getByTestId } = render(
      <>
        <SkillToken label="Conventional Commits" variant="neutral" />
        <Token
          color="gray"
          data-testid="gray-reference"
          label="Reference"
          size="sm"
        />
      </>,
    );
    const token = getByTestId('skill-token');
    const path = container.querySelector('[data-testid="skill-token"] path');

    expect(token.className).toBe(getByTestId('gray-reference').className);
    expect(token.getAttribute('style')).toBeNull();
    expect(path?.getAttribute('fill')).toBe('#FE5196');
  });

  it('keeps a neutral local asset full-color on the gray surface', () => {
    const { container, getByTestId } = render(
      <>
        <SkillToken label="AWS CodePipeline" variant="neutral" />
        <Token
          color="gray"
          data-testid="gray-reference"
          label="Reference"
          size="sm"
        />
      </>,
    );
    const token = getByTestId('skill-token');
    const image = container.querySelector('[data-testid="skill-token"] img');

    expect(token.className).toBe(getByTestId('gray-reference').className);
    expect(token.getAttribute('style')).toBeNull();
    expect(image?.getAttribute('aria-hidden')).toBe('true');
    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('src')).toMatch(/assets\/.*\.svg/);
  });

  it.each(['Forward Proxy', 'IRSA'])(
    'keeps neutral text-only skill %s on the gray surface without an icon',
    (label) => {
      const { container, getByTestId } = render(
        <>
          <SkillToken label={label} variant="neutral" />
          <Token
            color="gray"
            data-testid="gray-reference"
            label="Reference"
            size="sm"
          />
        </>,
      );
      const token = getByTestId('skill-token');

      expect(token.className).toBe(getByTestId('gray-reference').className);
      expect(token.getAttribute('style')).toBeNull();
      expect(
        container.querySelector('[data-testid="skill-token"] svg'),
      ).toBeNull();
      expect(
        container.querySelector('[data-testid="skill-token"] img'),
      ).toBeNull();
    },
  );

  it('honors an explicit brand variant for a neutral-default local asset', () => {
    const { getByTestId } = render(<SkillToken label="Yazi" variant="brand" />);

    expect(getByTestId('skill-token').getAttribute('style')).toContain(
      '--skill-token-background: #FFFFFF',
    );
  });

  it('keeps the visible label as the accessible token text', () => {
    const { getByText } = render(<SkillToken label="GitHub Actions" />);

    expect(getByText('GitHub Actions').textContent).toBe('GitHub Actions');
  });
});
