import { getSkillBrand } from './skill-brand';

describe('getSkillBrand', () => {
  it('returns brand metadata for mapped skills', () => {
    const brand = getSkillBrand('Kubernetes');

    expect(brand).toMatchObject({
      name: 'Kubernetes',
      color: '#326CE5',
      foreground: '#ffffff',
    });
    expect(brand?.iconPath).toBeTruthy();
    expect(brand?.iconDataUrl).toContain('data:image/svg+xml;utf8,');
    expect(brand?.iconDataUrl).toContain('fill%3D%22%23326CE5%22');
  });

  it('returns undefined for skills without Simple Icons metadata', () => {
    expect(getSkillBrand('Forward Proxy')).toBeUndefined();
  });

  it('chooses neutral text for light brand colors', () => {
    expect(getSkillBrand('Docker')?.foreground).toBe('#111827');
  });

  it('chooses inverse text for dark brand colors', () => {
    expect(getSkillBrand('GitHub')?.foreground).toBe('#ffffff');
  });
});
