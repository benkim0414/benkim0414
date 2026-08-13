import { LinkProvider } from '@astryxdesign/core/Link';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { RouterLink } from '../src/app/router-link';
import { SkillCard } from '../src/app/skills/skill-card';
import { skills } from '../src/app/skills/skill-list.data';
import { StoryRoutes } from './story-routes';

describe('StoryRoutes', () => {
  it('renders a skill detail page after a story navigates to its route', async () => {
    const skill = skills.find(({ id }) => id === 'kubernetes');

    if (!skill) {
      throw new Error('Expected the Kubernetes fixture to exist.');
    }

    render(
      createElement(
        MemoryRouter,
        undefined,
        createElement(
          LinkProvider,
          { component: RouterLink },
          createElement(
            StoryRoutes,
            undefined,
            createElement(SkillCard, { skill }),
          ),
        ),
      ),
    );

    fireEvent.click(screen.getByRole('link', { name: 'Kubernetes' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Kubernetes' }),
    ).toBeTruthy();
  });
});
