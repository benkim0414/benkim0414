import { render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { GlobalNavigationFooter } from './global-navigation-footer';

const { appVersionFixture } = vi.hoisted(() => ({
  appVersionFixture: '1.2.3',
}));

vi.mock('./release-version', () => ({
  appVersion: appVersionFixture,
}));

function renderFooter() {
  return render(
    <Theme theme={neutralTheme}>
      <GlobalNavigationFooter />
    </Theme>,
  );
}

describe('GlobalNavigationFooter', () => {
  it('places the semantic app version before the attribution', () => {
    const { getByRole, getByText } = renderFooter();
    const footer = getByRole('contentinfo');
    const version = getByText(`v${appVersionFixture}`);
    const attribution = getByText('Built with');

    expect(version.tagName).toBe('CODE');
    expect(footer.firstElementChild?.contains(version)).toBe(true);
    expect(footer.lastElementChild?.contains(attribution)).toBe(true);
    expect(version.compareDocumentPosition(attribution)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(version.closest('.astryx-text')?.getAttribute('data-type')).toBe(
      'supporting',
    );
    expect(version.className).toContain('inherit');
  });

  it('separates the attribution with the Astryx Divider component', () => {
    const { getByRole } = renderFooter();
    const divider = getByRole('separator');
    const footer = getByRole('contentinfo');

    expect(divider.className).toContain('astryx-divider');
    expect(divider.getAttribute('aria-orientation')).toBe('horizontal');
    expect(divider.compareDocumentPosition(footer)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('renders the Astryx logo and external GitHub attribution link', () => {
    const { container, getByRole } = renderFooter();
    const footer = getByRole('contentinfo');
    const astryxLink = within(footer).getByRole('link', {
      name: /astryx/i,
    });
    const profileLink = within(footer).getByRole('link', {
      name: /@benkim0414/i,
    });

    expect(
      within(astryxLink).getByRole('img', { name: 'Astryx' }),
    ).toBeTruthy();
    expect(astryxLink.getAttribute('href')).toBe('https://astryx.atmeta.com');
    expect(astryxLink.getAttribute('target')).toBe('_blank');
    expect(astryxLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(footer.textContent).toContain('Built with');
    expect(footer.textContent).toContain('by');
    expect(footer.textContent).toContain('@benkim0414');
    expect(footer.textContent).not.toContain('Astryx');
    expect(profileLink.getAttribute('href')).toBe(
      'https://github.com/benkim0414',
    );
    expect(profileLink.getAttribute('target')).toBe('_blank');
    expect(profileLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(container.querySelectorAll('footer')).toHaveLength(1);
  });

  it('renders the React logo link before the Astryx attribution', () => {
    const { getByRole } = renderFooter();
    const footer = getByRole('contentinfo');
    const reactLink = within(footer).getByRole('link', { name: /react/i });
    const astryxLink = within(footer).getByRole('link', { name: /astryx/i });

    expect(
      within(reactLink).getByRole('img', { name: 'React' }),
    ).toBeTruthy();
    expect(reactLink.getAttribute('href')).toBe('https://react.dev');
    expect(reactLink.getAttribute('target')).toBe('_blank');
    expect(reactLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(footer.textContent).toContain('and');
    expect(reactLink.compareDocumentPosition(astryxLink)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    const logo = within(reactLink).getByRole('img', { name: 'React' });

    if (!(logo instanceof SVGElement)) {
      throw new Error('Expected a React logo SVG element.');
    }

    expect(getComputedStyle(logo).color).toBe('rgb(97, 218, 251)');
    expect(logo.style.transform).toBe('scale(1.1)');
  });

  it('matches the profile link typography to the footer copy', () => {
    const { getByText } = renderFooter();
    const builtWith = getByText('Built with').closest('.astryx-text');
    const by = getByText('by').closest('.astryx-text');
    const profile = getByText('@benkim0414').closest('.astryx-text');

    expect(builtWith?.getAttribute('data-type')).toBe('supporting');
    expect(by?.getAttribute('data-type')).toBe('supporting');
    expect(profile?.getAttribute('data-type')).toBe('supporting');

    if (
      !(builtWith instanceof HTMLElement) ||
      !(profile instanceof HTMLElement)
    ) {
      throw new Error('Expected Astryx Text elements for footer typography.');
    }

    const copyStyle = getComputedStyle(builtWith);
    const linkStyle = getComputedStyle(profile);

    expect(linkStyle.fontSize).toBe(copyStyle.fontSize);
    expect(linkStyle.lineHeight).toBe(copyStyle.lineHeight);
    expect(linkStyle.fontWeight).toBe(copyStyle.fontWeight);
  });

  it('uses the official Astryx logo color for the logo mark', () => {
    const { getByRole } = renderFooter();
    const logo = getByRole('img', { name: 'Astryx' });

    if (!(logo instanceof SVGElement)) {
      throw new Error('Expected an Astryx logo SVG element.');
    }

    expect(getComputedStyle(logo).color).toBe('rgb(34, 91, 255)');
  });
});
