import pageMeta, {
  Home,
  NotFound,
  Roadmap,
  SkillDetail,
  Skills,
} from '../src/app/app-routes.stories';
import countBadgeMeta from '../src/app/count-badge.stories';
import certificationCitationMeta from '../src/app/certifications/certification-citation.stories';
import capabilityEvidenceMeta from '../src/app/devops-capability-evidence/capability-evidence.stories';
import devopsCapabilityEvidenceRadarMeta from '../src/app/devops-capability-evidence/devops-capability-evidence-radar.stories';
import doraCapabilityCardMeta from '../src/app/devops-capability-evidence/dora-capability-card.stories';
import devopsRoadmapMeta from '../src/app/devops-roadmap/devops-roadmap.stories';
import roadmapPageMeta from '../src/app/devops-roadmap/roadmap-page.stories';
import globalNavigationFooterMeta from '../src/app/global-navigation-footer.stories';
import globalNavigationLayoutMeta from '../src/app/global-navigation-layout.stories';
import notFoundPageMeta from '../src/app/not-found-page.stories';
import projectCardMeta from '../src/app/projects/project-card.stories';
import homeGreetingMeta from '../src/app/home/home-greeting.stories';
import homePageMeta from '../src/app/home/home-page.stories';
import skillAvatarMeta from '../src/app/skills/skill-avatar.stories';
import skillCardMeta from '../src/app/skills/skill-card.stories';
import skillCarouselMeta from '../src/app/skills/skill-carousel.stories';
import skillCategoryMeta from '../src/app/skills/skill-category.stories';
import skillConfidenceMeta from '../src/app/skills/skill-confidence.stories';
import skillDetailPageMeta from '../src/app/skills/skill-detail-page.stories';
import skillExperienceCardListMeta from '../src/app/skills/skill-experience-card-list.stories';
import skillExperienceCardMeta from '../src/app/skills/skill-experience-card.stories';
import skillListItemMeta from '../src/app/skills/skill-list-item.stories';
import skillListMeta from '../src/app/skills/skill-list.stories';
import skillSearchMeta from '../src/app/skills/skill-search.stories';
import skillSectionMeta from '../src/app/skills/skill-section.stories';
import skillsPageMeta from '../src/app/skills/skills-page.stories';
import skillTokenMeta from '../src/app/skills/skill-token.stories';
import { sortStoriesV7 } from 'storybook/preview-api';

import preview from './preview';

describe('route-page story taxonomy', () => {
  it('declares the canonical Pages routes', () => {
    expect(pageMeta.title).toBe('Pages');
    expect(Home.parameters?.appRoute).toBe('/');
    expect(Skills.parameters?.appRoute).toBe('/skills');
    expect(SkillDetail.parameters?.appRoute).toBe('/skills/kubernetes');
    expect(Roadmap.parameters?.appRoute).toBe('/roadmap');
    expect(NotFound.parameters?.appRoute).toBe('/missing');
  });

  it('organizes colocated stories by navigation or component domain', () => {
    expect({
      capabilityEvidence: capabilityEvidenceMeta.title,
      certificationCitation: certificationCitationMeta.title,
      countBadge: countBadgeMeta.title,
      devopsCapabilityEvidenceRadar: devopsCapabilityEvidenceRadarMeta.title,
      devopsRoadmap: devopsRoadmapMeta.title,
      doraCapabilityCard: doraCapabilityCardMeta.title,
      footer: globalNavigationFooterMeta.title,
      globalNavigation: globalNavigationLayoutMeta.title,
      homeGreeting: homeGreetingMeta.title,
      homePage: homePageMeta.title,
      notFoundPage: notFoundPageMeta.title,
      projectCard: projectCardMeta.title,
      roadmapPage: roadmapPageMeta.title,
      skillAvatar: skillAvatarMeta.title,
      skillCard: skillCardMeta.title,
      skillCarousel: skillCarouselMeta.title,
      skillCategory: skillCategoryMeta.title,
      skillConfidence: skillConfidenceMeta.title,
      skillDetailPage: skillDetailPageMeta.title,
      skillExperienceCard: skillExperienceCardMeta.title,
      skillExperienceCardList: skillExperienceCardListMeta.title,
      skillList: skillListMeta.title,
      skillListItem: skillListItemMeta.title,
      skillSearch: skillSearchMeta.title,
      skillSection: skillSectionMeta.title,
      skillsPage: skillsPageMeta.title,
      skillToken: skillTokenMeta.title,
    }).toEqual({
      capabilityEvidence: 'Components/DevOps Capability Evidence/Capability Evidence',
      certificationCitation: 'Components/Certifications/Certification Citation',
      countBadge: 'Components/Count Badge',
      devopsCapabilityEvidenceRadar: 'Components/DevOps Capability Evidence/Radar',
      devopsRoadmap: 'Components/DevOps Roadmap/Timeline',
      doraCapabilityCard: 'Components/DevOps Capability Evidence/DORA Capability Card',
      footer: 'Navigation/Footer',
      globalNavigation: 'Navigation/Global Navigation',
      homeGreeting: 'Components/Home/Home Greeting',
      homePage: 'Components/Home/Home Page',
      notFoundPage: 'Components/Pages/Not Found Page',
      projectCard: 'Components/Projects/Project Card',
      roadmapPage: 'Components/DevOps Roadmap/Roadmap Page',
      skillAvatar: 'Components/Skills/Skill Avatar',
      skillCard: 'Components/Skills/Skill Card',
      skillCarousel: 'Components/Skills/Skill Carousel',
      skillCategory: 'Components/Skills/Skill Category',
      skillConfidence: 'Components/Skills/Skill Confidence',
      skillDetailPage: 'Components/Skills/Skill Detail Page',
      skillExperienceCard: 'Components/Skills/Skill Experience Card',
      skillExperienceCardList: 'Components/Skills/Skill Experience Card List',
      skillList: 'Components/Skills/Skill List',
      skillListItem: 'Components/Skills/Skill List Item',
      skillSearch: 'Components/Skills/Skill Search',
      skillSection: 'Components/Skills/Skill Section',
      skillsPage: 'Components/Skills/Skills Page',
      skillToken: 'Components/Skills/Skill Token',
    });
  });

  it('sorts root groups and nested stories for the review journey', () => {
    const storySort = preview.parameters?.options?.storySort;
    const stories = [
      {
        id: 'components-skills-skill-list--empty',
        importPath: './skill-list.stories.tsx',
        name: 'Empty',
        title: 'Components/Skills/Skill List',
      },
      {
        id: 'navigation-global-navigation--default',
        importPath: './global-navigation-layout.stories.tsx',
        name: 'Default',
        title: 'Navigation/Global Navigation',
      },
      {
        id: 'pages--skills',
        importPath: './app-routes.stories.tsx',
        name: 'Skills',
        title: 'Pages',
      },
      {
        id: 'components-certifications-certification-citation--default',
        importPath: './certification-citation.stories.tsx',
        name: 'Default',
        title: 'Components/Certifications/Certification Citation',
      },
      {
        id: 'pages--roadmap',
        importPath: './app-routes.stories.tsx',
        name: 'Roadmap',
        title: 'Pages',
      },
      {
        id: 'navigation-footer--default',
        importPath: './global-navigation-footer.stories.tsx',
        name: 'Default',
        title: 'Navigation/Footer',
      },
      {
        id: 'pages--not-found',
        importPath: './app-routes.stories.tsx',
        name: 'Not Found',
        title: 'Pages',
      },
      {
        id: 'components-skills-skill-list--default',
        importPath: './skill-list.stories.tsx',
        name: 'Default',
        title: 'Components/Skills/Skill List',
      },
      {
        id: 'pages--skill-detail',
        importPath: './app-routes.stories.tsx',
        name: 'Skill Detail',
        title: 'Pages',
      },
      {
        id: 'components-skills-skill-card--default',
        importPath: './skill-card.stories.tsx',
        name: 'Default',
        title: 'Components/Skills/Skill Card',
      },
      {
        id: 'pages--home',
        importPath: './app-routes.stories.tsx',
        name: 'Home',
        title: 'Pages',
      },
    ] as Parameters<typeof sortStoriesV7>[0];

    const sortedTitles = sortStoriesV7(
      stories,
      storySort as Parameters<typeof sortStoriesV7>[1],
      [],
    ).map(({ name, title }) => `${title}/${name}`);

    expect(sortedTitles).toEqual([
      'Pages/Home',
      'Pages/Not Found',
      'Pages/Roadmap',
      'Pages/Skill Detail',
      'Pages/Skills',
      'Navigation/Footer/Default',
      'Navigation/Global Navigation/Default',
      'Components/Certifications/Certification Citation/Default',
      'Components/Skills/Skill Card/Default',
      'Components/Skills/Skill List/Default',
      'Components/Skills/Skill List/Empty',
    ]);
  });
});
