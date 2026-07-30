import { render } from '@testing-library/react';

import {
  getSkillCategoryVariant,
  SkillCategory,
  skillCategoryBadgeVariants,
} from './skill-category';
import { skillCategories } from './skill-list.types';

describe('SkillCategory', () => {
  it('renders the category name as a badge', () => {
    const { getByText } = render(<SkillCategory name="Cloud" />);

    expect(getByText('Cloud')).toBeTruthy();
  });

  it('passes the generated variant to the Astryx badge', () => {
    const { container } = render(<SkillCategory name="Cloud" />);
    const badge = container.querySelector('.astryx-badge');

    expect(badge?.className).toContain(getSkillCategoryVariant('Cloud'));
  });

  it('maps the same category name to the same variant', () => {
    expect(getSkillCategoryVariant('Cloud')).toBe(
      getSkillCategoryVariant('Cloud'),
    );
  });

  it('normalizes category names before mapping them to variants', () => {
    expect(getSkillCategoryVariant(' Cloud ')).toBe(
      getSkillCategoryVariant('cloud'),
    );
  });

  it('maps every production category to an approved Astryx badge variant', () => {
    const allowedVariants = new Set(skillCategoryBadgeVariants);

    for (const category of skillCategories) {
      expect(allowedVariants.has(getSkillCategoryVariant(category))).toBe(true);
    }
  });
});
