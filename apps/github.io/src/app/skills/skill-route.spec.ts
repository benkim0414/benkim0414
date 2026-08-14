import { getSkillDetailPath } from './skill-route';

describe('getSkillDetailPath', () => {
  it('builds the canonical skill detail path', () => {
    expect(getSkillDetailPath('kubernetes')).toBe('/skills/kubernetes');
  });

  it('encodes a supplied route segment', () => {
    expect(getSkillDetailPath('c sharp')).toBe('/skills/c%20sharp');
  });
});
