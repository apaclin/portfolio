export const locales = ['en', 'ru'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && locales.some((locale) => locale === value);
}

export function resolveLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function alternateLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ru' : 'en';
}
