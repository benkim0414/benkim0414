import meta, {
  Default,
  RepresentativeStates,
} from './devops-roadmap-stepper.stories';

describe('DevOpsRoadmapStepper stories', () => {
  it('places the reusable Stepper in the DevOps Roadmap component group', () => {
    expect(meta.title).toBe('Components/DevOps Roadmap/Stepper');
    expect(Default).toBeDefined();
    expect(RepresentativeStates.args?.items).toHaveLength(3);
  });
});
