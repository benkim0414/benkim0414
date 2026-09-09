declare const __APP_RELEASE__: boolean;
declare const __APP_VERSION__: string;

export const appVersion =
  typeof __APP_RELEASE__ !== 'undefined' && __APP_RELEASE__
    ? __APP_VERSION__
    : 'dev';
