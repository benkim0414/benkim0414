const {
  default: JsVersionActions,
  afterAllProjectsVersioned,
} = require('@nx/js/src/release/version-actions');

// Nx's bootstrap disk fallback normally reads the source manifest. This app
// deliberately has no source version, so read only the coordinator's staging
// manifest. Normal releases still resolve their current version from Git tags.
class GithubIoVersionActions extends JsVersionActions {
  async readCurrentVersionFromSourceManifest(tree) {
    const manifestPath = 'dist/release-manifests/github.io/package.json';
    return {
      manifestPath,
      currentVersion: JSON.parse(tree.read(manifestPath, 'utf8')).version,
    };
  }
}

module.exports = { default: GithubIoVersionActions, afterAllProjectsVersioned };
