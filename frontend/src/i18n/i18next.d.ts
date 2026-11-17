import 'i18next';
import type en from './locales/en.json';

// Typed translation keys: using a key that does not exist in en.json is a build error.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
    returnNull: false;
  }
}
