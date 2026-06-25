/**
 * Форматирует дату кейса в нужной локали — детерминированно и без артефактов.
 *
 * timeZone:'UTC' — frontmatter `date: 2026-06-01` парсится как UTC-полночь;
 * без явного UTC на билд-машине западнее Гринвича показалась бы предыдущая дата.
 *
 * ICU 72+ (Node 20+) в части локалей/форматов вставляет узкий неразрывный пробел
 * (U+202F) или nbsp (U+00A0). Шрифт без этого глифа рисует их как «тофу»-box
 * между частями даты. Заменяем их на обычный пробел, чтобы вывод был стабилен
 * независимо от версии ICU билд-машины. Символы строим через fromCharCode,
 * чтобы в исходнике не было невидимых байтов.
 */
const ARTIFACT_SPACES = new RegExp('[' + String.fromCharCode(0x202f, 0x00a0) + ']', 'g');

export function formatDate(date: Date, locale: string): string {
  const formatted = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
  return formatted.replace(ARTIFACT_SPACES, ' ');
}
