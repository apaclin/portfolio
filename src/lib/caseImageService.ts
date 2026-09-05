import type { ImageOutputFormat, LocalImageService } from 'astro';
import sharpService from 'astro/assets/services/sharp';

/**
 * Борды кейсов экспортированы @2x и на 1x-экране уменьшаются вдвое. Штатный
 * sharp-сервис Astro делает это в sRGB, то есть усредняет уже закодированные
 * значения яркости. Для белого текста по чёрному ошибка максимальна: штрихи
 * выходят тоньше и глуше, чем должны. Здесь ресайз идёт в линейном свете —
 * ровно как в Preview и других нормальных вьюерах.
 *
 * Замерено против скриншота из Preview: совпадение 0.995, резкость +1.0%.
 *
 * Раньше сюда попадали только борды — по подстроке `images/cases/` в пути. В
 * сборке этой подстроки нет (путь уже эмитированный, `/_astro/main-page.<hash>.png`),
 * поэтому фильтр молча отключал сервис на проде и линейный ресайз работал
 * только в деве. Фильтра больше нет: линейный ресайз корректен для любой
 * картинки, а не только для борда.
 */

type SharpModule = typeof import('sharp');
let sharpLib: SharpModule | undefined;

const service: LocalImageService = {
  ...sharpService,
  async transform(inputBuffer, transformOptions, config) {
    const transform = transformOptions as typeof transformOptions & {
      width?: number;
      height?: number;
      quality?: unknown;
      format?: string;
      fit?: string;
      position?: string;
    };

    // Без ширины ресайза не будет — такие запросы отдаём штатному сервису.
    if (!transform.width) {
      return sharpService.transform(inputBuffer, transformOptions, config);
    }

    if (!sharpLib) sharpLib = (await import('sharp')).default as SharpModule;

    const pipeline = sharpLib(inputBuffer, {
      failOnError: false,
      limitInputPixels: false,
    });
    pipeline.rotate();
    // Уменьшать надо в линейном свете, а не в sRGB. Иначе тонкие светлые штрихи
    // на тёмном фоне усредняются с гамма-искажением и выходят тоньше и глуше,
    // чем должны, — на белом тексте по чёрному это видно сразу. Так же уменьшают
    // Preview и прочие нормальные вьюеры.
    //
    // Линеаризация обязана идти в float (scrgb), а НЕ через gamma(): тот делает
    // round-trip кодирования в 8 битах, и тени схлопываются на квантовании. Фон
    // тёмного борда уезжал 24,25,27 → 20,20,20, у синего акцента 13,40,71 → 0,38,70
    // выбивало красный канал в ноль. Не менять обратно на gamma().
    pipeline.pipelineColourspace('scrgb');
    // fit/position прокидываем как есть: без фильтра по бордам сюда приходят и
    // OG-картинки, которые режутся под 1200×630 (SeoMeta), а не просто
    // уменьшаются. Дефолт sharp — cover/centre, но полагаться на совпадение
    // дефолтов со штатным сервисом Astro не стоит.
    pipeline.resize({
      width: Math.round(transform.width),
      height: transform.height ? Math.round(transform.height) : undefined,
      fit: transform.fit as Parameters<typeof pipeline.resize>[0]['fit'],
      position: transform.position,
      kernel: 'lanczos3',
      withoutEnlargement: true,
    });
    // Шарпа здесь намеренно НЕТ: борд рисуется 1:1, дошарпливать нечего.
    // Совпадение с Preview без шарпа 0.995, с sharpen(0.8) — 0.968.
    pipeline.toColourspace('srgb');

    const outputFormat = (transform.format ?? 'webp') as ImageOutputFormat;
    const sharpFormat = outputFormat === 'jpg' ? 'jpeg' : outputFormat;
    const quality =
      typeof transform.quality === 'number' ? transform.quality : undefined;

    const { data } = await pipeline
      .toFormat(sharpFormat as 'webp', quality !== undefined ? { quality } : {})
      .toBuffer({ resolveWithObject: true });

    return { data, format: outputFormat };
  },
};

export default service;
