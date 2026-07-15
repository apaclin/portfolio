import { locales } from '../lib/i18n';

/**
 * Возвращает «логический путь» страницы без языкового префикса.
 * '/ru/about' → 'about', '/about' → 'about', '/ru/' → '', '/' → ''.
 * Используется для построения парных ссылок (переключатель, hreflang).
 */
export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && locales.some((locale) => locale === segments[0])) {
    segments.shift();
  }
  return segments.join('/');
}
