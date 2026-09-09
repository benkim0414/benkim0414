import { SCOPES } from './scripts/commit-scope-policy.mjs';

export default {
  extends: ['@commitlint/config-conventional'],
  rules: { 'scope-enum': [2, 'always', SCOPES] },
};
