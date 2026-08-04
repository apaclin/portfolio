export const defaultResponsiveWidths = [480, 800, 1200, 1600] as const;

/**
 * Ширины, на которые «защёлкивается» борд кейса на десктопе.
 *
 * Резкость даёт ровно одно: интринсик-ширина выбранного файла должна совпасть с
 * шириной отрисовки 1:1. При `sizes: 100vw` совпадение случалось только когда
 * ширина окна случайно попадала на ступень лесенки (1440, 1920) — в fullscreen
 * борд был резкий, а в любом промежуточном размере браузер ужимал 1920 → 1700 и
 * т.п., и тонкий светлый текст на тёмном плыл.
 *
 * Поэтому борд не тянется за окном, а встаёт на ближайшую ступень ВНИЗ и
 * центрируется; зазор до края закрывает фон кейса. Шаг 160px → максимальное
 * поле 80px на сторону. Кроп (ступень вверх + overflow) дал бы то же качество
 * без полей, но резал бы содержимое бордов по краям — у Bergström это мокапы
 * сайта во всю ширину, там по краям живой контент.
 */
export const caseSnapWidths = [
  1280, 1440, 1600, 1760, 1920, 2560,
] as const;

/**
 * Case boards are very tall 3840px exports. Generating every common monitor
 * width in both AVIF and WebP made a cold production build create 700 files and
 * exceed Vercel's 45-minute limit. Лесенка обязана содержать КАЖДУЮ ступень
 * снапа (иначе снап бессмысленен: браузер возьмёт кандидата крупнее и ужмёт
 * его), плюс 480/960 на фулл-флюидный мобильный диапазон и 3840 как 2x к 1920.
 *
 * Три добавленные ступени (1280/1600/1760) стоят +75 трансформаций на 25 бордов.
 * Замер на самом тяжёлом борде (slice-06, 3840×4664, 11MB): ~0.6s на файл, то
 * есть меньше минуты к холодной сборке даже без учёта параллелизма. До лимита
 * далеко, но при дальнейшем уплотнении лесенки считать заново.
 */
export const caseSliceWidths = [
  480, 960, 1280, 1440, 1600, 1760, 1920, 2560, 3840,
] as const;

/**
 * `sizes` под снап: ступени идут от большей к меньшей, потому что браузер берёт
 * первое подошедшее условие. Ниже самой мелкой ступени борд флюидный (100vw) —
 * на мобильных и планшетах полей быть не должно.
 */
export function caseSnapSizes(): string {
  return [
    ...[...caseSnapWidths]
      .reverse()
      .map((width) => `(min-width: ${width}px) ${width}px`),
    '100vw',
  ].join(', ');
}

/**
 * Те же ступени, что и в `caseSnapSizes`, но как CSS. Генерим из одного массива,
 * чтобы разметка и `sizes` не разъехались: любое расхождение возвращает дробное
 * масштабирование, ради устранения которого всё и делается.
 *
 * Базовое правило отдаём здесь же — ширину борда не должен задавать никто
 * больше. Иначе всё упирается в порядок стилей в <head> (у медиа-запроса и у
 * `width:100%` одинаковая специфичность), а он не гарантирован.
 */
export function caseSnapCss(selector: string): string {
  return [
    `${selector}{width:100%;margin-inline:auto}`,
    ...caseSnapWidths.map(
      (width) => `@media (min-width:${width}px){${selector}{width:${width}px}}`,
    ),
  ].join('');
}

export function cappedImageWidths(
  sourceWidth: number,
  requestedWidths?: readonly number[],
): number[] {
  const requested =
    requestedWidths && requestedWidths.length > 0
      ? requestedWidths
      : defaultResponsiveWidths;
  const validRequested = requested.filter(
    (width) => Number.isFinite(width) && width > 0,
  );

  if (validRequested.length === 0) {
    return [sourceWidth];
  }

  const cap = Math.min(sourceWidth, Math.max(...validRequested));

  return [
    ...new Set([
      ...validRequested.filter((width) => width < cap),
      cap,
    ]),
  ].sort((a, b) => a - b);
}

export function cappedZoomWidth(
  sourceWidth: number,
  logicalWidth: number,
): number {
  return Math.min(sourceWidth, logicalWidth * 2);
}
