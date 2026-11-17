import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

/**
 * All user-facing text lives in src/i18n/locales/<language>.json.
 *
 * To add a language: copy en.json to e.g. fr.json, translate the values (keep the keys), import it here and add it to
 * `resources` and `SUPPORTED_LANGUAGES`. The language switcher in the user menu then offers it automatically.
 */
export const SUPPORTED_LANGUAGES = [{ code: 'en', label: 'English' }] as const;

const STORAGE_KEY = 'staffing-hub.language';

function initialLanguage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some((language) => language.code === stored)) return stored;
  } catch {
    // Storage can be unavailable (private mode): fall back to English.
  }
  return 'en';
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function changeLanguage(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Ignore: the choice just will not be remembered.
  }
  void i18n.changeLanguage(code);
}

export default i18n;
