import {
  defaultLocale,
  resolveLocale,
  type Locale,
} from '../lib/i18n';

// Словарь UI-строк. Английский — основной язык и источник набора ключей.
export const defaultLang = defaultLocale;

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.cases': 'Cases',
    'action.readMore': 'Read more',
    'action.switchLang': 'Русский',
    'meta.siteName': 'Portfolio',
    'meta.description': 'Personal portfolio',
    'notice.fallbackToEn':
      'This page is only available in English — showing the English version.',
    'notice.fallbackToRu':
      'This page is only available in Russian — showing the Russian version.',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.about': 'Обо мне',
    'nav.cases': 'Кейсы',
    'action.readMore': 'Подробнее',
    'action.switchLang': 'English',
    'meta.siteName': 'Портфолио',
    'meta.description': 'Персональное портфолио',
    'notice.fallbackToEn':
      'Эта страница ещё не переведена — показана английская версия.',
    'notice.fallbackToRu':
      'Эта страница доступна только на русском — показана русская версия.',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type { Locale } from '../lib/i18n';
// Допустимые ключи строк выводятся из основного языка.
export type UiKey = keyof (typeof ui)[typeof defaultLang];

/**
 * useTranslations(Astro.currentLocale) → t(key).
 * Принимает сырое значение currentLocale (может быть undefined) и приводит
 * к поддерживаемой локали; если язык не распознан — английский по умолчанию.
 */
export function useTranslations(locale: string | undefined) {
  const lang: Locale = resolveLocale(locale);
  return function t(key: UiKey): string {
    return ui[lang][key];
  };
}
