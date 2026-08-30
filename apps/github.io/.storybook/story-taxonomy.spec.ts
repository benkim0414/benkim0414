import pageMeta, {
  Home,
  NotFound,
  Roadmap,
  SkillDetail,
  Skills,
} from '../src/app/app-routes.stories';
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
import homeGreetingMeta from '../src/app/skills/home-greeting.stories';
import homePageMeta from '../src/app/skills/home-page.stories';
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
      devopsCapabilityEvidenceRadar: 'Components/DevOps Capability Evidence/Radar',
      devopsRoadmap: 'Components/DevOps Roadmap/Timeline',
      doraCapabilityCard: 'Components/DevOps Capability Evidence/DORA Capability Card',
      footer: 'Navigation/Footer',
      globalNavigation: 'Navigation/Global Navigation',
      homeGreeting: 'Components/Skills/Home Greeting',
      homePage: 'Components/Skills/Home Page',
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
});
