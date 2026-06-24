import { ui } from './ui';

const locales = Object.keys(ui);

/**
 * Возвращает «логический путь» страницы без языкового префикса.
 * '/ru/about' → 'about', '/about' → 'about', '/ru/' → '', '/' → ''.
 * Используется для построения парных ссылок (переключатель, hreflang).
 */
export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] && locales.includes(segments[0])) {
    segments.shift();
  }
  return segments.join('/');
}
