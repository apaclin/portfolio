// Словарь UI-строк. Английский — основной язык и источник набора ключей.
export const defaultLang = 'en' as const;

export const ui = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.cases': 'Cases',
    'action.readMore': 'Read more',
    'action.switchLang': 'Русский',
    'meta.siteName': 'Portfolio',
    'meta.description': 'Personal portfolio',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.about': 'Обо мне',
    'nav.cases': 'Кейсы',
    'action.readMore': 'Подробнее',
    'action.switchLang': 'English',
    'meta.siteName': 'Портфолио',
    'meta.description': 'Персональное портфолио',
  },
} as const;

// Поддерживаемые локали словаря: 'en' | 'ru'.
export type Locale = keyof typeof ui;
// Допустимые ключи строк выводятся из основного языка.
export type UiKey = keyof (typeof ui)[typeof defaultLang];

/**
 * useTranslations(Astro.currentLocale) → t(key).
 * Принимает сырое значение currentLocale (может быть undefined) и приводит
 * к поддерживаемой локали; если язык не распознан — английский по умолчанию.
 */
export function useTranslations(locale: string | undefined) {
  const lang: Locale = locale && locale in ui ? (locale as Locale) : defaultLang;
  return function t(key: UiKey): string {
    return ui[lang][key];
  };
}
