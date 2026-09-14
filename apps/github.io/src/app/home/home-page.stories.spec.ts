import meta, { DoraCapabilityMasonry } from './home-page.stories';

describe('HomePage stories', () => {
  it('uses the Home Page Storybook hierarchy', () => {
    expect(meta.title).toBe('Components/Home/Home Page');
  });

  it('provides a desktop viewport for reviewing the DORA capability masonry', () => {
    expect(DoraCapabilityMasonry.globals?.viewport?.value).toBe('desktop');
  });
});
