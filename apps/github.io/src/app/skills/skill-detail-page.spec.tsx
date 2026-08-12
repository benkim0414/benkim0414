import { render } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { SkillDetailPage } from './skill-detail-page';
import { skills } from './skill-list.data';

describe('SkillDetailPage', () => {
  it('renders the supplied selected skill name as its page heading', () => {
    const terraform = skills.find((skill) => skill.id === 'terraform');

    if (!terraform) {
      throw new Error('Expected the Terraform skill fixture.');
    }

    const { getByRole } = render(
      <Theme theme={neutralTheme}>
        <SkillDetailPage skill={terraform} />
      </Theme>,
    );

    expect(getByRole('heading', { level: 1, name: 'Terraform' })).toBeTruthy();
  });
});
