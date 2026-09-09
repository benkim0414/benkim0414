import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { bootstrapRelease } from './github-io-release.mjs';

const cwd = fileURLToPath(new URL('..', import.meta.url));

// Reviewed at cd711dfb362778f168afd29692704d7330d41b7a, including every
// contributing subject/body and the first-parent integration boundaries.
// There are 306 qualifying integrations: 142 minor and 164 patch. The final
// minor resets earlier patches, and one patch follows it: 0.142.1.
// Repeated subjects with different SHAs are distinct commits introduced by
// historical merges; eligibility does not deduplicate by subject or patch ID.
// This pre-handoff HEAD lock must be reviewed again if qualifying history changes.
const reviewedCommits = [
  {
    sha: '8acdd8115c463aa082abe65d4fbd49c3a19ba769',
    subject: 'feat(github.io): scaffold react app',
    bump: 'minor',
  },
  {
    sha: '191805886439afda23128149ffbb5465616b7d3d',
    subject: 'feat(github.io): add astryx foundation',
    bump: 'minor',
  },
  {
    sha: '9522a3ad57e3bded36cb94f8349c9c57eb84f597',
    subject: 'fix(github.io): align astryx react peers',
    bump: 'patch',
  },
  {
    sha: 'a58b36112fe563490962248656ceaa4b0214d571',
    subject: 'feat(github.io): add generic app shell',
    bump: 'minor',
  },
  {
    sha: 'caa536282868866f923aa832c4a8716e89e5479e',
    subject: 'fix(github.io): resolve final review findings',
    bump: 'patch',
  },
  {
    sha: '0835b268a65c7cc29773c195667eca7e875dd3b9',
    subject: 'feat(github.io): add app shell stories',
    bump: 'minor',
  },
  {
    sha: 'abbee66bfdaf6d3fb13157cf1e418c4f500f9134',
    subject: 'fix(github.io): apply storybook theme context',
    bump: 'patch',
  },
  {
    sha: '9ef5eec54f6b00cc4eb5c969bf48aa9eceb1f928',
    subject: 'fix(github.io): include astryx css in storybook',
    bump: 'patch',
  },
  {
    sha: 'b3ed9d1641421a3921ba03b68394e2be1cc63f2e',
    subject: 'fix(github.io): clean storybook config',
    bump: 'patch',
  },
  {
    sha: 'e6adca39d56f7183fc6d3510e28f051b64c30a3c',
    subject: 'feat(github.io): add skill rating model',
    bump: 'minor',
  },
  {
    sha: '21ae95fe45dad48c069bba1473696961e2ac5c7c',
    subject: 'feat(github.io): add searchable skill list',
    bump: 'minor',
  },
  {
    sha: 'f82698f99ed8b24a901977cafb53d7547bf3d6a6',
    subject: 'fix(github.io): use power search for skills',
    bump: 'patch',
  },
  {
    sha: '60a0b5fce83f9fd21df5fc1550f40145332a52e2',
    subject: 'feat(github.io): add skill list stories',
    bump: 'minor',
  },
  {
    sha: '1d75b1e95d4d953678d948028c8de282732e2d00',
    subject: 'fix(github.io): address skill list review findings',
    bump: 'patch',
  },
  {
    sha: '0b6d6ef7b785007cd3431e0114b00a1bba774919',
    subject: 'fix(github.io): expose skill rating text',
    bump: 'patch',
  },
  {
    sha: '870051a499e0d08fd3162c18f5e8bd7349a25c8a',
    subject: 'feat(github.io): add skill component stories',
    bump: 'minor',
  },
  {
    sha: '298fae103e0425ccf105988866a722611d814201',
    subject: 'fix(github.io): prevent skill avatar crop',
    bump: 'patch',
  },
  {
    sha: '8fddb1d14b17c7704058c14c499bffdc5c276857',
    subject: 'fix(github.io): use official skill icons',
    bump: 'patch',
  },
  {
    sha: '8fa321ad132924c27d62cab8ec17b1fe52a47f82',
    subject: 'fix(github.io): use default avatar logo fit',
    bump: 'patch',
  },
  {
    sha: '9e69807c52f11d1dbdd17d1cb3be8535ed88b566',
    subject: 'fix(github.io): fallback missing skill icons',
    bump: 'patch',
  },
  {
    sha: 'd918f205d124b6079f7109a641d88edd66fcba90',
    subject: 'fix(github.io): harden skill item label layout',
    bump: 'patch',
  },
  {
    sha: '8241bf4d6ba86b3e917cc323e1adac155058bb75',
    subject: 'feat(github.io): support hidden skill list headings',
    bump: 'minor',
  },
  {
    sha: 'ccac6174b05f78acc70a889a62b98178b05ccc9d',
    subject: 'feat(github.io): render skills main page',
    bump: 'minor',
  },
  {
    sha: 'e15f00385c48be105a4f02863e0bb854e8ff6a54',
    subject: 'fix(github.io): render hidden headings as headings',
    bump: 'patch',
  },
  {
    sha: '49656a29b123c871bbd7d720abddfa9a0c8c8a74',
    subject: 'fix(github.io): compact skill ratings on mobile',
    bump: 'patch',
  },
  {
    sha: 'a59696681bc484454fa9ece2d4afc9c17b82e832',
    subject: 'fix(github.io): align skills page with astryx guidance',
    bump: 'patch',
  },
  {
    sha: '5704d883ac01e9310127c49036f658ff6d19d6bf',
    subject: 'feat(github.io): add devops roadmap data',
    bump: 'minor',
  },
  {
    sha: 'b73ab256d894bf6abfbc5ccf8a559f2a6b13f4fc',
    subject: 'feat(github.io): render devops roadmap nodes',
    bump: 'minor',
  },
  {
    sha: '1d54a8c2dcecbbba475f4375371d7cbc666fcc0c',
    subject: 'feat(github.io): render devops roadmap timeline',
    bump: 'minor',
  },
  {
    sha: 'aaec691acb6092b469ac6f191a48e7801c800978',
    subject: 'fix(github.io): anchor devops roadmap edges',
    bump: 'patch',
  },
  {
    sha: 'f40dadf782ec3242511dc64140f3719af5e57e91',
    subject: 'feat(github.io): add devops roadmap stories',
    bump: 'minor',
  },
  {
    sha: '1ffc6fca5fc3751735aa6e86017895ad73b0916b',
    subject: 'fix(github.io): stabilize roadmap flow rendering',
    bump: 'patch',
  },
  {
    sha: '1f0b59a75323a6649825f7499166c4ef18e9bb29',
    subject: 'fix(github.io): disable roadmap keyboard editing',
    bump: 'patch',
  },
  {
    sha: 'c68a2191974409910e20eadbeae415f88158539d',
    subject: 'feat(github.io): support reversed roadmap order',
    bump: 'minor',
  },
  {
    sha: '3bf1f45c40157ec5f7ad1047e11e400a93e3bb92',
    subject: 'fix(github.io): render roadmap diagram only',
    bump: 'patch',
  },
  {
    sha: '64b6f7916ef736553cdbda7b0fe7cd92759bf290',
    subject: 'fix(github.io): address roadmap review findings',
    bump: 'patch',
  },
  {
    sha: 'e2a76a82c0a0abecd50a414727f4a2844d4266d6',
    subject: 'fix(github.io): size roadmap rows by content',
    bump: 'patch',
  },
  {
    sha: 'e47619e88afbd33393c7cbfe45d40a872a3f97d7',
    subject: 'feat(github.io): add reusable skill token',
    bump: 'minor',
  },
  {
    sha: 'eff3f12d23f27fa67ffd5694d4f5ccc9626871e1',
    subject: 'fix(github.io): improve skill token contrast',
    bump: 'patch',
  },
  {
    sha: '9c7a6d3e84888de51dccd327ec9a25e38b689bb7',
    subject: 'feat(github.io): use skill tokens in roadmap',
    bump: 'minor',
  },
  {
    sha: '45e9ae88e13592d1b965f388e9518f9b6aa20bf1',
    subject: 'feat(github.io): add certification citations',
    bump: 'minor',
  },
  {
    sha: '705b582bf098680419107bff435b2b2f96b2f9ee',
    subject: 'feat(github.io): show roadmap certifications',
    bump: 'minor',
  },
  {
    sha: 'f1dcf7284ab357c09b9a2946bccc7b9124158e19',
    subject: 'fix(github.io): preserve default certification fallback',
    bump: 'patch',
  },
  {
    sha: 'b3a05307a209c14bdf32e6976ee662ad8f9032cb',
    subject: 'fix(github.io): align certification citation icons',
    bump: 'patch',
  },
  {
    sha: 'b00e892cfb3f2ded5b11744c689ca1278a4185a5',
    subject: 'fix(github.io): use default expired citation colors',
    bump: 'patch',
  },
  {
    sha: 'c0c5e354575279fef2523fbf5672cb57783e169d',
    subject: 'fix(github.io): show expired certification icons',
    bump: 'patch',
  },
  {
    sha: 'c63054f32e0ff4640440a8f90404dbe712ec1269',
    subject: 'fix(github.io): use citation text color for expired icons',
    bump: 'patch',
  },
  {
    sha: '58c30ddcf293e75e30dfbbb72ae8630033001d96',
    subject: 'fix(github.io): remove expired icon white surface',
    bump: 'patch',
  },
  {
    sha: 'a11dadb4864a14399cb0fe6c6f245ae1e75b7d58',
    subject: 'fix(github.io): keep certification citation text default',
    bump: 'patch',
  },
  {
    sha: '485c3edfc28bcde7dea558e4078b80a0e93dad61',
    subject: 'fix(github.io): pin certification citation title color',
    bump: 'patch',
  },
  {
    sha: '453f1d7adf73e12b662369f5d2b8c93e11741669',
    subject: 'fix(github.io): support color-only certification brands',
    bump: 'patch',
  },
  {
    sha: 'b99a0aa13b2d115ecbc621ac436c1fe166042333',
    subject: 'fix(github.io): restore citation border line',
    bump: 'patch',
  },
  {
    sha: '47cdedba90d31a3c4f91965ca876fecabbe2f28c',
    subject: 'fix(github.io): keep citation border neutral',
    bump: 'patch',
  },
  {
    sha: '77b09fd4ef28cc36cd7aac8c10f26f677d6c5b61',
    subject: 'fix(github.io): render citation chip with astryx defaults',
    bump: 'patch',
  },
  {
    sha: '61217afd806533bfc7c560a21b3b7bb46e68de39',
    subject: 'fix(github.io): align citation icon spacing with astryx',
    bump: 'patch',
  },
  {
    sha: 'bc768f75ae1202eebb602a1cb11783808240e611',
    subject: 'fix(github.io): align skill row spacing with astryx',
    bump: 'patch',
  },
  {
    sha: '3a78bfe8adfa3506f3c8ab7ee75924f987c1ba63',
    subject: 'fix(github.io): use astryx skill primitives',
    bump: 'patch',
  },
  {
    sha: '2d91f8a1600639e07c8678f1b7d5dde737da66a8',
    subject: 'fix(github.io): tighten skill search layout',
    bump: 'patch',
  },
  {
    sha: '445d5c19f2d9015f889f720d966af17a8f3add61',
    subject: 'fix(github.io): align styling overrides with astryx',
    bump: 'patch',
  },
  {
    sha: '4fa1d912ae9eeb37c301a0bca0f036e7e3f24ecb',
    subject: 'fix(github.io): resolve astryx styling review',
    bump: 'patch',
  },
  {
    sha: 'fdf6ea7d61a623fb060c419f62c437b8aba52951',
    subject: 'feat(github.io): add devops capability radar data',
    bump: 'minor',
  },
  {
    sha: '69d4b8beb4ad82c8cfa46430553c429b65eaa414',
    subject: 'feat(github.io): add devops capability radar',
    bump: 'minor',
  },
  {
    sha: '468c854a0a6ba705342065d685b130ecd8ca050b',
    subject: 'fix(github.io): prevent hidden radar keyboard focus',
    bump: 'patch',
  },
  {
    sha: 'f46a7eac214dd28f1f60fc3445bb68f40cb892c8',
    subject: 'fix(github.io): render radar chart only',
    bump: 'patch',
  },
  {
    sha: 'c6d8a4415a0842048a55a31b1faa254ce84d2fd0',
    subject: 'fix(github.io): size standalone radar story',
    bump: 'patch',
  },
  {
    sha: '0880232e84b1dd9136a40aab364c4922d45c66ad',
    subject: 'fix(github.io): align radar scale and contrast',
    bump: 'patch',
  },
  {
    sha: 'f616906c93f323d0918a155afb96d87f8b34ee0b',
    subject: 'fix(github.io): improve radar label contrast',
    bump: 'patch',
  },
  {
    sha: 'ede86fc0569ab6b18d735d703d39ab540cd4709f',
    subject: 'fix(github.io): allow storybook network host',
    bump: 'patch',
  },
  {
    sha: 'ba18e7ee2c94a2c62613f57250dc9f63607d19bf',
    subject: 'fix(github.io): improve radar tooltip contrast',
    bump: 'patch',
  },
  {
    sha: '4a81089d108973c1c82bff8f05d2f25c4905a279',
    subject: 'fix(github.io): use skill token radar colors',
    bump: 'patch',
  },
  {
    sha: '1742dce0d3ef6dedae9f5152fdb3c78756469856',
    subject: 'fix(github.io): pass app verification checks',
    bump: 'patch',
  },
  {
    sha: 'a18b0e3e084e3c2f6b5b5738a6b956d23f803bac',
    subject: 'fix(github.io): use neutral expired citation icons',
    bump: 'patch',
  },
  {
    sha: '07ced2fdb6e3abb36ffd3824f8bcbcfd184d2ed3',
    subject: 'fix(github.io): restore roadmap node width',
    bump: 'patch',
  },
  {
    sha: '53df72fac425a8db392573a9ae2ecff20b69a118',
    subject: 'fix(github.io): narrow citation icon brand',
    bump: 'patch',
  },
  {
    sha: '29679d9c35a6b11f91e557bc52e7d1f5aeffe980',
    subject: 'fix(github.io): align roadmap flow node width',
    bump: 'patch',
  },
  {
    sha: '1bf1882f298d20d752971236e5159d4691b493b0',
    subject: 'fix(github.io): measure roadmap node spacing',
    bump: 'patch',
  },
  {
    sha: '69a1a7a98260675cd4ea64ca82762953c9d50e82',
    subject: 'fix(github.io): remove roadmap fit padding',
    bump: 'patch',
  },
  {
    sha: 'd4c732f0dc08d10cd15c39c866e143711622cd86',
    subject: 'fix(github.io): render roadmap at native scale',
    bump: 'patch',
  },
  {
    sha: '1cc39c434b082212960da4aa3ebcec9757f6c364',
    subject: 'fix(github.io): narrow storybook fs allowlist',
    bump: 'patch',
  },
  {
    sha: 'c51acaa2cb1ca9057aacbef8ffb49f6806eb88b8',
    subject: 'feat(github.io): add capability evidence model',
    bump: 'minor',
  },
  {
    sha: '2b293806f652aacfa6ea23a442e4d0977419e3e1',
    subject: 'feat(github.io): derive capability evidence scores',
    bump: 'minor',
  },
  {
    sha: 'd54b1d5d8091f9b3b24e5bddee919862d494395c',
    subject: 'fix(github.io): exclude sensitive capability evidence',
    bump: 'patch',
  },
  {
    sha: 'd03d25b63bbec6620719d5b5f4d2da9d556852e6',
    subject: 'fix(github.io): validate public skill evidence support',
    bump: 'patch',
  },
  {
    sha: 'e323d7b38d0ff65ac4fbc8bc98a553a90bab1264',
    subject: 'feat(github.io): add evidence-backed capability radar',
    bump: 'minor',
  },
  {
    sha: '98c4726809f823302f8e934e72674c06c8a30db8',
    subject: 'feat(github.io): add capability evidence bar list',
    bump: 'minor',
  },
  {
    sha: '3095ed2573754e0fb9659893badf799a70f41a81',
    subject: 'fix(github.io): secure capability bar evidence rendering',
    bump: 'patch',
  },
  {
    sha: 'c5c067eb1ec49b44abe78d24f61a306f198ceb3f',
    subject: 'feat(github.io): add capability evidence matrix',
    bump: 'minor',
  },
  {
    sha: 'b0915072c15910c4edd81de7f85567de377aa4c3',
    subject: 'feat(github.io): add evidence type distribution',
    bump: 'minor',
  },
  {
    sha: '328e06286149ee06e59c2d6e87cf244450c00631',
    subject: 'feat(github.io): add capability evidence timeline',
    bump: 'minor',
  },
  {
    sha: '89df9d4826b4663d4ba0d9d84f3fb785e84ae3a5',
    subject: 'feat(github.io): add certification capability map',
    bump: 'minor',
  },
  {
    sha: '6b4500f870d7a13cf06beb1b744b6b511d4e9bfa',
    subject: 'fix(github.io): harden DevOps evidence visualizations',
    bump: 'patch',
  },
  {
    sha: 'd98371dffc2b01f60979042723cc56a8148d5903',
    subject: 'feat(github.io): expand skill model for citations',
    bump: 'minor',
  },
  {
    sha: 'bbbc1fa2b168e45fd8a115ff165f885cdb67dabd',
    subject: 'feat(github.io): add skill card',
    bump: 'minor',
  },
  {
    sha: '1f73af37f30cc68b0123cd312ab5e24396c7cecf',
    subject: 'feat(github.io): add skill carousel',
    bump: 'minor',
  },
  {
    sha: '01ac72b6b09e4b3a46bf3f6253d4148c0a9d696a',
    subject: 'fix(github.io): stub resize observer in carousel spec',
    bump: 'patch',
  },
  {
    sha: '38744e323a502fe73d4b302d651ddc7be9685aac',
    subject: 'fix(github.io): make skill card labels instance-safe',
    bump: 'patch',
  },
  {
    sha: '7f0b42309e821673d055eedb663cb517185e399a',
    subject: 'fix(github.io): let skill cards use default height',
    bump: 'patch',
  },
  {
    sha: '27e429b0fd622534fa274443f012333eec9e87eb',
    subject: 'fix(github.io): equalize skill carousel card height',
    bump: 'patch',
  },
  {
    sha: 'e7f13a9677cb1edeb4859a46d9363a684a1c4dfa',
    subject: 'fix(github.io): stretch skill carousel cards naturally',
    bump: 'patch',
  },
  {
    sha: '7b7866a0e66b4abc9b5fd05c32516b778df6f33f',
    subject: 'fix(github.io): harden skill carousel reuse',
    bump: 'patch',
  },
  {
    sha: 'f6643d877cb4154a0aa8ea032fc50e5c82240fe7',
    subject: 'feat(github.io): add capability evidence helpers',
    bump: 'minor',
  },
  {
    sha: 'c24c513acbb35c4caa8dd913823d676099f115c0',
    subject: 'feat(github.io): add compact capability evidence',
    bump: 'minor',
  },
  {
    sha: '46be5a6f0a038b4e4b2433d96b0249ae24cc3f5a',
    subject: 'fix(github.io): label compact evidence tokens accessibly',
    bump: 'patch',
  },
  {
    sha: '6f3115eeea3f5c16a26c3783a3733a2becdc2108',
    subject: 'fix(github.io): complete compact evidence icon behavior',
    bump: 'patch',
  },
  {
    sha: '5bffffb9272da20792732698bcbf1b951578115f',
    subject: 'fix(github.io): distinguish evidence type icons',
    bump: 'patch',
  },
  {
    sha: '05cecc6b398b9be40774d12584cca90dbc143dd6',
    subject: 'fix(github.io): align evidence with Astryx primitives',
    bump: 'patch',
  },
  {
    sha: '741c51f3d52d88f110c35a1387840199e5548976',
    subject: 'fix(github.io): preserve responsive evidence radar',
    bump: 'patch',
  },
  {
    sha: '9bade050403a12bf8e5d4f1dcdbfd06fa885940a',
    subject: 'feat(github.io): add curated evidence radar scores',
    bump: 'minor',
  },
  {
    sha: '1de206f5a27d9e88769e9973c5ec36e99031cdac',
    subject: 'feat(github.io): order evidence radar axes by flow',
    bump: 'minor',
  },
  {
    sha: '3388cb10571a43d8ca496b1ac51cfc2fa2e79360',
    subject: 'fix(github.io): enlarge evidence radar plot',
    bump: 'patch',
  },
  {
    sha: '5019c3870ae677fdd100f204b6a1f1cf0db1c1c2',
    subject: 'fix(github.io): preserve evidence radar width',
    bump: 'patch',
  },
  {
    sha: 'd2d06bf2033cc95be1f1ddb583cd98fb0a4aa5f9',
    subject: 'fix(github.io): balance evidence radar proportions',
    bump: 'patch',
  },
  {
    sha: '04b46b24e92ddc4781d7e0f9e413ea277875f894',
    subject: 'fix(github.io): reduce evidence radar chart size',
    bump: 'patch',
  },
  {
    sha: 'ed6230f0d3288ffbe561eb4d90e6831e454bf4c6',
    subject: 'fix(github.io): reduce evidence radar height',
    bump: 'patch',
  },
  {
    sha: '34af813d38cfa698fb17d5bdcaeb520e846c23d3',
    subject: 'fix(github.io): tune evidence radar width',
    bump: 'patch',
  },
  {
    sha: '1795fa0e63614852230410123237ad3b1091553f',
    subject: 'feat(github.io): restore capability evidence helpers',
    bump: 'minor',
  },
  {
    sha: '73298fe17f3222d73725eeed487de09705e0f942',
    subject: 'feat(github.io): restore capability evidence renderer',
    bump: 'minor',
  },
  {
    sha: 'de9f92f24bb4061c56c3aa3e9465b93a006cf568',
    subject: 'feat(github.io): restore capability evidence stories',
    bump: 'minor',
  },
  {
    sha: '469477a59ee74f70e7cdcd9af75ee90ff3c36d31',
    subject: 'fix(github.io): label capability evidence groups',
    bump: 'patch',
  },
  {
    sha: '4b1a22933b29c4c2d0d009176d90c3bc77d926aa',
    subject: 'fix(github.io): summarize evidence fallback labels',
    bump: 'patch',
  },
  {
    sha: '115cdaeea2bf248ebf7b0c4678aec2bba4516b3f',
    subject: 'feat(github.io): distinguish learning evidence icons',
    bump: 'minor',
  },
  {
    sha: 'f34f3d4e5af41985226ed0e61248e09e4fae99bd',
    subject: 'fix(github.io): tighten evidence icon precedence',
    bump: 'patch',
  },
  {
    sha: 'fd2a525776b54a82c5d1e2d28b15f0e408afcf14',
    subject: 'feat(github.io): store curated DORA evidence links',
    bump: 'minor',
  },
  {
    sha: 'a27d38b53d6f2c80b9e06bc9dd1bf63ad3773bc0',
    subject: 'feat(github.io): add DORA interview evidence tokens',
    bump: 'minor',
  },
  {
    sha: 'dabcc6b5797b39bd060cc7c9fab0d0ced096bba3',
    subject: 'feat(github.io): tokenize earlier DORA evidence',
    bump: 'minor',
  },
  {
    sha: '900f932243bdfba813ef1314b35f142adf9617f2',
    subject: 'feat(github.io): add dora capability evidence rows',
    bump: 'minor',
  },
  {
    sha: '8fdc95637e92a083c6003ab98461e08344b08182',
    subject: 'fix(github.io): skip stylex plugin in vitest',
    bump: 'patch',
  },
  {
    sha: '68c6799404b61fdb2b19312f0d04a9969ab2e84c',
    subject: 'fix(github.io): compile stylex in vitest',
    bump: 'patch',
  },
  {
    sha: '7c536311ed6b3fe231a90c390a3b7f82ae9a84f4',
    subject: 'feat(github.io): add dora capability card',
    bump: 'minor',
  },
  {
    sha: '50f264ea4c196fe501bbca4958fd5be1fae77afa',
    subject: 'feat(github.io): add dora capability card stories',
    bump: 'minor',
  },
  // Integration 51bfa8918a543329cad84783eaf256499b0e264e: Merge branch 'feat/skill-category-badge-variants'
  {
    sha: 'ddb1803ae8f964df36642370bc18aa5d1cf68be9',
    subject: 'feat(github.io): derive skill category badge variants',
    bump: 'minor',
  },
  {
    sha: '894d4ea2777da7cb051110f690fc4f9df3e176bb',
    subject: 'feat(github.io): color skill category badges',
    bump: 'minor',
  },
  {
    sha: 'c8adb9e55159612e71fa75bc282009b7cd5a431c',
    subject: 'feat(github.io): show skill category on cards',
    bump: 'minor',
  },
  {
    sha: '4a46f21a21a08d186dba598398d9193e5e3558c7',
    subject: 'fix(github.io): keep skill category badge compact',
    bump: 'patch',
  },
  {
    sha: '0881da93d1a20d45b8d99e340618e3ec73e820e5',
    subject: 'feat(github.io): support multiple skill categories',
    bump: 'minor',
  },
  {
    sha: 'fdc8424d2b13d850b1eca0d2d1a4132834be4254',
    subject: 'feat(github.io): render skill card category badges',
    bump: 'minor',
  },
  {
    sha: 'e05d0e920bf96401b4984c2984ad748ab5d059d4',
    subject: 'fix(github.io): space skill categories from title',
    bump: 'patch',
  },
  {
    sha: 'cb51109a6aff57c1a0e671e771ba07450b32b2dd',
    subject: 'fix(github.io): increase skill category title spacing',
    bump: 'patch',
  },
  {
    sha: '1e3aba8028789ee6de5d46fb00c14cbd4be2c8c8',
    subject: 'fix(github.io): use tokenized category title gap',
    bump: 'patch',
  },
  {
    sha: '8dbd76b98e7ba26b36caee1856a7f44ad7b45136',
    subject: 'fix(github.io): use Astryx typography in DORA card',
    bump: 'patch',
  },
  {
    sha: '4ef2f21192ca81d9876e9286ed266ea9538a4f5e',
    subject: 'fix(github.io): use Astryx heading in roadmap node',
    bump: 'patch',
  },
  {
    sha: '177d44545511f5e827dec5e6ef9fa379bd183549',
    subject: 'fix(github.io): render skill ratings with heroicons',
    bump: 'patch',
  },
  {
    sha: 'a5c53f0b8e51322a867b36eb48199163df0ede5a',
    subject: 'fix(github.io): keep rating text compact only',
    bump: 'patch',
  },
  {
    sha: '0954cca3b252e9295e3f83160191842fc1905fe3',
    subject: 'feat(github.io): show ratings on skill cards',
    bump: 'minor',
  },
  {
    sha: '6f594f9b3088c43525c1191fab2b8e3c0ab6d07e',
    subject: 'fix(github.io): halve skill rating star size',
    bump: 'patch',
  },
  {
    sha: '393be8b425ad31f15d84448077af6b6a06b8952c',
    subject: 'fix(github.io): align skill card rating spacing',
    bump: 'patch',
  },
  {
    sha: 'c73204d7a2e39cff81ae107c1daf56fbd1bcfd30',
    subject: 'fix(github.io): refine skill card typography',
    bump: 'patch',
  },
  {
    sha: '6b2c75278526c3f01cc2b57720c04fa93645cdc1',
    subject: 'fix(github.io): simplify skill card certifications',
    bump: 'patch',
  },
  // Integration 5c86cb249ae57cba97144cd79e17be5db2452d32: Merge branch 'feat/github-io-mobile-skills-page'
  {
    sha: 'f73aa7b6bfe7db57c2921c23573d11b961f229c4',
    subject: 'feat(github.io): add highlighted skills catalog',
    bump: 'minor',
  },
  {
    sha: '8a5ee654e85151ac88fbe264add0e71e52bddaed',
    subject: 'feat(github.io): add mobile skills page',
    bump: 'minor',
  },
  {
    sha: 'b0113da7dcda945f460184d414657c8c3a3f44b9',
    subject: 'fix(github.io): stabilize mobile skills tests',
    bump: 'patch',
  },
  {
    sha: '63fd342a93e7621061ae62b8c7e8a1e97e3c8c6b',
    subject: 'feat(github.io): render mobile skills shell',
    bump: 'minor',
  },
  {
    sha: 'c9925899b6e0c0977c7e4cd172e75fab60651e99',
    subject: 'fix(github.io): address mobile skills review findings',
    bump: 'patch',
  },
  {
    sha: '442ef70b81a42d8974c006ed58ff8179b1ae77b5',
    subject: 'feat(github.io): update skill catalog data',
    bump: 'minor',
  },
  {
    sha: 'a00d7f16965c5af9e0e97f233eb1d958f21a92cf',
    subject: 'fix(github.io): use documented skill avatar size',
    bump: 'patch',
  },
  {
    sha: '6d849f3496894c5f27a2783ee12e683ef4616db3',
    subject: 'feat(github.io): add Kubernetes certifications',
    bump: 'minor',
  },
  {
    sha: '15f81a380e2cc45439f2910416ec3a1287425984',
    subject: 'fix(github.io): address mobile skills review',
    bump: 'patch',
  },
  {
    sha: '010ade787946bb7cf6b6f72c155c0ffcb540bc47',
    subject: 'fix(github.io): place skills carousel above search',
    bump: 'patch',
  },
  {
    sha: '7402fbec6beedffddaea85825c2f2e386871788d',
    subject: 'fix(github.io): constrain mobile shell nav',
    bump: 'patch',
  },
  {
    sha: '50e62a90666f8b7d6351798c5629fa57043b5d5a',
    subject: 'feat(github.io): move skill search into top nav',
    bump: 'minor',
  },
  {
    sha: '2b4694f2df3a16d5344f8cc4992efe27c9f160a0',
    subject: 'fix(github.io): group skill command results',
    bump: 'patch',
  },
  {
    sha: 'aa6958a6e5b15f928f85ae6eba0c912cb24114d7',
    subject: 'fix(github.io): title case skill names',
    bump: 'patch',
  },
  {
    sha: '02c693d857c3c4ff8f963694d33e8e455b251469',
    subject: 'fix(github.io): sort skills alphabetically',
    bump: 'patch',
  },
  {
    sha: 'b8d11fd50c4d7d5221f82f0139af9998015aca03',
    subject: 'fix(github.io): compact mobile skill surfaces',
    bump: 'patch',
  },
  {
    sha: '21916c396e99cc8e10a73cb5fd98e07596d10a2e',
    subject: 'fix(github.io): show compact skill descriptions',
    bump: 'patch',
  },
  {
    sha: '3e3262d251879dfe50099826b1766f18705725d3',
    subject: 'fix(github.io): keep mobile nav fixed',
    bump: 'patch',
  },
  {
    sha: '296b7647e681d34f6c17214bce0d6dff27fa88ed',
    subject: 'fix(github.io): keep nav in mobile scroll view',
    bump: 'patch',
  },
  {
    sha: 'ddca2daa1bde0fb1f5f9bec19926bf28fa9c1388',
    subject: 'fix(github.io): render nav in mobile skills story',
    bump: 'patch',
  },
  {
    sha: 'c5034b3cf95b0bcc2e8495d92bef232a491bc333',
    subject: 'fix(github.io): pin mobile nav to viewport',
    bump: 'patch',
  },
  {
    sha: '7ff0fecdb171b8e10d14681dbd6aa7ec56b06324',
    subject: 'feat(github.io): render skills as card list',
    bump: 'minor',
  },
  {
    sha: '131577937f0ed6e41ab88bfd80aa44dad89f2bf1',
    subject: 'feat(github.io): show skill ratings on cards',
    bump: 'minor',
  },
  {
    sha: '03467ca1648157941c09845cfb6e25102cc0e5b2',
    subject: 'fix(github.io): use updated skill star rating',
    bump: 'patch',
  },
  {
    sha: 'c9ddcad23afbc15e0fec8b5a73b3274b5b5553bc',
    subject: 'fix(github.io): keep carousel above skills scroller',
    bump: 'patch',
  },
  {
    sha: '922c8bb4fc87b9c1bf5b1ee353e2f93ed0df0f81',
    subject: 'feat(github.io): add skill avatar card variant',
    bump: 'minor',
  },
  {
    sha: '43588bdb8107a2fb24507b5802a2a24b7be5ba6e',
    subject: 'feat(github.io): show logos on skill cards',
    bump: 'minor',
  },
  {
    sha: 'a81f889d33d26314e6412d039a1da9e71a00e635',
    subject: 'fix(github.io): use rectangular skill card avatars',
    bump: 'patch',
  },
  {
    sha: '766b589120b7255afe132679ae2559128634b1e6',
    subject: 'fix(github.io): preserve skill card tile styles',
    bump: 'patch',
  },
  {
    sha: '5bdaf720e09492deebaeeda4551fb8860a36a315',
    subject: 'fix(github.io): restore Astryx skill card avatars',
    bump: 'patch',
  },
  {
    sha: 'dcf99077fb69ce6f9558bcc9bab35357dc9db23b',
    subject: 'fix(github.io): move skill logos to command palette',
    bump: 'patch',
  },
  {
    sha: '7b2851bd6540fdfe478c2f5fa0643f2d215bc9d5',
    subject: 'fix(github.io): use rectangular command skill avatars',
    bump: 'patch',
  },
  {
    sha: '27ef91f5a5cc6ba1fadbb7f9d76d7c02f0e3a07e',
    subject: 'fix(github.io): use circular command skill avatars',
    bump: 'patch',
  },
  {
    sha: 'bc08919fa97bb29753d48e04676e9de2a3423ad2',
    subject: 'fix(github.io): use tiny skill avatars',
    bump: 'patch',
  },
  {
    sha: '015166ca63237b39234a959f5fe053ac3da434cb',
    subject: 'fix(github.io): add skill avatar size prop',
    bump: 'patch',
  },
  {
    sha: 'b50141c493780e35cd82dac5b3d7870a55179680',
    subject: 'fix(github.io): use small skill list avatars',
    bump: 'patch',
  },
  {
    sha: '7dc33a4dc180e69a23cbc40518505cf381d9f2c7',
    subject: 'feat(github.io): add CNCF certification badge assets',
    bump: 'minor',
  },
  {
    sha: '5f8b24442a7e96dff4d2edd1adead764461632d9',
    subject: 'fix(github.io): prefer certification badge icons',
    bump: 'patch',
  },
  {
    sha: 'efdc7f4ee6ac88b91c08b83d2752437a586c97f5',
    subject: 'feat(github.io): use CNCF badges for certification data',
    bump: 'minor',
  },
  {
    sha: '77555f3fceed139f1d1d70c5c2b9caa76aa897da',
    subject: 'feat(github.io): support certification evidence badges',
    bump: 'minor',
  },
  {
    sha: 'ab60c12f437625625e58033c89aee84a54a16f3f',
    subject: 'feat(github.io): add project data model',
    bump: 'minor',
  },
  {
    sha: '7aeca455fe4d12e4af994be02a45782342d88087',
    subject: 'feat(github.io): add project card',
    bump: 'minor',
  },
  {
    sha: 'aa7a88ba59dfecc9660e06e9f650751011965cf5',
    subject: 'fix(github.io): correct project card assertions',
    bump: 'patch',
  },
  {
    sha: 'b2a1b618c5e7bec8f0ebcd77ab6f6868a2479f73',
    subject: 'feat(github.io): add dotfiles project skills',
    bump: 'minor',
  },
  {
    sha: '68c3fadb54e2455da891d06311800fd5455084a3',
    subject: 'feat(github.io): show certification metadata hovercard',
    bump: 'minor',
  },
  {
    sha: '5d6ebf2a9d19ed38946558b2ebefa0e8f51fd0a2',
    subject: 'feat(github.io): add certification credential metadata',
    bump: 'minor',
  },
  {
    sha: 'acc208fc79d5a7dd65b8c43ec5bac3138533d729',
    subject: 'fix(github.io): reject impossible certification expiry dates',
    bump: 'patch',
  },
  {
    sha: '82d940134639b99b991a0fbe6a36d5814ae35074',
    subject: 'fix(github.io): use badge for certification status',
    bump: 'patch',
  },
  {
    sha: '6b7a5b5abd06789c682621f591ccedef76882ed4',
    subject: 'feat(github.io): label mobile skills list',
    bump: 'minor',
  },
  {
    sha: '2cf1211a357bbf906c416f7751db11a8ec1bd58c',
    subject: 'fix(github.io): apply native mobile skills spacing',
    bump: 'patch',
  },
  {
    sha: 'cca6363f67ccc0b0f8f1b4d05d68b7dd1eabd41a',
    subject: 'feat(github.io): add atomic continuous integration evidence',
    bump: 'minor',
  },
  {
    sha: 'd837288ec400a5529538e2d3cfd8d18936171e7f',
    subject: 'feat(github.io): curate continuous integration card evidence',
    bump: 'minor',
  },
  {
    sha: '69e874dab842f5254ab6317de58013a86fc1d1a1',
    subject: 'fix(github.io): widen evidence catalog exports',
    bump: 'patch',
  },
  {
    sha: '3e414ebf5e911653668a27eacec85d346f1b344d',
    subject: 'feat(github.io): add CI skill evidence catalog',
    bump: 'minor',
  },
  {
    sha: 'd6b12672ee95048c60f624613ebd61e7ce437c42',
    subject: 'feat(github.io): group capability skill evidence',
    bump: 'minor',
  },
  {
    sha: 'd8484328052795fe922ac31f3373da2e4b5b73ac',
    subject: 'feat(github.io): render official CI skill icons',
    bump: 'minor',
  },
  {
    sha: '60879efae96b9a1e0b48e8e62a85d4dcc09db979',
    subject: 'fix(github.io): narrow skill brand icon guard',
    bump: 'patch',
  },
  {
    sha: '41d5a6377c770718d41ed6ae9a2e94050f10eaf6',
    subject: 'feat(github.io): add neutral skill token variant',
    bump: 'minor',
  },
  {
    sha: 'ed1acbd0fbc1f7e98642259f43d311d977cb485b',
    subject: 'feat(github.io): label capability evidence rows',
    bump: 'minor',
  },
  {
    sha: 'd7dc28276840df339fd599ba2a1de225a2dcba8b',
    subject: 'feat(github.io): order CI skills chronologically',
    bump: 'minor',
  },
  {
    sha: '59317088fbbca93e220213e9040219ab99e56ed5',
    subject: 'fix(github.io): use singular Experience label',
    bump: 'patch',
  },
  {
    sha: 'ad57e9d39315b9cdadb2735d590c7af105810850',
    subject: 'feat(github.io): add continuous delivery evidence',
    bump: 'minor',
  },
  {
    sha: 'c77f97ac7001e8d2d807192fbbf5fc24782df17d',
    subject: 'feat(github.io): add continuous delivery skills',
    bump: 'minor',
  },
  {
    sha: 'e159178675d04ea8fdd7c60f73e323af32ecaba5',
    subject: 'feat(github.io): add Amazon EKS skill branding',
    bump: 'minor',
  },
  {
    sha: '89874235990da6fc0f1ac663b5ae880be34611ec',
    subject: 'feat(github.io): curate continuous delivery evidence',
    bump: 'minor',
  },
  {
    sha: 'cb268a29c6ba9c0c684cdba4949e322d95f44f8e',
    subject: 'feat(github.io): present continuous delivery evidence',
    bump: 'minor',
  },
  {
    sha: '5525a0c64dc986baa31c86303ea11ab932b6be47',
    subject: 'feat(github.io): clarify experience evidence labels',
    bump: 'minor',
  },
  {
    sha: '41da12494565ecf0d013758c68792296c1f7db50',
    subject: 'feat(github.io): clarify DORA evidence row labels',
    bump: 'minor',
  },
  {
    sha: '8e84778ee14a0a25e48eee0b8c5cad94151e2486',
    subject: 'feat(github.io): summarize DORA capability experience',
    bump: 'minor',
  },
  {
    sha: '51928eea720409d1f2ff8bb39adf31f50fc623da',
    subject: 'fix(github.io): grayscale expired certification image logos',
    bump: 'patch',
  },
  {
    sha: '5d47bec8df83efed1204cb0d42c2ed3d32454108',
    subject: 'feat(github.io): prepare shared version control evidence',
    bump: 'minor',
  },
  {
    sha: '89a8ef948af383bdf3caf45089d75eb0488e1128',
    subject: 'feat(github.io): add version control evidence catalog',
    bump: 'minor',
  },
  {
    sha: '3b84920f379e6e80342be67f09ba41f9c6da4f20',
    subject: 'feat(github.io): add trunk-based evidence catalog',
    bump: 'minor',
  },
  {
    sha: '6ecd3cc67bb96f0c240fb467e2b733ba78863d18',
    subject: 'feat(github.io): curate versioning capability cards',
    bump: 'minor',
  },
  {
    sha: '0ed936f686877a8e78e7adb9a0d25f8b6e500b18',
    subject: 'fix(github.io): stabilize versioning card projections',
    bump: 'patch',
  },
  {
    sha: '32429b1a40aac842520d9d43d95553cf4f32a6d4',
    subject: 'feat(github.io): add versioning capability stories',
    bump: 'minor',
  },
  {
    sha: '6d05ab440491b45055a7a65c7e785b82bb13b100',
    subject: 'fix(github.io): restrict Storybook runtime hosts',
    bump: 'patch',
  },
  {
    sha: 'aa362e7f5dfd6dfd71599db3dfb5d7511ca74d7f',
    subject: 'fix(github.io): keep reusable image evidence affirmative',
    bump: 'patch',
  },
  // Integration 9fc00335c3709232d9a8df58a7519a264f890226: Merge branch 'feat/version-control-trunk-based-evidence-clean'
  {
    sha: 'de585030322677d3bc0da2636ab10739b31774d5',
    subject: 'fix(github.io): improve radar tooltip contrast',
    bump: 'patch',
  },
  {
    sha: '7efd00fbfa409702f26106c5003aac4bc390508f',
    subject: 'fix(github.io): use skill token radar colors',
    bump: 'patch',
  },
  {
    sha: '3c49167520b2eeefc60c2255b459c7a14b4a7e38',
    subject: 'fix(github.io): pass app verification checks',
    bump: 'patch',
  },
  {
    sha: '1dba3b6a6ff2f5ae6f6a53de8312ce61fe42d119',
    subject: 'fix(github.io): use neutral expired citation icons',
    bump: 'patch',
  },
  {
    sha: 'ae73e362999bfbd50454ade7f2c39c85e9b5a896',
    subject: 'fix(github.io): restore roadmap node width',
    bump: 'patch',
  },
  {
    sha: 'bba821236516e73ac13f774058ec322a3d0e8c1e',
    subject: 'fix(github.io): narrow citation icon brand',
    bump: 'patch',
  },
  {
    sha: 'b5a457e87c44a2b99a5989d898761f7be217aa04',
    subject: 'fix(github.io): align roadmap flow node width',
    bump: 'patch',
  },
  {
    sha: 'b7e752412778225f3d5ef8e14637cdb7233371a1',
    subject: 'fix(github.io): measure roadmap node spacing',
    bump: 'patch',
  },
  {
    sha: '6f2281dc8d4519f6a3ec3fd64d406804e494a5f8',
    subject: 'fix(github.io): remove roadmap fit padding',
    bump: 'patch',
  },
  {
    sha: 'd8299dd8436bbca1125993872bcd5b22565ae189',
    subject: 'fix(github.io): render roadmap at native scale',
    bump: 'patch',
  },
  {
    sha: 'faf9e586013a7fa23f1ddde9cce17896ee399aa5',
    subject: 'fix(github.io): narrow storybook fs allowlist',
    bump: 'patch',
  },
  {
    sha: 'eed2d37d52d7ff96b7482e62e325aed2f2f774d8',
    subject: 'feat(github.io): add capability evidence model',
    bump: 'minor',
  },
  {
    sha: '0b1deb42c316e7358c76b34c24a789b8e58c0148',
    subject: 'feat(github.io): derive capability evidence scores',
    bump: 'minor',
  },
  {
    sha: '05e9a854a12a6ba54c8d69547e973efdd34879b7',
    subject: 'fix(github.io): exclude sensitive capability evidence',
    bump: 'patch',
  },
  {
    sha: 'de33da393a8bee5f0ac6bb51e14aa3850f2e9da2',
    subject: 'fix(github.io): validate public skill evidence support',
    bump: 'patch',
  },
  {
    sha: 'a1b481d9514057870a039406880e798c60a86bc6',
    subject: 'feat(github.io): add evidence-backed capability radar',
    bump: 'minor',
  },
  {
    sha: '65f9693e8ca4ed020aa959e8228295394475e6e2',
    subject: 'feat(github.io): add capability evidence bar list',
    bump: 'minor',
  },
  {
    sha: '4dd05a74183e8c7ccce6744983051b0d7e75e3bf',
    subject: 'fix(github.io): secure capability bar evidence rendering',
    bump: 'patch',
  },
  {
    sha: '07efa482b48731e230cda842f8475187cb7a9512',
    subject: 'feat(github.io): add capability evidence matrix',
    bump: 'minor',
  },
  {
    sha: '79478ecef23b09fbcbb9e3297f6fea892304b242',
    subject: 'feat(github.io): add evidence type distribution',
    bump: 'minor',
  },
  {
    sha: 'af6074551e925fb07f5bdff17224f789ddae6f6e',
    subject: 'feat(github.io): add capability evidence timeline',
    bump: 'minor',
  },
  {
    sha: 'd7e1b22bc4e8916e8808de5395779ed46b81399d',
    subject: 'feat(github.io): add certification capability map',
    bump: 'minor',
  },
  {
    sha: '7a11decb2408a4d39b7de847e4912d7f8ef6d49a',
    subject: 'fix(github.io): harden DevOps evidence visualizations',
    bump: 'patch',
  },
  {
    sha: '611fdef6b28dadabdec38cdae4a1ee5481425c5a',
    subject: 'feat(github.io): expand skill model for citations',
    bump: 'minor',
  },
  {
    sha: '9a7dab7b2fb0cbbf12ddb7281dfce6fc43ad1cc7',
    subject: 'feat(github.io): add skill card',
    bump: 'minor',
  },
  {
    sha: '8ec03988cc48b0c6e71cecc6a58e9f2cc176adcb',
    subject: 'feat(github.io): add skill carousel',
    bump: 'minor',
  },
  {
    sha: 'ea86f89ca147de6af1319d03c95c50e77f0058b5',
    subject: 'fix(github.io): stub resize observer in carousel spec',
    bump: 'patch',
  },
  {
    sha: 'e097fb11b655d060077c86a97cf4f1dc0a14cce6',
    subject: 'fix(github.io): make skill card labels instance-safe',
    bump: 'patch',
  },
  {
    sha: '2d9f3c909160bda2ac3fc1c876e477a968df6afc',
    subject: 'fix(github.io): let skill cards use default height',
    bump: 'patch',
  },
  {
    sha: '453ee89110397211e9c58b8ddfebba5f7504d941',
    subject: 'fix(github.io): equalize skill carousel card height',
    bump: 'patch',
  },
  {
    sha: '64693353169d2eed493b87f83ac7e2f21bebaa4e',
    subject: 'fix(github.io): stretch skill carousel cards naturally',
    bump: 'patch',
  },
  {
    sha: '2edce799012acc0212b2138b3974c0d947deadaa',
    subject: 'fix(github.io): harden skill carousel reuse',
    bump: 'patch',
  },
  {
    sha: 'c9a69086b5d9d5c0899f62711102d169668af763',
    subject: 'feat(github.io): add capability evidence helpers',
    bump: 'minor',
  },
  {
    sha: '38970e609cbef5b136964ed9ecbcb4601cd99619',
    subject: 'feat(github.io): add compact capability evidence',
    bump: 'minor',
  },
  {
    sha: '86aa284d768efdc60133b5cbd45e3b09205aedde',
    subject: 'fix(github.io): label compact evidence tokens accessibly',
    bump: 'patch',
  },
  {
    sha: '4367fbcca8114102abcad018d4cb92ddd6688fa2',
    subject: 'fix(github.io): complete compact evidence icon behavior',
    bump: 'patch',
  },
  {
    sha: '389b92ae83c843ae7739ccdc06fc9032df647002',
    subject: 'fix(github.io): distinguish evidence type icons',
    bump: 'patch',
  },
  {
    sha: '39b13e32e0e57d21b33a49d1043170fd4298242e',
    subject: 'fix(github.io): align evidence with Astryx primitives',
    bump: 'patch',
  },
  {
    sha: '36f87a714ee2d2cd8ac1f9955277a8099cb184f9',
    subject: 'fix(github.io): preserve responsive evidence radar',
    bump: 'patch',
  },
  {
    sha: '188eecd6606173f6a89c076594796f154e018360',
    subject: 'feat(github.io): add curated evidence radar scores',
    bump: 'minor',
  },
  {
    sha: 'd8ad9b7fbd64664efc5ea557e80bffcce787138e',
    subject: 'feat(github.io): order evidence radar axes by flow',
    bump: 'minor',
  },
  {
    sha: 'a011a063a82a68760b6406c5a54379ffdcb2c51c',
    subject: 'fix(github.io): enlarge evidence radar plot',
    bump: 'patch',
  },
  {
    sha: '8a0cf49174ff214cb2b56086b1347a2173380c4f',
    subject: 'fix(github.io): preserve evidence radar width',
    bump: 'patch',
  },
  {
    sha: 'ca3d6a54d07f5778d45d7d7c9d713692d108efbd',
    subject: 'fix(github.io): balance evidence radar proportions',
    bump: 'patch',
  },
  {
    sha: '407c9e9f8bdfbb13ac953e46a7fd9e2eec6939c7',
    subject: 'fix(github.io): reduce evidence radar chart size',
    bump: 'patch',
  },
  {
    sha: '531b57adf20d0fec2258b4d21fdf9997773630a0',
    subject: 'fix(github.io): reduce evidence radar height',
    bump: 'patch',
  },
  {
    sha: '5bdc4f4ba00e61377807d3c54fdd18e3a62cfcb0',
    subject: 'fix(github.io): tune evidence radar width',
    bump: 'patch',
  },
  {
    sha: 'cdee55507041804e4f3145a9a40360f8543b488f',
    subject: 'feat(github.io): restore capability evidence helpers',
    bump: 'minor',
  },
  {
    sha: 'b9594129ead57fd40d3a0b608ef33e1aabd3fde3',
    subject: 'feat(github.io): restore capability evidence renderer',
    bump: 'minor',
  },
  {
    sha: '8b18252dc3171270f8f1c404b4676cf1c00a4b31',
    subject: 'feat(github.io): restore capability evidence stories',
    bump: 'minor',
  },
  {
    sha: '760f8da7b4a2e9491e55f4c02bbccbeb665472b3',
    subject: 'fix(github.io): label capability evidence groups',
    bump: 'patch',
  },
  {
    sha: '285f49b33d17fc23f469f61d846aaec496f9c96b',
    subject: 'fix(github.io): summarize evidence fallback labels',
    bump: 'patch',
  },
  {
    sha: 'dd3c89c37a115a4f13f314943d41d7a2f958ab62',
    subject: 'feat(github.io): distinguish learning evidence icons',
    bump: 'minor',
  },
  {
    sha: '9fe4367301ca288f181165ba334adeb4aefc55d4',
    subject: 'fix(github.io): tighten evidence icon precedence',
    bump: 'patch',
  },
  {
    sha: '7ab80156255636381efef0e22f867d9d8d364886',
    subject: 'feat(github.io): store curated DORA evidence links',
    bump: 'minor',
  },
  {
    sha: 'dcb9cb4031e42954a7f9f38e2437d1299e8b5a72',
    subject: 'feat(github.io): add DORA interview evidence tokens',
    bump: 'minor',
  },
  {
    sha: '52569c17b86f8dd08e8104c6b1be620c629367f4',
    subject: 'feat(github.io): tokenize earlier DORA evidence',
    bump: 'minor',
  },
  {
    sha: '9b8d1d35826093f3776807b49d4ff66ed3b7a22c',
    subject: 'feat(github.io): add dora capability evidence rows',
    bump: 'minor',
  },
  {
    sha: 'c2bd8a97c75fe07ea4af6095e8a9cd012a25f7a0',
    subject: 'fix(github.io): skip stylex plugin in vitest',
    bump: 'patch',
  },
  {
    sha: 'c1f196abf4ec49a308c47c2d8d5dc8747aef794d',
    subject: 'fix(github.io): compile stylex in vitest',
    bump: 'patch',
  },
  {
    sha: '14a8c8aa12c0535141b0d7f7899dd6c3f3ce6aba',
    subject: 'feat(github.io): add dora capability card',
    bump: 'minor',
  },
  {
    sha: 'ade524c1ca9ce6f9ff4b5677d8e3485fa2f1ec85',
    subject: 'feat(github.io): add dora capability card stories',
    bump: 'minor',
  },
  {
    sha: 'b16f58d6a77a1bc75ac2af1d245662e317a85502',
    subject: 'feat(github.io): derive skill category badge variants',
    bump: 'minor',
  },
  {
    sha: 'f269297daf1a59a0a1faf3318448f01c96beb73d',
    subject: 'feat(github.io): color skill category badges',
    bump: 'minor',
  },
  {
    sha: '7ec08aa1b1a61e3884f85c35aca88b61dc318db1',
    subject: 'feat(github.io): show skill category on cards',
    bump: 'minor',
  },
  {
    sha: '6e285107a12eedf2523519b737d909cb5dc93f71',
    subject: 'fix(github.io): keep skill category badge compact',
    bump: 'patch',
  },
  {
    sha: '64d2c3bb15154452fd0997ffe1b6141876302fd2',
    subject: 'feat(github.io): support multiple skill categories',
    bump: 'minor',
  },
  {
    sha: '161c1176bc3b096c5d6e66a205648dedf0689dcf',
    subject: 'feat(github.io): render skill card category badges',
    bump: 'minor',
  },
  {
    sha: '4ea43e47418476e644cf27c87928d3e68616cdfc',
    subject: 'fix(github.io): space skill categories from title',
    bump: 'patch',
  },
  {
    sha: 'd0fb701f5649f40000a8b156944b285758ac1dcc',
    subject: 'fix(github.io): increase skill category title spacing',
    bump: 'patch',
  },
  {
    sha: 'a0366cf9770913a416b25f653beb1f614adfb592',
    subject: 'fix(github.io): use tokenized category title gap',
    bump: 'patch',
  },
  {
    sha: '9423919aa029543677260ad25431c0eba6d929e2',
    subject: 'fix(github.io): use Astryx typography in DORA card',
    bump: 'patch',
  },
  {
    sha: '7bdde942a1f815b133135c96871fd3a40288c50c',
    subject: 'fix(github.io): use Astryx heading in roadmap node',
    bump: 'patch',
  },
  {
    sha: 'dfb0c640b7457dcbdd8240fe8cec6d2c809e7b63',
    subject: 'fix(github.io): render skill ratings with heroicons',
    bump: 'patch',
  },
  {
    sha: '59cd6082162ecab0c60f33c8385490af29e94818',
    subject: 'fix(github.io): keep rating text compact only',
    bump: 'patch',
  },
  {
    sha: '61c42855cd47b614e5fcf12557fc7a0b69d97a1f',
    subject: 'feat(github.io): show ratings on skill cards',
    bump: 'minor',
  },
  {
    sha: '8d89aae0684e7f92562f86017addac45fd17abc5',
    subject: 'fix(github.io): halve skill rating star size',
    bump: 'patch',
  },
  {
    sha: 'fc2946f7b85b2463b0806ab22efb0d7239047d97',
    subject: 'fix(github.io): align skill card rating spacing',
    bump: 'patch',
  },
  {
    sha: '733afe5d1431c14e0f6a68fb74bcec60be474116',
    subject: 'fix(github.io): refine skill card typography',
    bump: 'patch',
  },
  {
    sha: 'bc97dd05a64d2bb115e76dd01ec59bcfe4bac233',
    subject: 'fix(github.io): simplify skill card certifications',
    bump: 'patch',
  },
  {
    sha: '98b7a40e7d8240bcde1fb1007d884fe71f2f8edb',
    subject: 'feat(github.io): add highlighted skills catalog',
    bump: 'minor',
  },
  {
    sha: 'd0b4e127ffe3e4b3e6f120949565695722942f81',
    subject: 'feat(github.io): add mobile skills page',
    bump: 'minor',
  },
  {
    sha: 'e88560e2de2597abf80c0c2e1741d79a896929dd',
    subject: 'fix(github.io): stabilize mobile skills tests',
    bump: 'patch',
  },
  {
    sha: '9e35c4b19bbd83d5c8c2e2facb7de8136f2cc197',
    subject: 'feat(github.io): render mobile skills shell',
    bump: 'minor',
  },
  {
    sha: 'bf0da6d6974aff0acc5758c6cd3930b6ccf7070e',
    subject: 'fix(github.io): address mobile skills review findings',
    bump: 'patch',
  },
  {
    sha: '239a603289d134660ac1f7000ed44cb56931c0f6',
    subject: 'feat(github.io): update skill catalog data',
    bump: 'minor',
  },
  {
    sha: '9a0c609645cea0bcf98cc02fe7f74b9abaf64ae0',
    subject: 'fix(github.io): use documented skill avatar size',
    bump: 'patch',
  },
  {
    sha: '809b072ead5347342062ca636b4ed700f9d23349',
    subject: 'feat(github.io): add Kubernetes certifications',
    bump: 'minor',
  },
  {
    sha: '3303bd4fb7c6b66cfa9b40e8c034a402fbdefe48',
    subject: 'fix(github.io): address mobile skills review',
    bump: 'patch',
  },
  {
    sha: 'ba09858bf702a7b4c7762402206677e770523971',
    subject: 'fix(github.io): place skills carousel above search',
    bump: 'patch',
  },
  {
    sha: '8dd67ceccd23441833cd5b5895e1ff3a46dd5f12',
    subject: 'fix(github.io): constrain mobile shell nav',
    bump: 'patch',
  },
  {
    sha: '41a4b3c873bb5581931d0a8ebd0488a4e29841db',
    subject: 'feat(github.io): move skill search into top nav',
    bump: 'minor',
  },
  {
    sha: 'd4971b7cd626eabd137214adbb89738de64dc084',
    subject: 'fix(github.io): group skill command results',
    bump: 'patch',
  },
  {
    sha: '5b6a7fc5d6d4eb0fe8cc0212a2ca166dd6df1786',
    subject: 'fix(github.io): title case skill names',
    bump: 'patch',
  },
  {
    sha: 'e1dcdfcc5f63af260139ccedb9cd1d784936b9fa',
    subject: 'fix(github.io): sort skills alphabetically',
    bump: 'patch',
  },
  {
    sha: '2e8f58495e311e742b14a72e7a4e50ee162ec966',
    subject: 'fix(github.io): compact mobile skill surfaces',
    bump: 'patch',
  },
  {
    sha: '037f7db47f33c35a004c89cae36b74592bfd4c21',
    subject: 'fix(github.io): show compact skill descriptions',
    bump: 'patch',
  },
  {
    sha: '0a00c1739dd4070e2713e301f694b474caae35c9',
    subject: 'fix(github.io): keep mobile nav fixed',
    bump: 'patch',
  },
  {
    sha: '71bebf25d3be2ceca58dbaefb8f6e923ed35563d',
    subject: 'fix(github.io): keep nav in mobile scroll view',
    bump: 'patch',
  },
  {
    sha: 'c03a7a5c3dc0186eef6042b0b94e211c57480b26',
    subject: 'fix(github.io): render nav in mobile skills story',
    bump: 'patch',
  },
  {
    sha: 'bf8c9d55ddf4e7e36ec37115a5da07576aad86de',
    subject: 'fix(github.io): pin mobile nav to viewport',
    bump: 'patch',
  },
  {
    sha: '5fb65d5d2e5feaa00396971089b15d3842366923',
    subject: 'feat(github.io): render skills as card list',
    bump: 'minor',
  },
  {
    sha: '8f2408e29d2041d9e342df31b8151b451c90bd76',
    subject: 'feat(github.io): show skill ratings on cards',
    bump: 'minor',
  },
  {
    sha: 'f14f9c5ca6667ad4a4fb9704067c6225f77b01c8',
    subject: 'fix(github.io): use updated skill star rating',
    bump: 'patch',
  },
  {
    sha: 'b5f258026c9d01892e00b94a731347e48d9415d5',
    subject: 'fix(github.io): keep carousel above skills scroller',
    bump: 'patch',
  },
  {
    sha: '50abdb3f9f04efdea09eaa5df94f52526bd3647c',
    subject: 'feat(github.io): add skill avatar card variant',
    bump: 'minor',
  },
  {
    sha: '7ce567b601c3148a03e93f9dc7bc0a257b46917b',
    subject: 'feat(github.io): show logos on skill cards',
    bump: 'minor',
  },
  {
    sha: '3286c67dfc0e07b96382c058e48488309b9fc23f',
    subject: 'fix(github.io): use rectangular skill card avatars',
    bump: 'patch',
  },
  {
    sha: 'f323c7b1c25c8d24349466793af7c0a71fbb5f83',
    subject: 'fix(github.io): preserve skill card tile styles',
    bump: 'patch',
  },
  {
    sha: '770d487776642953cd40dc77f85e45eaa455ddf6',
    subject: 'fix(github.io): restore Astryx skill card avatars',
    bump: 'patch',
  },
  {
    sha: 'bf30b9501132cc357668e812ebf65f39cf109395',
    subject: 'fix(github.io): move skill logos to command palette',
    bump: 'patch',
  },
  {
    sha: '83d2791df18e19658df0f504e36a399c74fdeab6',
    subject: 'fix(github.io): use rectangular command skill avatars',
    bump: 'patch',
  },
  {
    sha: '4bac693e12b0bf012c996bd8ecac7b2d1a420635',
    subject: 'fix(github.io): use circular command skill avatars',
    bump: 'patch',
  },
  {
    sha: '8b1065cfb0f3081cb7b228150e92cd806526a008',
    subject: 'fix(github.io): use tiny skill avatars',
    bump: 'patch',
  },
  {
    sha: '4730cb78648229d164927edd5e6aadd8d27bd77e',
    subject: 'fix(github.io): add skill avatar size prop',
    bump: 'patch',
  },
  {
    sha: '78c060afc04111dcf5bd9fb16760f72b64b8f3ec',
    subject: 'fix(github.io): use small skill list avatars',
    bump: 'patch',
  },
  {
    sha: '85d2cf1262ab56ccb26f1e83d420842e515f3125',
    subject: 'feat(github.io): add CNCF certification badge assets',
    bump: 'minor',
  },
  {
    sha: '3dc46f5ff926c60806f1b148416ad12e7b05de5a',
    subject: 'fix(github.io): prefer certification badge icons',
    bump: 'patch',
  },
  {
    sha: '78e4beeab854e9aebc15e3943a3fbc8d54d7a78a',
    subject: 'feat(github.io): use CNCF badges for certification data',
    bump: 'minor',
  },
  {
    sha: '11b0c98190bbb01f4741d2f592818496417b4b34',
    subject: 'feat(github.io): support certification evidence badges',
    bump: 'minor',
  },
  {
    sha: '90c2fc375a690d1e859969bbdf7c17f5186eab95',
    subject: 'feat(github.io): add project data model',
    bump: 'minor',
  },
  {
    sha: '652d209f9ecd251d24314bbf005a7ed18355387c',
    subject: 'feat(github.io): add project card',
    bump: 'minor',
  },
  {
    sha: '1d8d0070397173e3c216424b2466e690c256a96c',
    subject: 'fix(github.io): correct project card assertions',
    bump: 'patch',
  },
  {
    sha: 'b51a5426bec0908f7c3f9a7cb426055789103667',
    subject: 'feat(github.io): add dotfiles project skills',
    bump: 'minor',
  },
  {
    sha: '9e81b41566b84853f52333fc0d22b781f4bfe944',
    subject: 'feat(github.io): show certification metadata hovercard',
    bump: 'minor',
  },
  {
    sha: '97a4c822cc516c32a9eea4b79e74f209f60e59b7',
    subject: 'feat(github.io): add certification credential metadata',
    bump: 'minor',
  },
  {
    sha: 'f6063f8cd6808f0791bff1e47d4a2cb6c9f982be',
    subject: 'fix(github.io): reject impossible certification expiry dates',
    bump: 'patch',
  },
  {
    sha: '16f5cd281d74287614e665d78e9c9e28cb968543',
    subject: 'fix(github.io): use badge for certification status',
    bump: 'patch',
  },
  {
    sha: 'c54b5fde9b48b3a714628ee9ee0243fc057bf0e3',
    subject: 'feat(github.io): label mobile skills list',
    bump: 'minor',
  },
  {
    sha: 'fd1d1dbbc4cb9428086e17f74d053b9704c0b517',
    subject: 'fix(github.io): apply native mobile skills spacing',
    bump: 'patch',
  },
  {
    sha: '4b2611a61088e20af34713a9116de86010adc064',
    subject: 'feat(github.io): add atomic continuous integration evidence',
    bump: 'minor',
  },
  {
    sha: 'cc78e17793cd699a09a1b40ad91bb75cae7b3aeb',
    subject: 'feat(github.io): curate continuous integration card evidence',
    bump: 'minor',
  },
  {
    sha: '397ac65715001b2315b24f4ffce3b29173d07a3a',
    subject: 'fix(github.io): widen evidence catalog exports',
    bump: 'patch',
  },
  {
    sha: '5c938c640ab03af5c306c3dbff7182b60b32c09c',
    subject: 'feat(github.io): add CI skill evidence catalog',
    bump: 'minor',
  },
  {
    sha: '121838fa28772960ba271232a0c3d3622882c28a',
    subject: 'feat(github.io): group capability skill evidence',
    bump: 'minor',
  },
  {
    sha: '0958949ca2d0f5327d757090072bb2b96f1a561d',
    subject: 'feat(github.io): render official CI skill icons',
    bump: 'minor',
  },
  {
    sha: 'c246ae2a5e8dd26d65fc2e6ac6514a03edc65ef0',
    subject: 'fix(github.io): narrow skill brand icon guard',
    bump: 'patch',
  },
  {
    sha: '8b262b96bee265402983837452196cca7be05dff',
    subject: 'feat(github.io): add neutral skill token variant',
    bump: 'minor',
  },
  {
    sha: '7a9bea4fd64b87ab1e66723e1acc69128c5731cd',
    subject: 'feat(github.io): label capability evidence rows',
    bump: 'minor',
  },
  {
    sha: '8699576fbfe18df85bda2801ccf191d6c3c15550',
    subject: 'feat(github.io): order CI skills chronologically',
    bump: 'minor',
  },
  {
    sha: '928073be5402a51f15be22f50bd4894ccd740b3b',
    subject: 'fix(github.io): use singular Experience label',
    bump: 'patch',
  },
  {
    sha: '50c989310a880297db20c2a39418d3df27681203',
    subject: 'feat(github.io): add continuous delivery evidence',
    bump: 'minor',
  },
  {
    sha: '7d40622f840a8504f95955a3bc7987e9212734f3',
    subject: 'feat(github.io): add continuous delivery skills',
    bump: 'minor',
  },
  {
    sha: '1e606b3830712b2e83e984661d66ef0a41ae02e1',
    subject: 'feat(github.io): add Amazon EKS skill branding',
    bump: 'minor',
  },
  {
    sha: '96263bf656cbe060651c868364c37379889e186a',
    subject: 'feat(github.io): curate continuous delivery evidence',
    bump: 'minor',
  },
  {
    sha: 'b5ebe4a7d994cc3839278dd1738785f6b1020e3a',
    subject: 'feat(github.io): present continuous delivery evidence',
    bump: 'minor',
  },
  {
    sha: 'c2c9827e3758d6fc4cd2b8f1f7a7f82a769d6101',
    subject: 'feat(github.io): clarify experience evidence labels',
    bump: 'minor',
  },
  {
    sha: 'b85755d624505f207f03ff65071ecf0c2f39ed0d',
    subject: 'feat(github.io): clarify DORA evidence row labels',
    bump: 'minor',
  },
  {
    sha: '0bae10fc604cfa6e02e61e83a9ca85fc0581a751',
    subject: 'feat(github.io): summarize DORA capability experience',
    bump: 'minor',
  },
  {
    sha: 'f3f1d440e39c45f0a34367bfb55bca8281c06315',
    subject: 'feat(github.io): prepare shared version control evidence',
    bump: 'minor',
  },
  {
    sha: '6b13f2cb40ee58d92b22872b3abdfc060fa644d2',
    subject: 'feat(github.io): add version control evidence catalog',
    bump: 'minor',
  },
  {
    sha: '510cd3bf4f66e6cf5e2c59483068289de2de11af',
    subject: 'feat(github.io): add trunk-based evidence catalog',
    bump: 'minor',
  },
  {
    sha: '9a6608e44651cc10143eb490571bdce6e8f7975d',
    subject: 'feat(github.io): curate versioning capability cards',
    bump: 'minor',
  },
  {
    sha: '26a78aa8b536f3b84532ce1912eda5b14ca0f494',
    subject: 'fix(github.io): stabilize versioning card projections',
    bump: 'patch',
  },
  {
    sha: 'bbb4fea2f6c668eb84f1a25de459d2a67ef91a0c',
    subject: 'feat(github.io): add versioning capability stories',
    bump: 'minor',
  },
  {
    sha: 'f2ed8abea0634a21a1286948aec4648d8646d484',
    subject: 'fix(github.io): restrict Storybook runtime hosts',
    bump: 'patch',
  },
  {
    sha: 'b8f79025e5c8f53d43e26365ac73249f2c720cfa',
    subject: 'fix(github.io): keep reusable image evidence affirmative',
    bump: 'patch',
  },
  {
    sha: 'c874b37c2b835506ba3ff0ee249e9f61498ab2d9',
    subject: 'feat(github.io): prepare deployment infrastructure evidence',
    bump: 'minor',
  },
  {
    sha: '968fbccb01879122b45319c356a33afa186c4a18',
    subject: 'feat(github.io): add deployment automation evidence',
    bump: 'minor',
  },
  {
    sha: '12284d3dc91776225217a1dfe3092c2988f36c4c',
    subject: 'fix(github.io): reuse canonical deployment evidence',
    bump: 'patch',
  },
  {
    sha: '6df3412029487ba5f88e92c5bcbc2978aa60d999',
    subject: 'feat(github.io): add deployment automation skills',
    bump: 'minor',
  },
  {
    sha: '5605d6cc18222b8f8c0364fe263ee92051fefd4e',
    subject: 'fix(github.io): support deployment automation skills',
    bump: 'patch',
  },
  {
    sha: '314446b14d9d941dccf3b36a7c6f4135aa1180af',
    subject: 'feat(github.io): add flexible infrastructure evidence',
    bump: 'minor',
  },
  {
    sha: '430431f7b9fe7f4371688a47965402354df319ea',
    subject: 'fix(github.io): ground infrastructure evidence summaries',
    bump: 'patch',
  },
  {
    sha: '0acdf6a2407a56d9b143858d283c68a3fa101167',
    subject: 'feat(github.io): add flexible infrastructure skills',
    bump: 'minor',
  },
  {
    sha: 'd7f6e46cfeb05ab6c0781a59b6b9fe32456e52d6',
    subject: 'feat(github.io): curate deployment infrastructure cards',
    bump: 'minor',
  },
  {
    sha: '0585a0b9d9130a1d9e7bc2d11004ad736ffb591d',
    subject: 'fix(github.io): validate canonical evidence composition',
    bump: 'patch',
  },
  {
    sha: '33388d163b9f10df7335448d1a652685b0f1d897',
    subject: 'feat(github.io): add deployment infrastructure stories',
    bump: 'minor',
  },
  {
    sha: '83c069567e89611fa01d624b4dea1a2beb1ebd1a',
    subject: 'feat(github.io): clarify certification metadata hierarchy',
    bump: 'minor',
  },
  // Integration 52bc8c843d2b92d94c3ec637a23746cc474385c5: Merge branch 'feat/dora-remaining-capability-cards'
  {
    sha: '64d3786ff2b0a7b147adfe375533e109dbe7eb54',
    subject: 'feat(github.io): prepare remaining DORA evidence reuse',
    bump: 'minor',
  },
  {
    sha: 'b79dde0f6344e6c37b289cdc333d0bae49adf236',
    subject: 'feat(github.io): add test automation evidence',
    bump: 'minor',
  },
  {
    sha: '37f5ab2b75dd8b7d4a202b0394c7ab283863ca58',
    subject: 'feat(github.io): add test automation skills',
    bump: 'minor',
  },
  {
    sha: '74ff9b35ee93bd98246d9061d8ef26cb57f8a911',
    subject: 'feat(github.io): add pervasive security evidence',
    bump: 'minor',
  },
  {
    sha: 'f3d724f104cf8006cd4117809d7dbdad73381fc1',
    subject: 'feat(github.io): add pervasive security skills',
    bump: 'minor',
  },
  {
    sha: '4614dc4bc8ac66d624925e263f167f7b0d7e1971',
    subject: 'feat(github.io): add observability evidence',
    bump: 'minor',
  },
  {
    sha: '9f60a20f1ecccc66cf5ba6d2af3924847fd1d390',
    subject: 'feat(github.io): add observability skills',
    bump: 'minor',
  },
  {
    sha: '99366aed879298ab4c4e7b0456c4696fbb7d1622',
    subject: 'feat(github.io): add documentation quality evidence',
    bump: 'minor',
  },
  {
    sha: '2b4fda829ca872a384415fa60a3f865f6ff7bff4',
    subject: 'feat(github.io): add documentation quality skills',
    bump: 'minor',
  },
  {
    sha: '3cdd0897fb15edecddf38958aee2cdc024abd9a0',
    subject: 'feat(github.io): curate remaining DORA cards',
    bump: 'minor',
  },
  {
    sha: 'd6ae090c1f703ca023352a340e04c2ced7b14b1a',
    subject: 'feat(github.io): add remaining DORA card stories',
    bump: 'minor',
  },
  {
    sha: '784f980c893942664ee40ff8e1d76a3eef70fc8d',
    subject: 'fix(github.io): satisfy DORA formatting gate',
    bump: 'patch',
  },
  {
    sha: '1e0c17d3f96a27da6f54427ba22af37cb03df5de',
    subject: 'fix(github.io): add missing capability skill icons',
    bump: 'patch',
  },
  {
    sha: '88bd6848e65941a3c940b044fa1ad24734bdd9b6',
    subject: 'fix(github.io): correct capability skill branding',
    bump: 'patch',
  },
  {
    sha: '3e507e001fdb93e4ecb37d10c779184fd5586511',
    subject: 'fix(github.io): complete capability skill branding',
    bump: 'patch',
  },
  {
    sha: '1f0e54a001c4ba131a0058e4679a3f43e0270076',
    subject: 'fix(github.io): publish evidence metric denominators',
    bump: 'patch',
  },
  {
    sha: 'fce52bb7ea23ff5b866e5f6c919a6acd7506f843',
    subject: 'fix(github.io): emphasize DORA experience summaries',
    bump: 'patch',
  },
  {
    sha: 'da024811dc44b7c94b374c938e90c901194b28eb',
    subject: 'fix(github.io): align DORA summary typography',
    bump: 'patch',
  },
  {
    sha: 'b7c1ef5308c63651e05f0f9d7bac4ecdc94f8047',
    subject: 'fix(github.io): preserve roadmap certification compatibility',
    bump: 'patch',
  },
  {
    sha: '719286d6ded46b33f25844900112b30fbe32543f',
    subject: 'feat(github.io): add Kubernetes certification evidence',
    bump: 'minor',
  },
  {
    sha: '16d6f95ee9bd5b92dec2eee7f213539b1555498e',
    subject: 'feat(github.io): curate DORA certification evidence',
    bump: 'minor',
  },
  {
    sha: 'ead297882c146cfb9c8c28b26ed52137072422a0',
    subject: 'feat(github.io): label DORA certification rows',
    bump: 'minor',
  },
  {
    sha: '2705663b331ba88d55113bedd152ce0d260697cf',
    subject: 'feat(github.io): calculate calibrated DORA scores',
    bump: 'minor',
  },
  {
    sha: 'd52a30f0a666955f0df4baa3fcea718cdd490a3b',
    subject: 'feat(github.io): derive Radar scores from card evidence',
    bump: 'minor',
  },
  {
    sha: '682cf0aaf51422770cfa00b27b67e972df9e3e37',
    subject: 'feat(github.io): show half-step DORA Radar scale',
    bump: 'minor',
  },
  {
    sha: 'a4b6ea7e66af5a978cf3ee15173a25200a42b541',
    subject: 'feat(github.io): sharpen DORA Radar grid',
    bump: 'minor',
  },
  {
    sha: '192561929abd6d336bcaf82e1d4ba5ec3715de76',
    subject: 'feat(github.io): add homelab project card',
    bump: 'minor',
  },
  {
    sha: '53837abca705aeca3fd9df1dc526bb4180a7c049',
    subject: 'feat(github.io): finalize homelab card title',
    bump: 'minor',
  },
  {
    sha: '43f340a1d41382a2da795c557bc5b1bbffa7af0d',
    subject: 'feat(github.io): add homelab skill logos',
    bump: 'minor',
  },
  {
    sha: 'bd50ecbbf4a3e1d596e4f5ff346c1c111f6fd4f0',
    subject: 'feat(github.io): complete project skill logos',
    bump: 'minor',
  },
  {
    sha: '180564bcdaa8abec86cd4c131f8c167b56aa7e9b',
    subject: 'fix(github.io): use exact Amazon S3 brand',
    bump: 'patch',
  },
  {
    sha: '0cd6a7d1e9a060b636129ee9d6f63813825c9633',
    subject: 'feat(github.io): classify skill token surfaces',
    bump: 'minor',
  },
  {
    sha: 'a9b02814d081548d85a4d8af92237debce104668',
    subject: 'feat(github.io): default unbranded skills to neutral',
    bump: 'minor',
  },
  {
    sha: '0ac0334af901cc3e52f1edb2642e2b206d75bee5',
    subject: 'feat(github.io): resolve skill detail evidence',
    bump: 'minor',
  },
  {
    sha: '9d6865d922178154beef5ab7694ee11388e13aae',
    subject: 'feat(github.io): add skill detail surface',
    bump: 'minor',
  },
  {
    sha: '4fc9b28767891568146a91b8f50064db9f341ea9',
    subject: 'feat(github.io): route skill detail pages',
    bump: 'minor',
  },
  {
    sha: '3b9449769f6893a4d157c45cc3f7ab629c946771',
    subject: 'feat(github.io): refine skill experience summary',
    bump: 'minor',
  },
  {
    sha: '379fb0840aefe96d8c8c9588ba0983b773b114a9',
    subject: 'feat(github.io): present skill evidence as blockquotes',
    bump: 'minor',
  },
  {
    sha: '8bab3d436da7287ee1087fe340970f649c8fec7a',
    subject: 'feat(github.io): consolidate skill detail metadata',
    bump: 'minor',
  },
  {
    sha: 'f739e6ed019391280ad295bb9cedfb1cfd467031',
    subject: 'fix(github.io): restore accessible Ansible token contrast',
    bump: 'patch',
  },
  {
    sha: '16d60c2fd3a995c9a50dd7221460f4fbb2049b22',
    subject: 'fix(github.io): reject duplicate project sources',
    bump: 'patch',
  },
  {
    sha: '41cd07ab9cf993b799f14fb8c40b7751378a9e0e',
    subject: 'fix(github.io): use basic Astryx skill metadata',
    bump: 'patch',
  },
  {
    sha: 'e313e5f9b69b62efc360abbc5f48c6286166b37d',
    subject: 'fix(github.io): restore Astryx breadcrumb colors',
    bump: 'patch',
  },
  {
    sha: '50949c414cbfbec3a8ac97134c212c83fbcc5742',
    subject: 'fix(github.io): group skill experience blockquotes',
    bump: 'patch',
  },
  {
    sha: '326ffc350150c6931b6fb9eb54d51676ebe1f849',
    subject: 'fix(github.io): separate experience blockquote borders',
    bump: 'patch',
  },
  {
    sha: '92d4140df860586bae3fd22a99db5dfb4bdccd34',
    subject: 'feat(github.io): add muted skill metadata card',
    bump: 'minor',
  },
  {
    sha: 'b35fc39c67612a9f5c8347869e9f993c23ebabc9',
    subject: 'fix(github.io): restrict skill evidence to experience',
    bump: 'patch',
  },
  // Integration d9aa0cd66f25535c6935aa58cd8e769c04883919: chore(github.io): reconcile skill detail with main
  {
    sha: '6fa8460fc6cfedc81050f6eb962293c34da6d29a',
    subject: 'feat(github.io): establish home page skill search',
    bump: 'minor',
  },
  {
    sha: 'bb5490d67de2a49f3362290875d34b5813054ecf',
    subject: 'feat(github.io): showcase DORA capabilities on home',
    bump: 'minor',
  },
  {
    sha: '0ada994ee62ad0985e7eb9f08076ddec2d04dffb',
    subject: 'fix(github.io): align home page capability actions',
    bump: 'patch',
  },
  {
    sha: '5e59f207b061a2401f40e1f8d0e59650f541bcb0',
    subject: 'fix(github.io): shorten home page DORA CTA',
    bump: 'patch',
  },
  {
    sha: '286600f8b8417e7a638980c3417595a6e21436e0',
    subject: 'fix(github.io): restore selected skill transition',
    bump: 'patch',
  },
  // Integration f6bf44bf547572dff255da98dc6ad0ca09d0b99c: Merge branch 'chore/astryx-codex-agent-docs'
  {
    sha: 'e08938586a9f1b4fcd5cb7918143b17dc455cacd',
    subject: 'feat(github.io): verify Astryx agent context',
    bump: 'minor',
  },
  {
    sha: '3bbf9c6d17a15ba4385ff1f17f0f136b8bf969b1',
    subject: 'fix(github.io): forward Astryx refresh args',
    bump: 'patch',
  },
  {
    sha: '4ea014dd0d2d8213bbbfe3cf58b8e1d2881762fd',
    subject: 'fix(github.io): enforce Astryx styling guidance',
    bump: 'patch',
  },
  {
    sha: 'fb1b11c56eb13acfb397855350142618933a2915',
    subject: 'fix(github.io): harden Astryx doc refresh',
    bump: 'patch',
  },
  {
    sha: 'dd50c545166fd64897341be88b65ac9b3152cf50',
    subject: 'fix(github.io): repair malformed Astryx docs',
    bump: 'patch',
  },
  {
    sha: '842c08a799d3b56f48501d5ae251049a1d92022e',
    subject: 'fix(github.io): fail closed on malformed Astryx docs',
    bump: 'patch',
  },
  {
    sha: '0fea532155e7a02692a51e7098c8efd87ea8a0dc',
    subject: 'fix(github.io): detect tab-stop Astryx indentation',
    bump: 'patch',
  },
  {
    sha: 'c5d479997186f5d19fb1208b06e1ec5124f02f7d',
    subject: 'fix(github.io): harden Astryx agent doc refresh',
    bump: 'patch',
  },
  {
    sha: '3a005afcd0cb4c28a235dffb1f2bdbc8b3091c85',
    subject: 'fix(github.io): detect CommonMark marker containers',
    bump: 'patch',
  },
  {
    sha: '7f15472c350ac42324d61076989754c26b5901a7',
    subject: 'fix(github.io): detect type 7 HTML marker containers',
    bump: 'patch',
  },
  {
    sha: 'decd5960213e365c05a4154d571ad00906ab1f67',
    subject: 'fix(github.io): respect paragraph HTML boundaries',
    bump: 'patch',
  },
  {
    sha: '511219c79e12d477a29e8c153ad5be1b9fb48783',
    subject: 'fix(github.io): model Markdown leaf boundaries',
    bump: 'patch',
  },
  {
    sha: 'ca244b39d37607ec4c9857c3977dcb4d970031a5',
    subject: 'fix(github.io): distinguish muted skill metadata',
    bump: 'patch',
  },
  {
    sha: 'caf627dd44b9a00e4d3c49962237c7e4688c2307',
    subject: 'feat(github.io): support linked skill rows',
    bump: 'minor',
  },
  {
    sha: '15244121ea83f72d92d1a2f291d8875d7098f6dd',
    subject: 'feat(github.io): add skills page',
    bump: 'minor',
  },
  {
    sha: 'd7613e1b6cfff66095de69ddcc6a1bf45ad35d94',
    subject: 'feat(github.io): route skills collection',
    bump: 'minor',
  },
  {
    sha: '7d4b267111595d0517bd9b832ebb7d53825e16d3',
    subject: 'feat(github.io): link carousel to skills page',
    bump: 'minor',
  },
  {
    sha: '592ac9beeb601c7135d4d462a5e598c7c64eb844',
    subject: 'fix(github.io): align skills page with Astryx',
    bump: 'patch',
  },
  {
    sha: '2309b5ded4f22dab7538a6841e27e29f9a9baffb',
    subject: 'feat(github.io): model global search results',
    bump: 'minor',
  },
  {
    sha: '423c757b65a140ab0c0b0cf8c9607816150ce72b',
    subject: 'feat(github.io): add global search navigation',
    bump: 'minor',
  },
  {
    sha: '2426d85eca958f9b1acd59c678efb21156ab9d2a',
    subject: 'fix(github.io): avoid nested route scrolling',
    bump: 'patch',
  },
  {
    sha: '73d9993c6786afec36c7550a80339414fe8b7a9f',
    subject: 'fix(github.io): emit global frame layout styles',
    bump: 'patch',
  },
  {
    sha: 'f85d9dafc40a58e8cc6298a75d2b1f28cc567bf6',
    subject: 'fix(github.io): label skills page landmark',
    bump: 'patch',
  },
  {
    sha: 'ef145a08356838b92161e92007954bffa0255d3e',
    subject: 'fix(github.io): use full-width mobile layout',
    bump: 'patch',
  },
  {
    sha: 'd3558d05d22af9d749c50e5035f7c91d81de2465',
    subject: 'fix(github.io): keep unknown skills full width',
    bump: 'patch',
  },
  {
    sha: '6b6384620760e31a89955bffc39b6ca7736c03eb',
    subject: 'fix(github.io): resolve mobile layout review findings',
    bump: 'patch',
  },
  {
    sha: 'ff1210f6464bd455eb1b78aba07ad9caf6b22187',
    subject: 'fix(github.io): make skill links cover full rows',
    bump: 'patch',
  },
  {
    sha: '8d841572cd45fdad87ed77e9476e2856c0000444',
    subject: 'fix(github.io): harden mobile layout verifier',
    bump: 'patch',
  },
  {
    sha: 'de84421e5ab0f00cccc0226d7f0ee649201c2345',
    subject: 'fix(github.io): enforce full-width page roots',
    bump: 'patch',
  },
  {
    sha: '29d98dfe7760cc1a7867f9b3c929aadeca7c9148',
    subject: 'fix(github.io): scroll Home sections together',
    bump: 'patch',
  },
  {
    sha: 'c445f48d39334a1958575fe51d257eec5849b6df',
    subject: 'fix(github.io): reduce skill list avatar size',
    bump: 'patch',
  },
  // Integration 0bcd26cffe008113ef5cccf5692eb4b9c6030714: chore(github.io): integrate main into skills page
  {
    sha: '072c73e9b61959ae6c34a266a945393040b45d71',
    subject: 'feat(github.io): link skill cards to details',
    bump: 'minor',
  },
  {
    sha: '4c2b767d0c176b6f10080b45c57ae304f695cbec',
    subject: 'feat(github.io): make home navigation route-authoritative',
    bump: 'minor',
  },
  {
    sha: 'fc57db657c9da2fdb162bfe38b8f41fcf5715596',
    subject: 'fix(github.io): assert command palette route path',
    bump: 'patch',
  },
  {
    sha: '9874a4c37cf7a8079515fe0cd26bc2a1bc7c9a09',
    subject: 'feat(github.io): expand skill breadcrumbs',
    bump: 'minor',
  },
  {
    sha: '93f1ec918aff804003bc11615458391c78082fc5',
    subject: 'fix(github.io): render skill routes in Storybook',
    bump: 'patch',
  },
  // Integration 299f1173f3b91d5a04ba865e8d86d0480e3b97e7: feat(github.io): integrate roadmap page
  {
    sha: '83dfb4c212a447da8af5fe0425b06cf7e8ab52e9',
    subject: 'feat(github.io): add DevOps roadmap page',
    bump: 'minor',
  },
  {
    sha: '6d43ec6b444b14aa893c5d313a45ef8edd3cc3d2',
    subject: 'feat(github.io): route DevOps roadmap page',
    bump: 'minor',
  },
  {
    sha: '4451e57eb625793681f12489adb148f1fdeb251c',
    subject: 'fix(github.io): center DevOps roadmap page',
    bump: 'patch',
  },
  {
    sha: '9492930a30463ffcdb6bc82585d84f318c2e50bd',
    subject: 'fix(github.io): use full-width mobile roadmap',
    bump: 'patch',
  },
  {
    sha: 'ebfcb501563073266cdab5c517865f7d32ef7d61',
    subject: 'fix(github.io): center roadmap diagram',
    bump: 'patch',
  },
  {
    sha: '274dec718b21261bd29d0e43949827a90dd7850b',
    subject: 'feat(github.io): add top navigation links',
    bump: 'minor',
  },
  {
    sha: '1bea5bbe7b565d701f3b58f59000194286ee9c53',
    subject: 'fix(github.io): prevent nested story routers',
    bump: 'patch',
  },
  {
    sha: 'ec5e32ff39cbd937f3e9b9c5097e930fd031d954',
    subject: 'fix(github.io): restore shell content scrolling',
    bump: 'patch',
  },
  {
    sha: '10fca6d348714762c8eeee3f1df7876e7a6ee6a8',
    subject: 'fix(github.io): use shell scroll ownership',
    bump: 'patch',
  },
  {
    sha: '19c5d878be64add3ab977d538bcddf01776b5f88',
    subject: 'fix(github.io): align layout verifiers with shell scrolling',
    bump: 'patch',
  },
  {
    sha: '070c9c495b06a2a2cbfdcf23a712ec91f957076e',
    subject: 'fix(github.io): reset shell scroll on navigation',
    bump: 'patch',
  },
  {
    sha: '21ea0c25805005e9cc4c6eacf6c96ba2a274a151',
    subject: 'fix(github.io): verify client-side scroll reset',
    bump: 'patch',
  },
  {
    sha: '404199a690813aa55982e713cf5dfbaadfaa77d9',
    subject: 'fix(github.io): harden layout ownership verifier',
    bump: 'patch',
  },
  {
    sha: 'b6e8d91ad1e5c61c641f4264c81967d1c52dc54d',
    subject: 'fix(github.io): expand DORA cards to full width',
    bump: 'patch',
  },
  // Integration 6bce846e51e5b5ec6142894aa513b437ec804cce: Merge branch 'feat/home-modern-navigation'
  {
    sha: '007f09c0294f0b1e4977e85dfbd1021ac6f75055',
    subject: 'feat(github.io): add icon home navigation',
    bump: 'minor',
  },
  {
    sha: 'dfecd3bd27d5a41206916efbb1a157d0e79e9ce3',
    subject: 'fix(github.io): color home navigation icon blue',
    bump: 'patch',
  },
  {
    sha: '1d7f1b41cbbab9cc4f57aae50a1985578ce70e68',
    subject: 'fix(github.io): apply blue to home heroicon',
    bump: 'patch',
  },
  {
    sha: 'e11469ff4ab8ff43d2446adca6339dad586bc0ad',
    subject: 'fix(github.io): use Astryx blue for home icon',
    bump: 'patch',
  },
  {
    sha: '8820787ed1c0dddbae5f29c774fec10e93d613cd',
    subject: 'fix(github.io): show skills before roadmap in nav',
    bump: 'patch',
  },
  {
    sha: '834474a7d21291fc1644bae0f6c6ebe2bf14bbda',
    subject: 'feat(github.io): add devops roadmap skill inventory',
    bump: 'minor',
  },
  {
    sha: '0bede0a8cd1ad2dae74112328bb70536b2631e06',
    subject: 'feat(github.io): add GitHub nav icon',
    bump: 'minor',
  },
  {
    sha: '6dd4f8d0d8f030980e51888222f8dfe6e6655aed',
    subject: 'fix(github.io): align roadmap label hierarchy',
    bump: 'patch',
  },
  {
    sha: 'bf4cafe68df5ace0b5e4051ed117e2f498a7030a',
    subject: 'feat(github.io): render skills page as cards',
    bump: 'minor',
  },
  {
    sha: '9895686f826a567694f8150894abb76f2b40fadf',
    subject: 'fix(github.io): make project cards full width',
    bump: 'patch',
  },
  {
    sha: '1f2b2cda9b07fde35685883e0e597c9602028d78',
    subject: 'feat(github.io): show skill confidence tokens',
    bump: 'minor',
  },
  {
    sha: '913969588e8874fbd16b693aad4b01715f0809d0',
    subject: 'feat(github.io): explain skill confidence values',
    bump: 'minor',
  },
  {
    sha: '0dd3bf1c5982c77883033dae6dbfc9661160180d',
    subject: 'fix(github.io): link skill tokens to detail pages',
    bump: 'patch',
  },
  {
    sha: 'c84b2c616a63c278fb1a53184146381f67923a03',
    subject: 'feat(github.io): add global search result groups',
    bump: 'minor',
  },
  {
    sha: '0ff1150a0a54489abf459605b68fc0b7974fe2cb',
    subject: 'feat(github.io): add Astryx attribution footer',
    bump: 'minor',
  },
  {
    sha: '9aad3bef6741fd0df6ce222e37cab32a41447b0d',
    subject: 'feat(github.io): add React footer attribution',
    bump: 'minor',
  },
  // Integration 05295dfc8599ae99c958f5732b472468278a0061: Merge branch 'feat/github-io-mobile-drawer-navigation'
  {
    sha: 'c91d71536232a47ebfaefdcadef4715b9c5812df',
    subject: 'feat(github.io): add mobile drawer navigation',
    bump: 'minor',
  },
  {
    sha: 'be42d298a1fdaf4b06f7cc90f5d4a5c413c2ffa8',
    subject: 'fix(github.io): place navigation after github',
    bump: 'patch',
  },
  {
    sha: '28ef846f91e30926a8848fa897f468c49ff5aa70',
    subject: 'fix(github.io): stabilize drawer browser verification',
    bump: 'patch',
  },
  {
    sha: 'd22bf5a8fc6837f135f2f3b2729f956bdc748b61',
    subject: 'feat(github.io): add session-aware home greeting',
    bump: 'minor',
  },
  {
    sha: '1388dc2d03556d37abf834697a6294025e8609e8',
    subject: 'fix(github.io): open global GitHub link in new tab',
    bump: 'patch',
  },
  {
    sha: '6a16830f953356aa6316c5b0129751038aa6abd9',
    subject: 'fix(github.io): restore skill confidence tooltip',
    bump: 'patch',
  },
  // Integration 8314aaa5b4c3d35120f83b22439934385b157d35: Merge branch 'research/storybook-story-organization'
  {
    sha: '381ca5349acbed331b3eaeb31ff0c8eeeb78f31d',
    subject: 'fix(github.io): complete Storybook review fixes',
    bump: 'patch',
  },
  {
    sha: '6c2b5e7a48294c20e3b2d250df970d4cdd0f0bf1',
    subject: 'fix(github.io): update home layout verifier path',
    bump: 'patch',
  },
  // Integration 55b83a72cb66749250138c7ba9eec5d4c5a7eaed: Merge branch 'docs/github-pages-release-research'
  {
    sha: '34b88af2c910fb7841279d9ac968a0b99a2608a7',
    subject: 'fix(github.io): support root Pages deployment',
    bump: 'patch',
  },
  {
    sha: 'bf32e67324d52d5f6458440afa94a61f42c8d196',
    subject: 'feat(github.io): synchronize Pages artifacts safely',
    bump: 'minor',
  },
  {
    sha: '00f3de28e20edc2ecdaf88fe73efb9c465582183',
    subject: 'fix(github.io): preserve Git metadata during artifact sync',
    bump: 'patch',
  },
  {
    sha: 'd7a66c9ad7ab81dbda3a70c563e4e86f06f7d626',
    subject: 'fix(github.io): disable source checkout credentials',
    bump: 'patch',
  },
  {
    sha: 'a9621bc17e2784dacd73544abd6ef18bd17301ab',
    subject: 'fix(github.io): harden artifact release workflows',
    bump: 'patch',
  },
  {
    sha: '171d3b7b470ad815b54e50760bf153e7f21dafef',
    subject: 'fix(github.io): use a valid deploy secret name',
    bump: 'patch',
  },
  {
    sha: '2262260121b2ff92ff1b1da1ad323dfe34966ff8',
    subject: 'feat(github.io): add persistent theme toggle',
    bump: 'minor',
  },
  {
    sha: '34c19ecb16d54a01b5d63a989dc77a7fe27444f5',
    subject: 'fix(github.io): use Astryx heading type scale',
    bump: 'patch',
  },
  {
    sha: '224c26314dedf49a408deb2fc24502e9ae18a60d',
    subject: 'feat(github.io): show app version in footer',
    bump: 'minor',
  },
  {
    sha: '7f0cf2892299fbf6101dbcc2277c64a3b205f5b6',
    subject: 'feat(github.io): calculate releases from scoped commits',
    bump: 'minor',
  },
  {
    sha: '0887793f3a40eb4675bd9f6fd0f32706be5ee44c',
    subject: 'fix(github.io): preserve strict version precision',
    bump: 'patch',
  },
  {
    sha: '03dc19d6979f959c2e2b2676e7a1209b0473e618',
    subject: 'feat(github.io): add resumable release coordinator',
    bump: 'minor',
  },
  {
    sha: '6c1f16bf900940fce85a4a2ba144e37f05a1b03b',
    subject: 'feat(github.io): embed release version at build time',
    bump: 'minor',
  },
  {
    sha: 'caa5642b6342ba00cf46fab9fb0a4a2496f02dd0',
    subject: 'fix(github.io): prevent stale pages deployments',
    bump: 'patch',
  },
];

test('repository bootstrap replays the reviewed introduction-to-HEAD history', () => {
  const result = bootstrapRelease({ cwd, start: '8acdd81', target: 'HEAD' });

  assert.equal(result.newVersion, '0.142.1');
  assert.equal(result.previousVersion, '0.0.0');
  assert.equal(result.tag, 'github.io@0.142.1');
  assert.equal(result.action, 'prepare');
  assert.equal(result.bootstrap, true);
  assert.deepEqual(result.commits, reviewedCommits);
});
