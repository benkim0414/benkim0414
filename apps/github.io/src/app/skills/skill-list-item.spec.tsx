import { render } from '@testing-library/react';
import { HStack } from '@astryxdesign/core/Layout';
import { ListItem } from '@astryxdesign/core/List';

import { sampleSkills } from './skill-list.data';
import { SkillListItem } from './skill-list-item';

describe('SkillListItem', () => {
  it('renders a skill row with avatar, category, and rating', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { container, getByRole, getByText } = render(
      <SkillListItem skill={typeScript!} />,
    );
    const avatar = getByRole('img', { name: 'TypeScript' });
    const content = avatar.firstElementChild as HTMLElement;

    expect(container.querySelector('img')).toBeTruthy();
    expect(avatar.getAttribute('data-size')).toBe('small');
    expect(content.style.getPropertyValue('--x-width')).toBe('36px');
    expect(content.style.getPropertyValue('--x-height')).toBe('36px');
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getByText('4 out of 5')).toBeTruthy();
  });

  it('renders compact rows without category badges', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { getByText, queryByText } = render(
      <SkillListItem skill={typeScript!} variant="compact" />,
    );

    expect(getByText('TypeScript')).toBeTruthy();
    expect(queryByText('Language')).toBeNull();
    expect(getByText('4 out of 5')).toBeTruthy();
  });

  it('uses the Astryx row link contract when href is supplied', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { container, getByRole, getByTestId, getByText, queryByRole } =
      render(
        <>
          <SkillListItem href="/skills/typescript" skill={typeScript!} />
          <ListItem
            data-testid="default-linked-row"
            href="/control"
            label="Control"
          />
          <HStack
            data-testid="padded-link-content"
            gap={2}
            paddingBlock={2}
            paddingInline={2}
            vAlign="center"
            width="100%"
          />
        </>,
      );
    const link = getByRole('link', {
      name: 'TypeScript Language 4 out of 5',
    });
    const row = link.closest('li');
    const linkContent = link.firstElementChild?.firstElementChild;
    const category = getByText('Language');
    const rating = getByText('4 out of 5');

    expect(link.getAttribute('href')).toBe('/skills/typescript');
    expect(row).not.toBeNull();
    expect(link.parentElement).toBe(row);
    expect(row?.className).not.toBe(
      getByTestId('default-linked-row').className,
    );
    expect(linkContent?.className).toBe(
      getByTestId('padded-link-content').className,
    );
    expect(queryByRole('img', { name: 'TypeScript' })).toBeNull();
    expect(
      container.querySelector('[data-size="small"][aria-hidden="true"]'),
    ).toBeTruthy();
    expect(link.contains(category)).toBe(true);
    expect(link.contains(rating)).toBe(true);
    expect(link.querySelectorAll('a, button')).toHaveLength(0);
  });

  it('remains a static Astryx row when href is omitted', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { queryByRole } = render(<SkillListItem skill={typeScript!} />);

    expect(queryByRole('link')).toBeNull();
  });
});
