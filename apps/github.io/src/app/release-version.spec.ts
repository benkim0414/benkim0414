async function loadAppVersion({
  release,
  version,
}: {
  release: boolean;
  version: string;
}) {
  vi.stubGlobal('__APP_RELEASE__', release);
  vi.stubGlobal('__APP_VERSION__', version);

  return import('./release-version');
}

describe('appVersion', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the supplied version for a release build', async () => {
    const { appVersion } = await loadAppVersion({
      release: true,
      version: '1.2.3',
    });

    expect(appVersion).toBe('1.2.3');
  });

  it('uses dev outside a release build', async () => {
    const { appVersion } = await loadAppVersion({
      release: false,
      version: '9.8.7',
    });

    expect(appVersion).toBe('dev');
  });

  it('uses dev when compile-time constants are unavailable', async () => {
    const { appVersion } = await import('./release-version');

    expect(appVersion).toBe('dev');
  });
});
