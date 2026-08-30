import pageMeta, {
  Home,
  NotFound,
  Roadmap,
  SkillDetail,
  Skills,
} from '../src/app/app-routes.stories';

describe('route-page story taxonomy', () => {
  it('declares the canonical Pages routes', () => {
    expect(pageMeta.title).toBe('Pages');
    expect(Home.parameters?.appRoute).toBe('/');
    expect(Skills.parameters?.appRoute).toBe('/skills');
    expect(SkillDetail.parameters?.appRoute).toBe('/skills/kubernetes');
    expect(Roadmap.parameters?.appRoute).toBe('/roadmap');
    expect(NotFound.parameters?.appRoute).toBe('/missing');
  });
});
